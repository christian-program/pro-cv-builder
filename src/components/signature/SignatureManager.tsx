import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Upload,
  Camera,
  PenTool,
  Check,
  X,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Loader2,
  Trash2,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';

interface SignatureManagerProps {
  currentSignature?: string | null;
  onSave: (signatureDataUrl: string) => void;
  onRemove?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const SignatureManager: React.FC<SignatureManagerProps> = ({
  currentSignature,
  onSave,
  onRemove,
  onClose,
  isModal = false,
}) => {
  const { user, updateSignature } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'draw'>('upload');

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Drawing canvas state
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Processed signature preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentSignature || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contrastThreshold, setContrastThreshold] = useState<number>(205);
  const [removeBackground, setRemoveBackground] = useState<boolean>(true);
  const [rawCapturedImage, setRawCapturedImage] = useState<HTMLImageElement | null>(null);

  // Stop camera when unmounting or switching tabs
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
    }
  }, [activeTab, stopCamera]);

  // Start live camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Impossible d’accéder à la caméra. Vérifiez les autorisations du navigateur ou importez un fichier.'
      );
      setIsCameraActive(false);
    }
  };

  // Image processing: thresholding to remove white paper background & auto-crop
  const processImageToCleanSignature = (
    img: HTMLImageElement,
    threshold: number,
    transparentBg: boolean
  ) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let hasInk = false;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Perceptual luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      const pixelIndex = i / 4;
      const x = pixelIndex % canvas.width;
      const y = Math.floor(pixelIndex / canvas.width);

      if (lum < threshold) {
        // Ink pixel detected
        hasInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        if (transparentBg) {
          // Darken ink to rich dark-blue/black for crisp print reproduction
          const inkIntensity = (threshold - lum) / threshold;
          data[i] = Math.max(15, Math.round(r * 0.4));
          data[i + 1] = Math.max(25, Math.round(g * 0.45));
          data[i + 2] = Math.max(50, Math.round(b * 0.6));
          data[i + 3] = Math.min(255, Math.round(inkIntensity * 255 * 1.4));
        }
      } else {
        // Paper background
        if (transparentBg) {
          data[i + 3] = 0; // Transparent
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // If ink was found, crop closely with 16px padding
    if (hasInk && maxX > minX && maxY > minY) {
      const pad = 16;
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(canvas.width - cropX, maxX - minX + pad * 2);
      const cropH = Math.min(canvas.height - cropY, maxY - minY + pad * 2);

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropW;
      croppedCanvas.height = cropH;
      const croppedCtx = croppedCanvas.getContext('2d');
      if (croppedCtx) {
        croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        setPreviewUrl(croppedCanvas.toDataURL('image/png'));
        return;
      }
    }

    setPreviewUrl(canvas.toDataURL('image/png'));
  };

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 8 Mo)');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setRawCapturedImage(img);
        processImageToCleanSignature(img, contrastThreshold, removeBackground);
        setIsProcessing(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Capture from live camera
  const captureFromCamera = () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    const img = new Image();
    img.onload = () => {
      setRawCapturedImage(img);
      processImageToCleanSignature(img, contrastThreshold, removeBackground);
      setIsProcessing(false);
      stopCamera();
    };
    img.src = dataUrl;
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep slate ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && drawCanvasRef.current) {
      setIsDrawing(false);
      setPreviewUrl(drawCanvasRef.current.toDataURL('image/png'));
    }
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setPreviewUrl(null);
  };

  // Re-process when threshold or background toggle changes
  const handleThresholdChange = (val: number) => {
    setContrastThreshold(val);
    if (rawCapturedImage) {
      processImageToCleanSignature(rawCapturedImage, val, removeBackground);
    }
  };

  const handleToggleBackground = (val: boolean) => {
    setRemoveBackground(val);
    if (rawCapturedImage) {
      processImageToCleanSignature(rawCapturedImage, contrastThreshold, val);
    }
  };

  // Save signature to callback and account
  const handleSaveSignature = async () => {
    if (!previewUrl) return;
    onSave(previewUrl);

    // Save to user account if available
    try {
      await updateSignature(previewUrl);
    } catch (e) {
      console.error('Failed to save signature to profile', e);
    }

    if (onClose) onClose();
  };

  return (
    <div className={`space-y-5 ${isModal ? '' : 'p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800'}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Gestion de votre signature</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Importez ou photographiez votre signature manuscrite pour l’apposer automatiquement sur vos lettres.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Importer une photo</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('camera');
            startCamera();
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'camera'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Caméra en direct</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('draw')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'draw'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Dessiner</span>
        </button>
      </div>

      {/* Tab 1: Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Cliquez pour importer la photo de votre signature
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Prenez une feuille blanche avec votre signature au stylo noir/bleu (PNG, JPG jusqu'à 8 Mo).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Camera Capture */}
      {activeTab === 'camera' && (
        <div className="space-y-3">
          {cameraError ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 text-xs font-bold text-rose-700 dark:text-rose-300 underline"
                >
                  Réessayer l’accès caméra
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Guide Overlay rectangle */}
              <div className="absolute inset-x-12 inset-y-8 border-2 border-dashed border-white/70 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2 shadow-2xs">
                <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-xs">
                  Placez votre signature sur papier blanc dans ce cadre
                </span>
                <span className="text-[9px] text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                  Évitez les ombres et assurez une bonne lumière
                </span>
              </div>

              {/* Shutter button */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={captureFromCamera}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Capturer la photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Draw Canvas */}
      {activeTab === 'draw' && (
        <div className="space-y-2">
          <div className="relative border border-slate-300 dark:border-slate-700 rounded-xl bg-white overflow-hidden shadow-2xs">
            <canvas
              ref={drawCanvasRef}
              width={500}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 touch-none cursor-crosshair block"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400">
                Signez ici avec votre doigt ou stylet...
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={clearDrawing}
              disabled={!hasDrawn}
              className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors disabled:opacity-30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effacer le tracé</span>
            </button>
            <span className="text-[11px] text-slate-400">Tracé fluide haute précision</span>
          </div>
        </div>
      )}

      {/* Processed Signature Preview & Enhancement Bar */}
      {previewUrl && (
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Résultat nettoyé & détouré (fond transparent) :</span>
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setRawCapturedImage(null);
                  onRemove();
                }}
                className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Supprimer</span>
              </button>
            )}
          </div>

          {/* Checkerboard container for transparency preview */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] flex items-center justify-center min-h-[90px]">
            <img
              src={previewUrl}
              alt="Signature détourée"
              className="max-h-20 max-w-full object-contain filter drop-shadow-xs"
            />
          </div>

          {/* Fine-tuning controls if raw captured image exists */}
          {rawCapturedImage && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Seuil de détourage du papier :</span>
                </span>
                <span className="tabular-nums font-mono text-[11px]">{contrastThreshold}</span>
              </div>
              <input
                type="range"
                min={140}
                max={245}
                value={contrastThreshold}
                onChange={(e) => handleThresholdChange(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Encre plus fine</span>
                <span>Encre plus renforcée</span>
              </div>
            </div>
          )}

          {/* Save Action */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveSignature}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer et utiliser cette signature</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
