import { InvoiceTemplate } from "@/types/invoice";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  date: string;
  dueDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  status: "paid" | "pending" | "overdue";
  total: number;
  notes?: string;
}

interface InvoicePreviewProps {
  invoice: Invoice;
  template: InvoiceTemplate;
}

export const InvoicePreview = ({ invoice, template }: InvoicePreviewProps) => {
  const { branding, styling, layout, footer } = template;

  const fontClass = {
    inter: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  }[styling.fontFamily];

  const layoutStyles = {
    modern: "bg-white",
    classic: "bg-white border-4 border-double",
    minimal: "bg-white",
  };

  return (
    <div
      className={`w-full max-w-4xl mx-auto p-8 ${fontClass} ${layoutStyles[layout]}`}
      style={{ borderColor: layout === "classic" ? styling.primaryColor : undefined }}
    >
      {/* Header */}
      <div className="mb-8">
        {layout === "modern" && (
          <div
            className="h-2 w-full mb-6"
            style={{ backgroundColor: styling.primaryColor }}
          />
        )}
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {styling.showLogo && branding.companyLogo && (
              <img
                src={branding.companyLogo}
                alt="Company Logo"
                className="h-16 mb-4 object-contain"
              />
            )}
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: styling.primaryColor }}
            >
              {branding.companyName}
            </h1>
            {branding.companyAddress && (
              <p className="text-sm text-gray-600 mb-1">{branding.companyAddress}</p>
            )}
            {branding.companyPhone && (
              <p className="text-sm text-gray-600 mb-1">{branding.companyPhone}</p>
            )}
            {branding.companyEmail && (
              <p className="text-sm text-gray-600 mb-1">{branding.companyEmail}</p>
            )}
            {branding.companyWebsite && (
              <p className="text-sm text-gray-600">{branding.companyWebsite}</p>
            )}
          </div>

          <div className="text-right">
            <h2
              className="text-4xl font-bold mb-2"
              style={{ color: styling.accentColor }}
            >
              INVOICE
            </h2>
            <div className="text-sm">
              <p className="font-semibold">{invoice.invoiceNumber}</p>
              <p className="text-gray-600">Date: {invoice.date}</p>
              <p className="text-gray-600">Due: {invoice.dueDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-8">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: styling.primaryColor }}
        >
          Bill To:
        </h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-semibold text-lg">{invoice.customerName}</p>
          <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
          {invoice.customerAddress && (
            <p className="text-sm text-gray-600 mt-1">{invoice.customerAddress}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr
              className="border-b-2"
              style={{ borderColor: styling.primaryColor }}
            >
              <th
                className="text-left py-3 px-2 font-semibold"
                style={{ color: styling.accentColor }}
              >
                Description
              </th>
              <th
                className="text-center py-3 px-2 font-semibold w-24"
                style={{ color: styling.accentColor }}
              >
                Qty
              </th>
              <th
                className="text-right py-3 px-2 font-semibold w-32"
                style={{ color: styling.accentColor }}
              >
                Price
              </th>
              <th
                className="text-right py-3 px-2 font-semibold w-32"
                style={{ color: styling.accentColor }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-2">{item.name}</td>
                <td className="text-center py-3 px-2">{item.quantity}</td>
                <td className="text-right py-3 px-2">${item.price.toFixed(2)}</td>
                <td className="text-right py-3 px-2 font-semibold">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Section */}
        <div className="flex justify-end mt-4">
          <div className="w-64">
            <div
              className="flex justify-between py-3 px-4 text-white font-bold text-xl"
              style={{ backgroundColor: styling.primaryColor }}
            >
              <span>TOTAL:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: styling.primaryColor }}
          >
            Notes:
          </h3>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="border-t pt-4 mt-8 text-center">
          <p className="text-sm text-gray-600">{footer.text}</p>
          {styling.showWatermark && (
            <p className="text-xs text-gray-400 mt-2">
              Generated by Business Manager
            </p>
          )}
        </div>
      )}
    </div>
  );
};
