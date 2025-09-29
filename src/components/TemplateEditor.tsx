import { useState, useEffect } from "react";
import { Palette, FileText, Image as ImageIcon, Type } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { InvoiceTemplate } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

interface TemplateEditorProps {
  template: InvoiceTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: InvoiceTemplate) => void;
}

export const TemplateEditor = ({ template, open, onOpenChange, onSave }: TemplateEditorProps) => {
  const { toast } = useToast();
  const [editedTemplate, setEditedTemplate] = useState<InvoiceTemplate>(template);

  useEffect(() => {
    setEditedTemplate(template);
  }, [template]);

  const handleSave = () => {
    onSave(editedTemplate);
    toast({
      title: "Template saved",
      description: "Your invoice template has been updated successfully.",
    });
    onOpenChange(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedTemplate({
          ...editedTemplate,
          branding: {
            ...editedTemplate.branding,
            companyLogo: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Invoice Template</DialogTitle>
          <DialogDescription>
            Personalize your invoice template with your branding and style preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="branding">
              <FileText className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="styling">
              <Palette className="h-4 w-4 mr-2" />
              Styling
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Type className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={editedTemplate.name}
                  onChange={(e) =>
                    setEditedTemplate({ ...editedTemplate, name: e.target.value })
                  }
                  placeholder="My Custom Template"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={editedTemplate.branding.companyName}
                  onChange={(e) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      branding: { ...editedTemplate.branding, companyName: e.target.value },
                    })
                  }
                  placeholder="Your Company Inc."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyLogo">Company Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="companyLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {editedTemplate.branding.companyLogo && (
                    <img
                      src={editedTemplate.branding.companyLogo}
                      alt="Logo preview"
                      className="h-10 w-10 object-contain border rounded"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={editedTemplate.branding.companyAddress || ""}
                  onChange={(e) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      branding: { ...editedTemplate.branding, companyAddress: e.target.value },
                    })
                  }
                  placeholder="123 Business Street, City, State 12345"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={editedTemplate.branding.companyPhone || ""}
                    onChange={(e) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        branding: { ...editedTemplate.branding, companyPhone: e.target.value },
                      })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={editedTemplate.branding.companyEmail || ""}
                    onChange={(e) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        branding: { ...editedTemplate.branding, companyEmail: e.target.value },
                      })
                    }
                    placeholder="info@company.com"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={editedTemplate.branding.companyWebsite || ""}
                  onChange={(e) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      branding: { ...editedTemplate.branding, companyWebsite: e.target.value },
                    })
                  }
                  placeholder="www.yourcompany.com"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={editedTemplate.styling.primaryColor}
                      onChange={(e) =>
                        setEditedTemplate({
                          ...editedTemplate,
                          styling: { ...editedTemplate.styling, primaryColor: e.target.value },
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={editedTemplate.styling.primaryColor}
                      onChange={(e) =>
                        setEditedTemplate({
                          ...editedTemplate,
                          styling: { ...editedTemplate.styling, primaryColor: e.target.value },
                        })
                      }
                      placeholder="#0ea5e9"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={editedTemplate.styling.accentColor}
                      onChange={(e) =>
                        setEditedTemplate({
                          ...editedTemplate,
                          styling: { ...editedTemplate.styling, accentColor: e.target.value },
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={editedTemplate.styling.accentColor}
                      onChange={(e) =>
                        setEditedTemplate({
                          ...editedTemplate,
                          styling: { ...editedTemplate.styling, accentColor: e.target.value },
                        })
                      }
                      placeholder="#1e293b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fontFamily">Font Style</Label>
                <Select
                  value={editedTemplate.styling.fontFamily}
                  onValueChange={(value: "inter" | "serif" | "mono") =>
                    setEditedTemplate({
                      ...editedTemplate,
                      styling: { ...editedTemplate.styling, fontFamily: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Modern (Sans-serif)</SelectItem>
                    <SelectItem value="serif">Classic (Serif)</SelectItem>
                    <SelectItem value="mono">Technical (Monospace)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Logo</Label>
                    <p className="text-xs text-muted-foreground">
                      Display your company logo on invoices
                    </p>
                  </div>
                  <Switch
                    checked={editedTemplate.styling.showLogo}
                    onCheckedChange={(checked) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        styling: { ...editedTemplate.styling, showLogo: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Watermark</Label>
                    <p className="text-xs text-muted-foreground">
                      Add "Generated by Business Manager" footer
                    </p>
                  </div>
                  <Switch
                    checked={editedTemplate.styling.showWatermark}
                    onCheckedChange={(checked) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        styling: { ...editedTemplate.styling, showWatermark: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="layout">Invoice Layout</Label>
                <Select
                  value={editedTemplate.layout}
                  onValueChange={(value: "modern" | "classic" | "minimal") =>
                    setEditedTemplate({ ...editedTemplate, layout: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern - Clean with accent stripe</SelectItem>
                    <SelectItem value="classic">Classic - Traditional with border</SelectItem>
                    <SelectItem value="minimal">Minimal - Simple and elegant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  value={editedTemplate.footer?.text || ""}
                  onChange={(e) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      footer: {
                        ...editedTemplate.footer,
                        text: e.target.value,
                        showPageNumbers: editedTemplate.footer?.showPageNumbers ?? true,
                      },
                    })
                  }
                  placeholder="Thank you for your business!"
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
