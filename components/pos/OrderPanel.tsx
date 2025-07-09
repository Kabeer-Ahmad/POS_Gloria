'use client'

import { useState } from 'react'
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, DollarSign, Printer, Download, Lock } from 'lucide-react'
import { usePosStore, useTableCart, useTableOrder, calculateGST, Order } from '@/lib/store'
import AdminPasswordPrompt from '@/components/auth/AdminPasswordPrompt'
import toast from 'react-hot-toast'

interface OrderPanelProps {
  onPaymentComplete: (order: Order) => void
}

export default function OrderPanel({ onPaymentComplete }: OrderPanelProps) {
  const { 
    selectedTable, 
    staff, 
    updateTableCartItem, 
    removeFromTableCart, 
    clearTableCart, 
    holdTableOrder,
    payTableOrder,
    setCurrentView,
    saveCompletedOrder
  } = usePosStore()

  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)
  
  // Admin password prompt state
  const [adminPrompt, setAdminPrompt] = useState<{
    isOpen: boolean
    action: string
    onSuccess: () => void
  }>({
    isOpen: false,
    action: '',
    onSuccess: () => {}
  })

  const cartItems = useTableCart(selectedTable)
  const currentOrder = useTableOrder(selectedTable)

  if (!selectedTable || !currentOrder) {
    return (
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 p-6 flex items-center justify-center">
        <p className="text-gray-500">Select a table to view order</p>
      </div>
    )
  }

  const gstAmount = calculateGST(currentOrder.subtotal, paymentMethod)
  const total = currentOrder.subtotal + gstAmount

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(itemId)
    } else {
      updateTableCartItem(selectedTable, itemId, { quantity: newQuantity })
    }
  }

  const handleRemoveItem = (itemId: string) => {
    const requiresAdmin = staff?.role !== 'admin'
    
    if (requiresAdmin) {
      setAdminPrompt({
        isOpen: true,
        action: 'Remove item from order',
        onSuccess: () => {
          removeFromTableCart(selectedTable, itemId)
          toast.success('Item removed from order')
        }
      })
    } else {
      removeFromTableCart(selectedTable, itemId)
      toast.success('Item removed from order')
    }
  }

  const handleClearCart = () => {
    const requiresAdmin = staff?.role !== 'admin'
    
    if (requiresAdmin) {
      setAdminPrompt({
        isOpen: true,
        action: 'Clear entire order',
        onSuccess: () => {
          clearTableCart(selectedTable)
          setCurrentView('tables')
          toast.success('Order cleared')
        }
      })
    } else {
      if (confirm('Are you sure you want to clear this order?')) {
        clearTableCart(selectedTable)
        setCurrentView('tables')
        toast.success('Order cleared')
      }
    }
  }

  const handleHoldOrder = () => {
    holdTableOrder(selectedTable)
    setCurrentView('tables')
    toast.success('Order held successfully')
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const paidOrder = await payTableOrder(selectedTable, paymentMethod)
      if (paidOrder) {
        onPaymentComplete(paidOrder)
        setShowPayment(false)
        
        // Check if this was saved to database or just locally
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          toast.success('Payment processed! (Saved locally - see SETUP_SUPABASE.md for database setup)', {
            duration: 4000
          })
        } else {
          toast.success('Payment processed successfully!')
        }

        // Save completed order for reports
        saveCompletedOrder(paidOrder)
      } else {
        toast.error('Failed to process payment')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrintBill = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const billContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Table ${selectedTable}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .items th { background-color: #f8f9fa; }
            .total-section { margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-final { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Gloria Jean's Coffees</h1>
            <p>Point of Sale System</p>
          </div>
          
          <div class="bill-details">
            <p><strong>Table:</strong> ${selectedTable}</p>
            <p><strong>Order #:</strong> ${currentOrder.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                         <p><strong>Staff:</strong> ${staff?.email || 'Unknown'}</p>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cartItems.map(item => `
                <tr>
                  <td>
                    ${item.menuItem.name}
                    ${item.extras.length > 0 ? `<br><small>+ ${item.extras.join(', ')}</small>` : ''}
                  </td>
                  <td>${item.size}</td>
                  <td>${item.quantity}</td>
                  <td>Rs. ${item.unitPrice + item.extrasPrice}</td>
                  <td>Rs. ${item.totalPrice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Rs. ${currentOrder.subtotal}</span>
            </div>
            <div class="total-row">
              <span>GST (${paymentMethod === 'cash' ? '16' : '5'}%):</span>
              <span>Rs. ${gstAmount.toFixed(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>Rs. ${total.toFixed(2)}</span>
            </div>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 0.9em; color: #666;">
            <p>Thank you for visiting Gloria Jean's Coffees!</p>
            <p>Please come again</p>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print Bill</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(billContent)
    printWindow.document.close()
  }

  const handleThermalPrintBill = async () => {
    // Generate thermal receipt format for current bill
    let receiptText = ''
    receiptText += '================================\n'
    receiptText += '     GLORIA JEAN\'S COFFEES     \n'
    receiptText += '        Point of Sale          \n'
    receiptText += '================================\n'
    receiptText += `Table: ${selectedTable}\n`
    receiptText += `Order: ${currentOrder.orderNumber}\n`
    receiptText += `Date: ${new Date().toLocaleDateString()}\n`
    receiptText += `Time: ${new Date().toLocaleTimeString()}\n`
    receiptText += `Staff: ${staff?.email || 'Unknown'}\n`
    receiptText += '--------------------------------\n'
    
    cartItems.forEach((item) => {
      receiptText += `${item.menuItem.name}\n`
      receiptText += `  ${item.size} x${item.quantity}\n`
      if (item.extras.length > 0) {
        receiptText += `  Extras: ${item.extras.join(', ')}\n`
      }
      receiptText += `  ${item.totalPrice.toFixed(2)}\n`
      receiptText += '\n'
    })
    
    receiptText += '--------------------------------\n'
    receiptText += `Subtotal:     ${currentOrder.subtotal.toFixed(2)}\n`
    receiptText += `GST (${paymentMethod === 'cash' ? '16%' : '5%'}):       ${gstAmount.toFixed(2)}\n`
    receiptText += `TOTAL:        ${total.toFixed(2)}\n`
    receiptText += '================================\n'
    receiptText += '     Thank you for visiting!    \n'
    receiptText += '   Gloria Jean\'s Coffees POS   \n'
    receiptText += '================================\n'

    try {
      // Try direct thermal printer connection first
      const success = await printToThermalPrinter(receiptText)
      if (success) {
        toast.success('Bill sent to thermal printer successfully!')
        return
      }
    } catch {
      console.log('Direct printing failed, falling back to clipboard')
    }

    // Fallback to clipboard if direct printing fails
    try {
      await navigator.clipboard.writeText(receiptText)
      toast.success('Bill copied to clipboard - paste to thermal printer software')
    } catch {
      toast.error('Failed to copy bill text')
    }
  }

  // Function to print directly to thermal printer
  const printToThermalPrinter = async (text: string): Promise<boolean> => {
    try {
      // Check if Web USB is supported
      if (!('usb' in navigator)) {
        throw new Error('Web USB not supported')
      }

      // Request USB device (thermal printer)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const device = await (navigator as Navigator & { usb: any }).usb.requestDevice({
        filters: [
          // Common thermal printer vendor IDs
          { vendorId: 0x0483 }, // STMicroelectronics
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0416 }, // WinChipHead
          { vendorId: 0x0525 }, // PLX Technology
          { vendorId: 0x067b }, // Prolific Technology
          { vendorId: 0x0405 }, // PowerVR
          { vendorId: 0x0483 }, // STMicroelectronics
          { vendorId: 0x04cc }, // NXP Semiconductors
        ]
      })

      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)

      // Convert text to ESC/POS commands
      const commands = new Uint8Array([
        // Initialize printer
        0x1B, 0x40, // ESC @
        // Set text alignment to center
        0x1B, 0x61, 0x01, // ESC a 1
        // Set font size
        0x1B, 0x21, 0x00, // ESC ! 0
        // Print text
        ...new TextEncoder().encode(text),
        // Cut paper
        0x1D, 0x56, 0x00, // GS V 0
        // Feed paper
        0x0A, 0x0A, 0x0A, // LF LF LF
      ])

      // Send data to printer
      await device.transferOut(1, commands)
      
      await device.close()
      return true
    } catch (error) {
      console.error('Thermal printer error:', error)
      
      // Try alternative method using Web Serial API
      try {
        if ('serial' in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port = await (navigator as Navigator & { serial: any }).serial.requestPort()
          await port.open({ baudRate: 9600 })
          
          const writer = port.writable.getWriter()
          const encoder = new TextEncoder()
          await writer.write(encoder.encode(text))
          await writer.close()
          await port.close()
          return true
        }
      } catch (serialError) {
        console.error('Serial printer error:', serialError)
      }
      
      return false
    }
  }

  return (
    <>
      {/* Desktop Order Panel */}
      <div className="hidden lg:block w-96 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700 h-screen relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-600 z-10 backdrop-blur-sm">
          <div className="p-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white">Table {selectedTable}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintBill}
                  className="p-2 text-white hover:text-amber-400 hover:bg-gray-700 rounded-lg transition-all duration-200"
                  title="Print Bill (A4)"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button
                  onClick={handleThermalPrintBill}
                  className="p-2 text-white hover:text-green-400 hover:bg-gray-700 rounded-lg transition-all duration-200"
                  title="Thermal Print Bill"
                >
                  <Download className="h-5 w-5" />
                </button>
                {staff?.role !== 'admin' && (
                  <div className="flex items-center text-amber-400" title="Admin features restricted">
                    <Lock className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-300">Order: {currentOrder.orderNumber}</p>
          </div>
        </div>

        {/* Order Items - Scrollable Area with calculated height */}
        <div 
          className="absolute left-0 right-0 overflow-y-auto enhanced-cart-scroll"
          style={{ 
            top: '90px',
            bottom: cartItems.length > 0 ? '200px' : '0px',
            height: cartItems.length > 0 ? 'calc(100vh - 450px)' : 'calc(100vh - 150px)'
          }}
        >
          <div className="p-3 pt-4 pb-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-800 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-base font-medium">No items in order</p>
                <p className="text-sm text-gray-500 mt-1">Add items from the menu to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-600 hover:border-gray-500 animate-slideInRight" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-white text-sm leading-tight mb-2">
                          {item.menuItem.name}
                        </h4>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-xs text-white bg-gray-600 px-2 py-0.5 rounded-full font-medium">
                            {item.size}
                          </span>
                          {item.extras.length > 0 && (
                            <span className="text-xs text-amber-200 bg-amber-900 px-2 py-0.5 rounded-full font-medium">
                              +{item.extras.length}
                            </span>
                          )}
                        </div>
                        {item.extras.length > 0 && (
                          <p className="text-xs text-gray-300 italic bg-gray-700 px-2 py-1 rounded">
                            + {item.extras.join(', ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900 rounded-lg transition-all duration-200 flex-shrink-0"
                        title={staff?.role !== 'admin' ? 'Requires admin password' : 'Remove item'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
                        >
                          <Minus className="h-3 w-3 text-white" />
                        </button>
                        <span className="w-8 text-center font-bold text-white text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </button>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-white text-base">Rs. {item.totalPrice}</p>
                        <p className="text-xs text-gray-400">
                          Rs. {item.unitPrice + item.extrasPrice} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Actions - Fixed at Bottom */}
        {cartItems.length > 0 && (
          <div className="absolute bottom-28 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-gray-600 backdrop-blur-sm shadow-lg rounded-b-lg">
            <div className="p-4">
              {/* Totals */}
              <div className="space-y-1 mb-3 bg-gray-800 rounded-lg p-2.5 border border-gray-600">
                <div className="flex justify-between text-white text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">Rs. {currentOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-white text-sm">
                  <span>GST ({paymentMethod === 'cash' ? '16' : '5'}%):</span>
                  <span className="font-semibold">Rs. {gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-gray-600">
                  <span>Total:</span>
                  <span className="text-amber-400">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <CreditCard className="h-4 w-4" />
                  Process Payment
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleHoldOrder}
                    className="py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 font-medium text-sm"
                  >
                    Hold Order
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="py-2 px-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium flex items-center justify-center gap-1 text-sm"
                    title={staff?.role !== 'admin' ? 'Requires admin password' : 'Clear order'}
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cart Button */}
      <button
        onClick={() => setShowMobileCart(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-full shadow-2xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 z-40 transform hover:scale-110"
      >
        <ShoppingBag className="h-7 w-7" />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center shadow-lg animate-pulse">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Mobile Cart Overlay */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-gradient-to-b from-gray-900 to-gray-800 relative">
            {/* Mobile Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-600 z-10">
              <div className="p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Table {selectedTable}</h2>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-white transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mobile Order Items - Scrollable */}
            <div 
              className="absolute left-0 right-0 overflow-y-auto enhanced-cart-scroll"
              style={{ 
                top: '70px',
                bottom: cartItems.length > 0 ? '180px' : '16px',
                height: cartItems.length > 0 ? 'calc(100vh - 250px)' : 'calc(100vh - 86px)'
              }}
            >
              <div className="p-3 pt-4 pb-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-800 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="h-7 w-7 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No items in order</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-3 border border-gray-600 shadow-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-semibold text-white text-sm mb-1">
                              {item.menuItem.name}
                            </h4>
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-white bg-gray-600 px-2 py-0.5 rounded-full">
                                {item.size}
                              </span>
                              {item.extras.length > 0 && (
                                <span className="text-xs text-amber-200 bg-amber-900 px-2 py-0.5 rounded-full">
                                  +{item.extras.length}
                                </span>
                              )}
                            </div>
                            {item.extras.length > 0 && (
                              <p className="text-xs text-gray-300 italic">
                                + {item.extras.join(', ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900 rounded transition-all duration-200 flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-gray-700 rounded p-1">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
                            >
                              <Minus className="h-3 w-3 text-white" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-all duration-200"
                            >
                              <Plus className="h-3 w-3 text-white" />
                            </button>
                          </div>
                          <span className="font-bold text-white text-sm flex-shrink-0">Rs. {item.totalPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions - Fixed at Bottom */}
            {cartItems.length > 0 && (
              <div className="absolute bottom-4 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-gray-600 shadow-lg rounded-b-lg">
                <div className="p-3 space-y-2">
                  <div className="space-y-1 bg-gray-800 rounded-lg p-2 border border-gray-600">
                    <div className="flex justify-between text-xs text-white">
                      <span>Subtotal:</span>
                      <span className="font-semibold">Rs. {currentOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white">
                      <span>GST:</span>
                      <span className="font-semibold">Rs. {gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-white border-t border-gray-600 pt-1">
                      <span>Total:</span>
                      <span className="text-amber-400">Rs. {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowMobileCart(false)
                      setShowPayment(true)
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                  >
                    <CreditCard className="h-4 w-4" />
                    Process Payment
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setShowMobileCart(false)
                        handleHoldOrder()
                      }}
                      className="py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-medium text-sm"
                    >
                      Hold
                    </button>
                    <button
                      onClick={() => {
                        setShowMobileCart(false)
                        handleClearCart()
                      }}
                      className="py-2 px-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-1 text-sm"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="payment-modal bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Payment Details</h3>
              
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-900 text-green-300'
                        : 'border-gray-600 hover:border-gray-500 text-white'
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Cash</div>
                      <div className="text-xs">16% GST</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-900 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 text-white'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Card</div>
                      <div className="text-xs">5% GST</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="space-y-2">
                  <div className="flex justify-between text-white">
                    <span>Subtotal:</span>
                    <span>Rs. {currentOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>GST ({paymentMethod === 'cash' ? '16' : '5'}%):</span>
                    <span>Rs. {gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-2">
                    <span>Total:</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 py-3 px-4 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrintBill}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isProcessing}
                  title="Print Bill (A4)"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button
                  onClick={handleThermalPrintBill}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                  title="Thermal Print Bill"
                >
                  <Download className="h-5 w-5" />
                </button>
                                  <button
                    onClick={handlePayment}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Payment'}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Prompt */}
      <AdminPasswordPrompt
        isOpen={adminPrompt.isOpen}
        onClose={() => setAdminPrompt({ ...adminPrompt, isOpen: false })}
        onSuccess={adminPrompt.onSuccess}
        action={adminPrompt.action}
      />
    </>
  )
} 