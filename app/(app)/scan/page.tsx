"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Camera,
  FileText,
  Loader2,
  Save,
  ScanLine,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { extractCardData } from "@/actions/scan";
import { createLead } from "@/actions/leads";
import type { ExtractedCardData } from "@/types";

const MAX_DIM = 1600;
const IMAGE_QUALITY = 0.85;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cardData, setCardData] = useState<ExtractedCardData | null>(null);
  const [parseFailed, setParseFailed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setIsMobile(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError("Camera access denied. Please allow camera permission or use file upload instead.");
    }
  };

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    closeCamera();

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to capture photo"))),
          "image/jpeg",
          0.92
        );
      });
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      const base64 = await compressImage(file);
      setImagePreview(base64);
      await processImage(base64, "image/jpeg");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to capture photo");
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height / width) * MAX_DIM);
            width = MAX_DIM;
          } else {
            width = Math.round((width / height) * MAX_DIM);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type, IMAGE_QUALITY));
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image. The file may be corrupted."));
      };

      img.src = objectUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image is too large. Maximum size is 10MB.");
      return;
    }

    try {
      const base64 = await compressImage(file);
      setImagePreview(base64);
      await processImage(base64, file.type);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process image"
      );
    }
  };

  const processImage = async (base64Image: string, mimeType: string) => {
    setIsScanning(true);
    setCardData(null);
    setParseFailed(false);
    try {
      const res = await extractCardData(base64Image, mimeType);

      if (!res.success || !res.data) {
        toast.error(res.error || "Failed to extract data");
        return;
      }

      if (res.data.parseFailed) {
        setParseFailed(true);
        toast.warning(
          "AI couldn't fully parse this card. Review the extracted data below."
        );
      } else {
        toast.success("Card scanned successfully!");
      }

      setCardData(res.data.cardData);
    } catch {
      toast.error("Something went wrong during extraction.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    closeCamera();
    setImagePreview(null);
    setCardData(null);
    setNotes("");
    setParseFailed(false);
    setSaved(false);
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
        emails: cardData.emails.filter(Boolean),
        phones: cardData.phones.filter(Boolean),
        websites: cardData.websites.filter(Boolean),
        address: cardData.address,
        notes: notes || null,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save lead");
        return;
      }

      toast.success("Lead saved successfully!");
      setSaved(true);
      router.push("/leads");
    } catch {
      toast.error("Failed to save lead");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Scan Business Card
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload or snap a photo of a business card to extract details.
          </p>
        </div>
        {imagePreview && (
          <Button
            variant="outline"
            onClick={resetScan}
            className="w-full sm:w-auto"
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Scan Another
          </Button>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-0">
        {[
          { label: "Upload", active: !imagePreview && !isScanning && !cardData && !saved },
          { label: "Scanning", active: isScanning },
          {
            label: "Review",
            active: !!cardData && !isScanning && !isSaving && !saved,
          },
          { label: "Save", active: isSaving || saved },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                  step.active
                    ? "bg-primary text-primary-foreground"
                    : (!isScanning && !cardData && !isSaving && !saved && i === 0) ||
                        (isScanning && i <= 1) ||
                        (cardData && !isSaving && !saved && i <= 2) ||
                        ((isSaving || saved) && i <= 3)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline transition-colors duration-300 ${
                  step.active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < 3 && (
              <div
                className={`w-8 sm:w-12 h-px mx-2 transition-colors duration-300 ${
                  (isScanning && i === 0) ||
                  (cardData && !isSaving && !saved && i <= 1) ||
                  ((isSaving || saved) && i <= 2)
                    ? "bg-primary"
                    : "bg-border"
                }`}
              />
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
                  <h3 className="font-semibold text-lg mb-1">
                    Upload Card Image
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs px-4">
                    {isMobile
                      ? "Take a photo or choose a file. JPEG or PNG up to 10MB."
                      : "Drag and drop or click to browse. JPEG or PNG up to 10MB."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
                    <Button
                      variant="secondary"
                      className="glass w-full sm:w-auto"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" /> Browse Files
                    </Button>
                    <Button
                      variant="secondary"
                      className="glass w-full sm:w-auto"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCamera();
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Take Photo
                    </Button>
                  </div>
                  {cameraError && (
                    <p className="text-sm text-destructive mt-2 px-4 text-center">{cameraError}</p>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] w-full bg-black/90">
                  <img
                    src={imagePreview}
                    alt="Card Preview"
                    className="w-full h-full object-contain"
                    width={MAX_DIM}
                    height={MAX_DIM}
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 pulse-ring shadow-lg shadow-primary/20">
                        <ScanLine className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium text-foreground">
                        Extracting Data...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Using Gemini AI
                      </p>
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
          <Card
            className={`glass border-border/50 shadow-xl shadow-black/5 transition-opacity duration-300 ${
              isScanning ? "opacity-50 pointer-events-none" : ""
            }`}
            aria-disabled={isScanning}
          >
            <CardContent className="p-6">
              {!cardData && !isScanning ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">
                    Awaiting Scan
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Upload a business card image to automatically extract and
                    populate this form.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  {parseFailed && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
                      AI parsing was incomplete. Please review all fields before
                      saving.
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={cardData?.name || ""}
                      onChange={(e) =>
                        setCardData((prev) =>
                          prev ? { ...prev, name: e.target.value } : null
                        )
                      }
                      className="bg-background/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Label htmlFor="designation">Job Title</Label>
                      <Input
                        id="designation"
                        value={cardData?.designation || ""}
                        onChange={(e) =>
                          setCardData((prev) =>
                            prev
                              ? { ...prev, designation: e.target.value }
                              : null
                          )
                        }
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={cardData?.company || ""}
                        onChange={(e) =>
                          setCardData((prev) =>
                            prev ? { ...prev, company: e.target.value } : null
                          )
                        }
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Emails</Label>
                    {(cardData?.emails.length ? cardData.emails : [""]).map(
                      (_, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={cardData?.emails[i] || ""}
                            onChange={(e) =>
                              setCardData((prev) => {
                                if (!prev) return null;
                                const emails = [...prev.emails];
                                emails[i] = e.target.value;
                                return { ...prev, emails };
                              })
                            }
                            placeholder="email@example.com"
                            className="bg-background/50"
                          />
                          {cardData && cardData.emails.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                setCardData((prev) => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    emails: prev.emails.filter((_, j) => j !== i),
                                  };
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                        setCardData((prev) =>
                          prev
                            ? { ...prev, emails: [...prev.emails, ""] }
                            : null
                        )
                      }
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add email
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Phones</Label>
                    {(cardData?.phones.length ? cardData.phones : [""]).map(
                      (_, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={cardData?.phones[i] || ""}
                            onChange={(e) =>
                              setCardData((prev) => {
                                if (!prev) return null;
                                const phones = [...prev.phones];
                                phones[i] = e.target.value;
                                return { ...prev, phones };
                              })
                            }
                            placeholder="+1-234-567-8900"
                            className="bg-background/50"
                          />
                          {cardData && cardData.phones.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                setCardData((prev) => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    phones: prev.phones.filter((_, j) => j !== i),
                                  };
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                        setCardData((prev) =>
                          prev
                            ? { ...prev, phones: [...prev.phones, ""] }
                            : null
                        )
                      }
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add phone
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Websites</Label>
                    {(cardData?.websites.length ? cardData.websites : [""]).map(
                      (_, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={cardData?.websites[i] || ""}
                            onChange={(e) =>
                              setCardData((prev) => {
                                if (!prev) return null;
                                const websites = [...prev.websites];
                                websites[i] = e.target.value;
                                return { ...prev, websites };
                              })
                            }
                            placeholder="https://example.com"
                            className="bg-background/50"
                          />
                          {cardData && cardData.websites.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                setCardData((prev) => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    websites: prev.websites.filter(
                                      (_, j) => j !== i
                                    ),
                                  };
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                        setCardData((prev) =>
                          prev
                            ? { ...prev, websites: [...prev.websites, ""] }
                            : null
                        )
                      }
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add website
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={cardData?.address || ""}
                      onChange={(e) =>
                        setCardData((prev) =>
                          prev ? { ...prev, address: e.target.value } : null
                        )
                      }
                      className="bg-background/50 resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this contact..."
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

      {/* Camera Overlay */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <p className="text-white font-medium">Position card within frame</p>
            <Button variant="ghost" size="icon" onClick={closeCamera} className="text-white hover:text-white/80">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] max-w-md aspect-[1.6/1] border-2 border-white/40 rounded-xl" />
            </div>
          </div>
          <div className="flex justify-center py-8">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-white/50 active:scale-90 transition-transform"
              aria-label="Capture photo"
            />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
