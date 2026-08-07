import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Modal, Button } from './ui';
import {
  Camera,
  Upload,
  FileUp,
  Aperture,
  X,
  ImageIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface Props {
  onPick: (file: File) => void;
  onClear: () => void;
  preview: string | null;
  fileName: string | null;
}

export default function PhotoPicker({ onPick, onClear, preview, fileName }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    setCameraError('');
    setCameraBusy(true);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.name === 'NotAllowedError'
            ? 'Camera access was denied. Allow camera permission in your browser and try again.'
            : err.name === 'NotFoundError'
              ? 'No camera was found on this device.'
              : err.message
          : 'Could not start the camera.';
      setCameraError(msg);
    } finally {
      setCameraBusy(false);
    }
  };

  const openCamera = () => {
    setCameraOpen(true);
    startCamera(facing);
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError('');
  };

  const flipCamera = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  };

  const capture = () => {
    if (!videoRef.current) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCapturing(false);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File(
            [blob],
            `camera_${Date.now()}.jpg`,
            { type: 'image/jpeg' }
          );
          onPick(file);
        }
        stopCamera();
        setCameraOpen(false);
        setCapturing(false);
      },
      'image/jpeg',
      0.92
    );
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    e.target.value = '';
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1.5">
        Product Photo / File
      </label>

      {preview ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-navy-200 bg-navy-50/50">
          {fileName && /\.(pdf|docx?|xlsx?|txt|csv)$/i.test(fileName) ? (
            <div className="w-16 h-16 rounded-lg bg-white border border-navy-200 flex items-center justify-center shrink-0">
              <FileUp className="w-7 h-7 text-navy-500" />
            </div>
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover border border-navy-200 shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-navy-800 truncate">
              {fileName || 'Selected file'}
            </p>
            <p className="text-xs text-navy-400">Ready to upload</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-navy-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 px-3 py-4 border border-navy-200 rounded-lg hover:bg-navy-50 hover:border-navy-400 transition-colors text-center"
          >
            <ImageIcon className="w-5 h-5 text-navy-600" />
            <span className="text-xs font-semibold text-navy-700">Upload Photo</span>
            <span className="text-[11px] text-navy-400">From gallery</span>
          </button>

          <button
            type="button"
            onClick={openCamera}
            className="flex flex-col items-center justify-center gap-2 px-3 py-4 border border-navy-200 rounded-lg hover:bg-navy-50 hover:border-navy-400 transition-colors text-center"
          >
            <Camera className="w-5 h-5 text-navy-600" />
            <span className="text-xs font-semibold text-navy-700">Open Camera</span>
            <span className="text-[11px] text-navy-400">Take a photo</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 px-3 py-4 border border-navy-200 rounded-lg hover:bg-navy-50 hover:border-navy-400 transition-colors text-center"
          >
            <FileUp className="w-5 h-5 text-navy-600" />
            <span className="text-xs font-semibold text-navy-700">Upload File</span>
            <span className="text-[11px] text-navy-400">Invoice, PDF, etc.</span>
          </button>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onImageChange}
      />

      <Modal open={cameraOpen} onClose={closeCamera} title="Take Photo">
        <div className="space-y-4">
          {cameraError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {cameraError}
            </div>
          )}

          <div className="relative bg-navy-950 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {cameraBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-navy-950/60">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={flipCamera} disabled={cameraBusy}>
              <RefreshCw className="w-4 h-4" /> Flip
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeCamera}>Cancel</Button>
              <Button onClick={capture} disabled={cameraBusy || capturing || !!cameraError}>
                {capturing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Aperture className="w-4 h-4" />
                )}
                Capture
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
