import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Scan, ShieldCheck, CheckCircle2, Upload } from 'lucide-react';

interface CameraIdScannerProps {
  lang: 'en' | 'am';
  onCapture: (base64Img: string) => void;
  onCancel: () => void;
}

export function CameraIdScanner({ lang, onCapture, onCancel }: CameraIdScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [useSimulation, setUseSimulation] = useState<boolean>(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [scanningEffect, setScanningEffect] = useState<boolean>(true);

  // Internationalization labels
  const labelEn = {
    title: "ALGORITHMIC ID SCANNER (SECURE)",
    desc: "Align your National ID, Passport, or Kebele Card inside the glowing target guidelines.",
    fallbackTitle: "SIMULATED / UPLOAD FLOW ACTIVE",
    fallbackDesc: "Camera blocked by high-security sandboxed web iframe permissions. You can upload a standard photo or use our high-fidelity instant ID generator simulation for testing.",
    captureBtn: "Secure Optical Scan & Capture",
    simulateBtn: "Generate Realistic Mock ID Card",
    uploadBtn: "Select File manually",
    retake: "Retake Scan",
    activeCam: "Secure Live Camera Node Ready",
    scanning: "Optical character check reading live...",
    cancel: "Cancel Scanner",
    requestAccess: "Request Camera Access",
    noCamera: "No camera devices detected."
  };

  const labelAm = {
    title: "ደህንነቱ የተጠበቀ የID ካርድ መቃኛ",
    desc: "የማንነት መታወቂያዎን ወይም ፓስፖርትዎን በሚያበራው አረንጓዴ ሳጥን ውስጥ በትክክል ያስተካክሉ።",
    fallbackTitle: "የካሜራ ፈቃድ አልተገኘም (ማስመሰያ ገባሪ)",
    fallbackDesc: "በከፍተኛ ድህንነት ምክንያት የካሜራ መዳረሻ ተከልክሏል። መታወቂያ ፋይል ይምረጡ ወይም ለማሳያነት የሚሆን መታወቂያ ወዲያውኑ ይፍጠሩ።",
    captureBtn: "ፎቶ አንሳ እና መዝግብ",
    simulateBtn: "የሙከራ መታወቂያ ወዲያውኑ ፍጠር",
    uploadBtn: "ከስልክዎ መዝግብ",
    retake: "እንደገና አንሳ",
    activeCam: "ካሜራው ዝግጁ ነው",
    scanning: "የመታወቂያ ንባብ በመካሄድ ላይ...",
    cancel: "ተመለስ",
    requestAccess: "ካሜራ ክፈት",
    noCamera: "ምንም ካሜራ አልተገኘም።"
  };

  const t = lang === 'en' ? labelEn : labelAm;

  // Initialize camera stream
  const startCamera = async (deviceId?: string) => {
    try {
      setErrorMsg('');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: 'environment' }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCameraAccess(true);
      setUseSimulation(false);

      // Fetch other cams
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      console.warn("Could not initiate actual device hardware camera:", err);
      setHasCameraAccess(false);
      setUseSimulation(true); // Fallback to simulated scanning matrix
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

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    startCamera(devId);
  };

  // Capture image frame
  const captureSnapshot = () => {
    if (useSimulation) {
      // Return beautiful preassembled placeholder national ID vector data URI
      // Beautiful SVG of a realistic Ethiopian/National ID 
      const mockIdDataUri = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'><rect width='400' height='250' rx='12' fill='%230f172a' stroke='%23f59e0b' stroke-width='3'/><rect x='15' y='15' width='370' height='220' rx='8' fill='%231e293b' stroke='%23334155'/><circle cx='80' cy='110' r='45' fill='%23475569'/><rect x='45' y='165' width='70' height='10' rx='2' fill='%23f59e0b'/><text x='150' y='60' fill='white' font-family='monospace' font-size='16' font-weight='bold'>NATIONAL IDENTITY CARD</text><text x='150' y='80' fill='%2394a3b8' font-family='monospace' font-size='11'>REPUBLIC OF ETHIOPIA</text><rect x='150' y='100' width='160' height='10' rx='2' fill='%23475569'/><rect x='150' y='120' width='210' height='8' rx='2' fill='%23334155'/><rect x='150' y='135' width='180' height='8' rx='2' fill='%23334155'/><rect x='150' y='150' width='120' height='8' rx='2' fill='%23334155'/><text x='150' y='190' fill='%2310b981' font-family='monospace' font-size='11' font-weight='bold'>VALID ID NO: ET-48194420</text><rect x='310' y='175' width='50' height='40' fill='white' stroke='%230f172a'/><line x1='315' y1='185' x2='355' y2='185' stroke='black' stroke-width='2'/><line x1='320' y1='195' x2='350' y2='195' stroke='black' stroke-width='2'/><line x1='315' y1='205' x2='345' y2='205' stroke='black' stroke-width='2'/></svg>";
      onCapture(mockIdDataUri);
    } else {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw video image mirror flipped if it's user facing (though ID scans are back cams so standard draw is perfect)
          ctx.drawImage(video, 0, 0, width, height);

          // Standardize image
          const base64Data = canvas.toDataURL('image/jpeg', 0.85);
          onCapture(base64Data);
        }
      }
    }
  };

  // Local File Upload manual trigger
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
    <div id="camera-id-scanner-comp" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 bg-amber-500/10 rounded border border-amber-500/20 text-amber-500 text-[10px] uppercase font-black tracking-widest font-mono">
            {useSimulation ? "MOCK SCAN NODE" : "LIVE SCAN CORE"}
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

      {/* Main scanner visualization screen */}
      <div className="relative w-full aspect-[4/3] max-w-sm mx-auto bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        
        {useSimulation ? (
          // SIMULATED OPTICAL SCANNING GRAPHIC
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-radial from-slate-900 via-slate-950 to-slate-950">
            {/* Ambient matrix style background lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40"></div>
            
            {/* Bounding template frame */}
            <div className="w-11/12 h-4/5 border-2 border-dashed border-amber-505/30 rounded-lg flex flex-col items-center justify-between p-4 relative bg-slate-900/60 overflow-hidden shadow-2xl border-amber-500/50">
              {/* Target glowing corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-500 rounded-tl"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-500 rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-500 rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-500 rounded-br"></div>

              {/* Animated laser swipe effect */}
              {scanningEffect && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent top-0 animate-[bounce_3s_infinite]" />
              )}

              {/* Mock ID mockup representation */}
              <div className="w-[140px] aspect-[1.6/1] bg-slate-950 rounded border border-slate-800 p-2 text-left opacity-80 self-center">
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/10 flex items-center justify-center text-[5px] text-amber-500 font-bold">ET</div>
                  <div className="h-1 w-12 bg-slate-800 rounded"></div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-slate-850 rounded" />
                  <div className="space-y-1 flex-1">
                    <div className="h-1 bg-slate-800 rounded w-10" />
                    <div className="h-0.5 bg-slate-850 rounded w-14" />
                    <div className="h-0.5 bg-slate-850 rounded w-8" />
                  </div>
                </div>
              </div>

              <div className="space-y-0.5 relative z-10">
                <span className="text-[10px] text-amber-500 font-black tracking-widest font-mono block uppercase">{t.activeCam}</span>
                <span className="text-[8px] text-slate-400 font-mono block leading-tight">{t.scanning}</span>
              </div>
            </div>
          </div>
        ) : (
          // ACTUAL HARDWARE CAMERA STREAM
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanning Matrix Overlay Interface */}
            <div className="absolute inset-0 flex flex-col items-center justify-between p-4 pointer-events-none">
              {/* Safe Alignment bounding frame */}
              <div className="w-11/12 h-4/5 border-2 border-emerald-500/40 rounded-lg relative">
                {/* Targeting bracket corners */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-500"></div>
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-500"></div>
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-500"></div>
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-500"></div>

                {/* Sweeping optical scanning bar */}
                <div className="absolute inset-x-0 h-0.5 bg-emerald-400 opacity-60 top-0 animate-[bounce_2.5s_infinite]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-slate-950/80 border border-slate-900 px-3 py-1 rounded text-[8px] text-slate-300 font-black font-mono uppercase tracking-wider">
                    ALIGN ID TO RETICLE
                  </span>
                </div>
              </div>

              {/* Live telemetry status */}
              <div className="bg-slate-950/75 border border-slate-900 px-3 py-1 rounded-full text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 self-center">
                <Scan className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span>CAMERA RESOLUTION: SYNCED</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden temporary canvas for optical rendering snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera device selection dropdown (if multiple cameras exist) */}
      {!useSimulation && devices.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 uppercase font-black font-mono">Camera:</span>
          <select
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            className="flex-1 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] text-slate-350 focus:outline-none"
          >
            {devices.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Control Actions buttons area */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={captureSnapshot}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-amber-950/20 hover:scale-[1.01] active:translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4 text-slate-950" />
          {useSimulation ? t.simulateBtn : t.captureBtn}
        </button>

        <div className="flex items-center justify-center gap-3">
          {/* External manual selection tool */}
          <label className="text-[10px] text-slate-400 hover:text-white font-bold uppercase font-mono flex items-center gap-1 cursor-pointer select-none">
            <Upload className="w-3.5 h-3.5 text-amber-550" />
            <span>{t.uploadBtn}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLocalFileSelect}
              className="hidden"
            />
          </label>

          {/* Toggle scan mode simulation fallback manually */}
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
              <span>{useSimulation ? "Enable Real Web Camera" : "Switch To Simulation"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
