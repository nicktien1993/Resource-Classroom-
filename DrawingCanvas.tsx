
import React, { useRef, useEffect, useState } from 'react';

interface Props {
  height?: number;
  id: string;
  isVisible?: boolean;
}

const DrawingCanvas: React.FC<Props> = ({ height = 400, id, isVisible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  
  const state = useRef({
    lastX: 0,
    lastY: 0,
    currentWidth: 0,
    snapshot: null as ImageData | null,
    resizeTimeout: null as number | null,
  });

  const syncCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current || !isVisible) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || Math.abs(rect.width - state.current.currentWidth) < 2) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 安全檢查：只有當前寬度大於 0 且 canvas 本身有尺寸時才擷取快照
    if (state.current.currentWidth > 0 && canvas.width > 0 && canvas.height > 0) {
      try {
        state.current.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.warn("Failed to get image data", e);
      }
    }

    state.current.currentWidth = rect.width;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 繪製背景線
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1;
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    if (state.current.snapshot) {
      try {
        ctx.putImageData(state.current.snapshot, 0, 0);
      } catch (e) {
        // 快照尺寸不符時不還原
      }
    }
  };

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (state.current.resizeTimeout) window.clearTimeout(state.current.resizeTimeout);
      state.current.resizeTimeout = window.setTimeout(syncCanvas, 100);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    state.current.lastX = x;
    state.current.lastY = y;
    setIsDrawing(true);

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? 30 : 4;
    ctx.strokeStyle = brushColor;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const rect = canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(state.current.lastX, state.current.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    state.current.lastX = x;
    state.current.lastY = y;
  };

  return (
    <div ref={containerRef} className="w-full bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner">
      <div className="p-3 bg-slate-50 border-b flex gap-4">
        <button onClick={() => setTool('pen')} className={`px-4 py-1 rounded-lg font-bold ${tool === 'pen' ? 'bg-slate-800 text-white' : 'bg-white'}`}>🖊️ 筆</button>
        <button onClick={() => setTool('eraser')} className={`px-4 py-1 rounded-lg font-bold ${tool === 'eraser' ? 'bg-rose-500 text-white' : 'bg-white'}`}>🧽 擦</button>
        <button onClick={() => setBrushColor('#ef4444')} className="w-8 h-8 rounded-full bg-red-500 border-2 border-white" />
        <button onClick={() => setBrushColor('#3b82f6')} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white" />
        <button onClick={() => setBrushColor('#000000')} className="w-8 h-8 rounded-full bg-black border-2 border-white" />
      </div>
      <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => setIsDrawing(false)} className="w-full cursor-crosshair block touch-none" />
    </div>
  );
};

export default DrawingCanvas;
