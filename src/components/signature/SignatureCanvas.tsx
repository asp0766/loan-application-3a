import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, ShieldAlert, PenLine } from 'lucide-react';
import { Button } from '../common/Button';

export interface SignatureCanvasProps {
  value?: string; // Base64 PNG
  onChange?: (base64Png: string | undefined) => void;
  label?: string;
  isRequired?: boolean;
  error?: string;
  className?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  value,
  onChange,
  label = 'Applicant Digital E-Signature',
  isRequired = true,
  error,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(value));
  const [isCanvasBlurred, setIsCanvasBlurred] = useState(false);

  // Initialize canvas context and handle high-DPI scaling
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1F4E79'; // LendSwift Blue stroke
    ctx.lineWidth = 2.5;

    // If an existing signature image is present, draw it onto canvas
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  // Check if canvas is truly non-empty
  const checkIfCanvasEmpty = (canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] > 0) return false;
    }
    return true;
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isEmpty = checkIfCanvasEmpty(canvas);
    if (!isEmpty) {
      const dataUrl = canvas.toDataURL('image/png');
      setHasDrawn(true);
      onChange?.(dataUrl);
    } else {
      setHasDrawn(false);
      onChange?.(undefined);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    onChange?.(undefined);
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
          {isRequired && (
            <span className="text-lendswift-red-600 ml-1 font-bold" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {hasDrawn && (
          <span className="inline-flex items-center gap-1 text-xs text-lendswift-green-700 font-semibold bg-lendswift-green-50 px-2 py-0.5 rounded-full border border-lendswift-green-200">
            <Check className="w-3.5 h-3.5" /> Signature Recorded
          </span>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-2xl bg-white overflow-hidden transition-all duration-200
          ${
            error
              ? 'border-lendswift-red-400 bg-lendswift-red-50/20'
              : hasDrawn
              ? 'border-lendswift-blue-400 shadow-inner'
              : 'border-slate-300 hover:border-slate-400'
          }
        `}
        onMouseEnter={() => setIsCanvasBlurred(false)}
        onMouseLeave={() => setIsCanvasBlurred(false)}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-44 cursor-crosshair touch-none select-none block"
          aria-label="Draw your signature using mouse or touch finger"
        />

        {/* Security Privacy Overlay on Blur if enabled */}
        {isCanvasBlurred && hasDrawn && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center text-white text-xs font-medium gap-1.5 pointer-events-none">
            <ShieldAlert className="w-4 h-4 text-lendswift-amber-400" />
            <span>Signature Protected — Hover or tap to edit</span>
          </div>
        )}

        {/* Placeholder hint when canvas is blank */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1.5">
            <PenLine className="w-6 h-6 stroke-[1.5]" />
            <p className="text-xs font-medium">Draw your legal signature inside the box using mouse or finger</p>
          </div>
        )}

        {/* Baseline signing guideline rule */}
        <div className="absolute bottom-6 left-8 right-8 border-b border-slate-200/80 pointer-events-none flex justify-end">
          <span className="text-[10px] text-slate-400 tracking-wider font-mono">Sign above line</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-[11px] text-slate-500 leading-normal">
          Section 3A IT Act 2000 demonstration artifact. Stored in client memory.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          disabled={!hasDrawn}
          leftIcon={<Eraser className="w-3.5 h-3.5" />}
        >
          Clear Canvas
        </Button>
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="text-xs text-lendswift-red-600 mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
