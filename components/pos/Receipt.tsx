'use client'

import { useRef } from 'react'
import { Printer, Download, X } from 'lucide-react'
import { Order, usePosStore } from '@/lib/store'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ReceiptProps {
  order: Order
  onClose: () => void
}

export default function Receipt({ order, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const { staff } = usePosStore()

  const formatPrice = (price: number) => {
    return `Rs. ${price.toFixed(2)}`
  }

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${order.orderNumber}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px;
                  line-height: 1.4;
                }
                .receipt { 
                  max-width: 300px; 
                  margin: 0 auto; 
                }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-top: 1px dashed #000; margin: 10px 0; }
                .item-row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin: 5px 0;
                }
                .total-section {
                  border-top: 2px solid #000;
                  margin-top: 10px;
                  padding-top: 10px;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleThermalPrint = async () => {
    // Generate thermal receipt format
    let receiptText = ''
    receiptText += '================================\n'
    receiptText += '     GLORIA JEAN\'S COFFEES     \n'
    receiptText += '        Point of Sale          \n'
    receiptText += '================================\n'
    receiptText += `Order: ${order.orderNumber}\n`
    receiptText += `Date: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n`
    receiptText += `Staff: ${staff?.role} - ${staff?.email}\n`
    receiptText += `Payment: ${order.paymentMethod?.toUpperCase()}\n`
    receiptText += '--------------------------------\n'
    
    order.items.forEach((item) => {
      receiptText += `${item.menuItem.name}\n`
      receiptText += `  ${item.size} x${item.quantity}\n`
      if (item.extras.length > 0) {
        receiptText += `  Extras: ${item.extras.join(', ')}\n`
      }
      receiptText += `  ${formatPrice(item.totalPrice)}\n`
      receiptText += '\n'
    })
    
    receiptText += '--------------------------------\n'
    receiptText += `Subtotal:     ${formatPrice(order.subtotal)}\n`
    receiptText += `GST (${order.paymentMethod === 'cash' ? '16%' : '5%'}):       ${formatPrice(order.gstAmount)}\n`
    receiptText += `TOTAL:        ${formatPrice(order.total)}\n`
    receiptText += '================================\n'
    receiptText += '     Thank you for visiting!    \n'
    receiptText += '   Gloria Jean\'s Coffees POS   \n'
    receiptText += '================================\n'

    try {
      // Try direct thermal printer connection first
      const success = await printToThermalPrinter(receiptText)
      if (success) {
        toast.success('Receipt sent to thermal printer successfully!')
        return
      }
    } catch {
      console.log('Direct printing failed, falling back to clipboard')
    }

    // Fallback to clipboard if direct printing fails
    try {
      await navigator.clipboard.writeText(receiptText)
      toast.success('Receipt copied to clipboard - paste to thermal printer software')
    } catch {
      toast.error('Failed to copy receipt text')
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="receipt text-gray-900 dark:text-gray-100">
          <div className="center">
                          <div className="bold text-lg text-gray-900 dark:text-gray-100">GLORIA JEAN&apos;S COFFEES</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Point of Sale System</div>
          </div>

          <div className="line border-gray-300 dark:border-gray-600"></div>

          <div className="space-y-2">
            <div className="flex justify-between text-gray-900 dark:text-gray-100">
              <span>Order:</span>
              <span className="bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-gray-900 dark:text-gray-100">
              <span>Date:</span>
              <span>{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between text-gray-900 dark:text-gray-100">
              <span>Staff:</span>
              <span>{staff?.role} - {staff?.email}</span>
            </div>
            <div className="flex justify-between text-gray-900 dark:text-gray-100">
              <span>Payment:</span>
              <span className="uppercase">{order.paymentMethod}</span>
            </div>
          </div>

          <div className="line"></div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="text-sm">
                <div className="bold text-gray-900 dark:text-gray-100">{item.menuItem.name}</div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{item.size} x{item.quantity}</span>
                  <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
                {item.extras.length > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Extras: {item.extras.join(', ')}</span>
                    <span>{formatPrice(item.extrasPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between bold text-gray-900 dark:text-gray-100">
                  <span>Total:</span>
                  <span>{formatPrice(item.totalPrice)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="line border-gray-300 dark:border-gray-600"></div>

          {/* Totals */}
          <div className="total-section space-y-2">
            <div className="flex justify-between text-gray-900 dark:text-gray-100">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-900 dark:text-gray-100">
              <span>GST ({order.paymentMethod === 'cash' ? '16%' : '5%'}):</span>
              <span>{formatPrice(order.gstAmount)}</span>
            </div>
            <div className="flex justify-between bold text-lg text-gray-900 dark:text-gray-100">
              <span>TOTAL:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="line border-gray-300 dark:border-gray-600"></div>

          <div className="center text-sm text-gray-600 dark:text-gray-400">
            <div>Thank you for visiting!</div>
                          <div>Gloria Jean&apos;s Coffees POS</div>
          </div>
        </div>

        {/* Print Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handlePrint}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="h-5 w-5" />
            Print Receipt (A4)
          </button>

          <button
            onClick={handleThermalPrint}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Copy for Thermal Printer
          </button>

          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 