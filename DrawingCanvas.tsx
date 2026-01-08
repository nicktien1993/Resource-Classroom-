
import React, { useRef, useEffect, useState } from 'react';

interface Props {
  height?: number;
  id: string;
}

const DrawingCanvas: React.FC<Props> = ({ height = 400, id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  
  const state = useRef({
    lastX: 0,
    lastY: 0,
    snapshot: null as ImageData | null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    const resizeCanvas = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // 儲存現有繪圖
      if (canvas.width > 0 && canvas.height > 0) {
        state.current.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // 繪製背景線（輔助格子）
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      for (let y = 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }

      // 還原繪圖
      if (state.current.snapshot) {
        ctx.putImageData(state.current.snapshot, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [height]);

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
    <div ref={containerRef} className="w-full bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner no-print">
      <div className="p-3 bg-slate-50 border-b flex gap-4">
        <button onClick={() => setTool('pen')} className={`px-4 py-1 rounded-lg font-bold text-sm ${tool === 'pen' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-400'}`}>🖊️ 畫筆</button>
        <button onClick={() => setTool('eraser')} className={`px-4 py-1 rounded-lg font-bold text-sm ${tool === 'eraser' ? 'bg-rose-500 text-white' : 'bg-white border text-slate-400'}`}>🧽 擦除</button>
        <div className="flex gap-2 ml-auto">
          {['#000000', '#ef4444', '#3b82f6'].map(c => (
            <button key={c} onClick={() => { setBrushColor(c); setTool('pen'); }} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={() => setIsDrawing(false)} 
        className="w-full cursor-crosshair block touch-none" 
      />
    </div>
  );
};

export default DrawingCanvas;
