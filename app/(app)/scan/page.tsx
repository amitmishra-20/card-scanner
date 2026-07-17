"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, FileText, Loader2, Save, ScanLine, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { extractCardData } from "@/actions/scan";
import { createLead } from "@/actions/leads";
import type { ExtractedCardData } from "@/types";

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cardData, setCardData] = useState<ExtractedCardData | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const maxDim = 1600;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height / width) * maxDim);
            width = maxDim;
          } else {
            width = Math.round((width / height) * maxDim);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type, 0.85));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG)");
      return;
    }

    const base64 = await compressImage(file);
    setImagePreview(base64);
    await processImage(base64, file.type);
  };

  const processImage = async (base64Image: string, mimeType: string) => {
    setIsScanning(true);
    setCardData(null);
    try {
      const res = await extractCardData(base64Image, mimeType);
      
      if (!res.success || !res.data) {
        toast.error(res.error || "Failed to extract data");
        return;
      }

      setCardData(res.data);
      toast.success("Card scanned successfully!");
    } catch (error) {
      toast.error("Something went wrong during extraction.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setImagePreview(null);
    setCardData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardData) return;

    setIsSaving(true);
    try {
      const res = await createLead({
        name: cardData.name,
        designation: cardData.designation,
        company: cardData.company,
        emails: cardData.emails,
        phones: cardData.phones,
        websites: cardData.websites,
        address: cardData.address,
        notes: null
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save lead");
        return;
      }

      toast.success("Lead saved successfully!");
      router.push("/leads");
    } catch (error) {
      toast.error("Failed to save lead");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scan Business Card</h1>
          <p className="text-muted-foreground mt-2">
            Upload or snap a photo of a business card to extract details.
          </p>
        </div>
        {imagePreview && (
          <Button variant="outline" onClick={resetScan} className="w-full sm:w-auto">
            <ScanLine className="w-4 h-4 mr-2" />
            Scan Another
          </Button>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-0">
        {[
          { label: "Upload", active: !imagePreview && !isScanning && !cardData },
          { label: "Scanning", active: isScanning },
          { label: "Review", active: !!cardData && !isScanning && !isSaving },
          { label: "Save", active: isSaving },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                step.active
                  ? "bg-primary text-primary-foreground"
                  : (step.active || (!isScanning && !cardData && !isSaving && i === 0) || (isScanning && i <= 1) || (cardData && !isSaving && i <= 2) || (isSaving && i <= 3))
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline transition-colors duration-300 ${
                step.active ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
            </div>
            {i < 3 && (
              <div className={`w-8 sm:w-12 h-px mx-2 transition-colors duration-300 ${
                (isScanning && i === 0) || (cardData && !isSaving && i <= 1) || (isSaving && i <= 2)
                  ? "bg-primary"
                  : "bg-border"
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image / Uploader */}
        <div className="space-y-6">
          <Card className="glass overflow-hidden border-border/50 shadow-xl shadow-black/5">
            <CardContent className="p-0">
              {!imagePreview ? (
                <div 
                  className="flex flex-col items-center justify-center aspect-[4/3] bg-muted/20 border-2 border-dashed border-border m-6 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Upload Card Image</h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs px-4">
                    {isMobile
                      ? "Take a photo or choose a file. JPEG or PNG up to 10MB."
                      : "Drag and drop or click to browse. JPEG or PNG up to 10MB."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
                    <Button
                      variant="secondary"
                      className="glass w-full sm:w-auto"
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      <FileText className="w-4 h-4 mr-2" /> Browse Files
                    </Button>
                    <Button
                      variant="secondary"
                      className="glass w-full sm:w-auto"
                      type="button"
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Take Photo
                    </Button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileChange}
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] w-full bg-black/90">
                  <img 
                    src={imagePreview} 
                    alt="Card Preview" 
                    className="w-full h-full object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 pulse-ring shadow-lg shadow-primary/20">
                        <ScanLine className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium text-foreground">Extracting Data...</p>
                      <p className="text-sm text-muted-foreground">Using Gemini AI</p>
                    </div>
                  )}
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-4 right-4 rounded-full shadow-lg"
                    onClick={resetScan}
                    disabled={isScanning || isSaving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Extracted Data Form */}
        <div className="space-y-6">
          <Card className={`glass border-border/50 shadow-xl shadow-black/5 transition-opacity duration-300 ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardContent className="p-6">
              {!cardData && !isScanning ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">Awaiting Scan</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Upload a business card image to automatically extract and populate this form.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={cardData?.name || ''} 
                      onChange={(e) => setCardData(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Label htmlFor="designation">Job Title</Label>
                      <Input 
                        id="designation" 
                        value={cardData?.designation || ''} 
                        onChange={(e) => setCardData(prev => prev ? {...prev, designation: e.target.value} : null)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        value={cardData?.company || ''} 
                        onChange={(e) => setCardData(prev => prev ? {...prev, company: e.target.value} : null)}
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={cardData?.emails[0] || ''} 
                        onChange={(e) => setCardData(prev => prev ? {...prev, emails: [e.target.value, ...prev.emails.slice(1)]} : null)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={cardData?.phones[0] || ''} 
                        onChange={(e) => setCardData(prev => prev ? {...prev, phones: [e.target.value, ...prev.phones.slice(1)]} : null)}
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      type="url"
                      value={cardData?.websites[0] || ''} 
                      onChange={(e) => setCardData(prev => prev ? {...prev, websites: [e.target.value, ...prev.websites.slice(1)]} : null)}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address" 
                      value={cardData?.address || ''} 
                      onChange={(e) => setCardData(prev => prev ? {...prev, address: e.target.value} : null)}
                      className="bg-background/50 resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <Button 
                      type="submit" 
                      className="w-full btn-gradient shadow-lg shadow-primary/20"
                      disabled={isSaving || isScanning || !cardData}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving Lead...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save as Lead
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
