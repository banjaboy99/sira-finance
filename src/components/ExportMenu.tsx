import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface ExportMenuProps {
  elementRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  documentType: "invoice" | "receipt";
}

export const ExportMenu = ({ elementRef, fileName, documentType }: ExportMenuProps) => {
  const { toast } = useToast();

  const exportToPNG = async () => {
    if (!elementRef.current) return;

    try {
      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({
        title: "Export successful",
        description: `${documentType} exported as PNG`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export as PNG",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async () => {
    if (!elementRef.current) return;

    try {
      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: documentType === "receipt" ? "portrait" : "portrait",
        unit: "px",
        format: documentType === "receipt" ? [canvas.width / 2, canvas.height / 2] : "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
      
      toast({
        title: "Export successful",
        description: `${documentType} exported as PDF`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export as PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPNG}>
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
