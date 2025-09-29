export interface InvoiceTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  layout: "modern" | "classic" | "minimal";
  branding: {
    companyName: string;
    companyLogo?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
  };
  styling: {
    primaryColor: string;
    accentColor: string;
    fontFamily: "inter" | "serif" | "mono";
    showLogo: boolean;
    showWatermark: boolean;
  };
  footer?: {
    text: string;
    showPageNumbers: boolean;
  };
}

export const DEFAULT_TEMPLATE: InvoiceTemplate = {
  id: "default",
  name: "Default Template",
  isDefault: true,
  layout: "modern",
  branding: {
    companyName: "Your Company Name",
    companyAddress: "123 Business Street, City, State 12345",
    companyPhone: "+1 (555) 123-4567",
    companyEmail: "info@yourcompany.com",
  },
  styling: {
    primaryColor: "#0ea5e9",
    accentColor: "#1e293b",
    fontFamily: "inter",
    showLogo: true,
    showWatermark: false,
  },
  footer: {
    text: "Thank you for your business!",
    showPageNumbers: true,
  },
};
