import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Upload,
    Camera,
    FileText,
    Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FileUploadZone({ onFileSelect, onCameraCapture, dragActive }) {
  const { t } = useTranslation();
  const [showCameraDialog, setShowCameraDialog] = React.useState(false);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const [isCameraReady, setIsCameraReady] = React.useState(false);
  const [isMobile] = React.useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const fileInputRef = React.useRef(null);
  const mobileCameraRef = React.useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: isMobile ? 'environment' : 'user' },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraReady(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isCameraReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `document-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCameraCapture(file);
      setShowCameraDialog(false);
    }, 'image/jpeg', 0.8);
  };

  React.useEffect(() => {
    if (showCameraDialog) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCameraDialog]);

  return (
    <>
      <div
        className="apple-blur rounded-3xl p-12 apple-shadow-lg transition-all duration-300"
        style={dragActive ? { backgroundColor: "var(--k-accent-light)", borderColor: "var(--k-border-strong)" } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={onFileSelect}
          className="hidden"
        />
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-white dark:text-black" />
          </div>
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-3 tracking-tight">
            {t("upload.zone.title")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            {t("upload.zone.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* File Upload */}
          <div 
            className="group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="font-medium text-black dark:text-white mb-2">
                  {t("upload.zone.browseTitle")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t("upload.zone.browseDesc")}
                </p>
                <Button variant="outline" className="border-gray-200 dark:border-gray-700 text-sm">
                  {t("upload.zone.browseButton")}
                </Button>
              </div>
            </div>
          </div>

          {/* Camera Capture */}
          <div
            className="group cursor-pointer"
            onClick={() => isMobile ? mobileCameraRef.current?.click() : setShowCameraDialog(true)}
          >
            <input
              ref={mobileCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onCameraCapture(file);
                e.target.value = "";
              }}
            />
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="font-medium text-black dark:text-white mb-2">
                  {t("upload.zone.cameraTitle")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t("upload.zone.cameraDesc")}
                </p>
                <Button variant="outline" className="border-gray-200 dark:border-gray-700 text-sm">
                  {t("upload.zone.cameraButton")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent className="sm:max-w-2xl apple-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-medium">
              <Camera className="w-5 h-5" />
              {t("upload.zone.dialogTitle")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span className="text-sm">{t("upload.zone.startingCamera")}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCameraDialog(false)}
              className="border-gray-200 dark:border-gray-700"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={capturePhoto}
              disabled={!isCameraReady}
              className="btn-primary"
            >
              {t("upload.zone.takePhoto")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}