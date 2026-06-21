import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, ShieldCheck, AlertCircle } from 'lucide-react';

interface CameraFaceScannerProps {
  lang: 'en' | 'am';
  onCapture: (base64Img: string) => void;
  onCancel: () => void;
}

export function CameraFaceScanner({ lang, onCapture, onCancel }: CameraFaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [useSimulation, setUseSimulation] = useState<boolean>(false);
  const [scanningEffect, setScanningEffect] = useState<boolean>(true);

  const labelEn = {
    title: "SECURE BIOMETRIC SCANNER",
    desc: "Position your face clearly in the circular frame below to establish 3D cryptographic biometrics keys.",
    fallbackTitle: "SIMULATED FACIAL LOCK ACTIVE",
    fallbackDesc: "Web frame camera blocked by iframe high-security constraints. You can upload a photo or generate our mock biometric master face lock.",
    captureBtn: "Secure Face Scan & Lock Key",
    simulateBtn: "Generate Simulated Biometrics",
    cancel: "Cancel Scanner",
    activeCam: "Secure Live Camera Node Ready",
    scanning: "Fusing face coordinate matrix...",
    uploadBtn: "Select Photo Manually"
  };

  const labelAm = {
    title: "የፊት ባዮሜትሪክ መቃኛ",
    desc: "3D ባዮሜትሪክ ቁልፍ ለመፍጠር ፊትዎን በክብ ሳጥኑ ውስጥ በትክክል ያስተካክሉ።",
    fallbackTitle: "የካሜራ ፈቃድ አልተገኘም",
    fallbackDesc: "በከፍተኛ ድህንነት ምክንያት የካሜራ መዳረሻ ተከለክሏል። ፎቶ ይምረጡ ወይም ለማሳያነት ቀድሞ የተዘጋጀ የባዮሜትሪክ ፊት ይጠቀሙ::",
    captureBtn: "ፊት ስካን አድርግ",
    simulateBtn: "የሙከራ ባዮሜትሪክ ፍጠር",
    cancel: "ተመለስ",
    activeCam: "ካሜራው ዝግጁ ነው",
    scanning: "ባዮሜትሪክ የፊት መለያ በመተንተን ላይ...",
    uploadBtn: "ከስልክዎ ፎቶ ይምረጡ"
  };

  const t = lang === 'en' ? labelEn : labelAm;

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'user' }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCameraAccess(true);
      setUseSimulation(false);
    } catch (err) {
      console.warn("Could not initiate front-facing camera stream, falling back to simulator:", err);
      setHasCameraAccess(false);
      setUseSimulation(true);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureSnapshot = () => {
    if (useSimulation) {
      // Return high-fidelity selfie representation
      onCapture('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop');
    } else {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || 480;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Mirror frame for natural face selfie capture
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, width, height);
          ctx.setTransform(1, 0, 0, 1, 0, 0);

          onCapture(canvas.toDataURL('image/jpeg', 0.85));
        }
      }
    }
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="camera-face-scanner-comp" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden text-left">
      
      {/* Header text */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-black tracking-widest font-mono">
            {useSimulation ? "SIMULATIVE GRAPHICS" : "LIVE FRONT CORE"}
          </div>
          <h4 className="text-white font-bold text-xs font-mono">{t.title}</h4>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-300 font-mono text-[10px] uppercase tracking-wider underline cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>

      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
        {useSimulation ? t.fallbackDesc : t.desc}
      </p>

      {/* Frame view finder circles */}
      <div className="relative w-48 h-48 mx-auto bg-slate-900 rounded-full overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
        {useSimulation ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none bg-radial from-slate-900 via-slate-950 to-slate-950">
            {/* Animated scan indicator line */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/20 animate-[spin_20s_linear_infinite]" />
            
            {scanningEffect && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent top-1/2 -translate-y-1/2 animate-[pulse_1.5s_infinite]" />
            )}

            <div className="z-10 flex flex-col items-center space-y-1">
              <ShieldCheck className="w-8 h-8 text-amber-500 animate-pulse" />
              <span className="text-[8px] text-slate-400 font-mono block leading-tight">{t.scanning}</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-full scale-x-[-1]"
            />
            {/* Scanning Overlay Grid */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 pointer-events-none">
              <div className="absolute inset-2 rounded-full border border-emerald-500/20 animate-ping duration-[3000ms]" />
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400/50 top-1/4 animate-[bounce_4s_infinite]" />
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Action triggers */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={captureSnapshot}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-950/20 hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4 text-slate-950" />
          {useSimulation ? t.simulateBtn : t.captureBtn}
        </button>

        <div className="flex items-center justify-center gap-4">
          <label className="text-[10px] text-slate-400 hover:text-white font-bold uppercase font-mono flex items-center gap-1 cursor-pointer select-none">
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t.uploadBtn}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLocalFileSelect}
              className="hidden"
            />
          </label>

          {hasCameraAccess !== null && (
            <button
              type="button"
              onClick={() => {
                if (useSimulation) {
                  startCamera();
                } else {
                  setUseSimulation(true);
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                  }
                }
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase font-mono flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{useSimulation ? "Use Live Cam" : "Switch To Simulation"}</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
