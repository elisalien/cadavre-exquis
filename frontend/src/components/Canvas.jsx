import { useEffect, useRef, useState } from 'react';

const Canvas = ({ role, onSave, guide = true }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [tool, setTool] = useState('brush'); // brush, eraser
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const colors = [
    '#ffffff', // white
    '#ff6b6b', // red
    '#4ecdc4', // cyan
    '#ffe66d', // yellow
    '#a8e6cf', // mint
    '#ffd3b6', // peach
    '#dda0dd', // plum
    '#95e1d3', // aqua
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Set black background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw guide
    if (guide) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      if (role === 'head') {
        // Circle for head
        ctx.beginPath();
        ctx.arc(rect.width / 2, rect.height / 2, rect.height * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Rectangle for body/legs
        const w = rect.width * 0.6;
        const h = rect.height * 0.7;
        ctx.strokeRect((rect.width - w) / 2, (rect.height - h) / 2, w, h);
      }
      ctx.setLineDash([]);
    }

    saveToHistory(canvas);
  }, [role, guide]);

  const saveToHistory = (canvas) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.strokeStyle = tool === 'eraser' ? '#0a0a0a' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      saveToHistory(canvas);
      
      // Auto-save
      if (onSave) {
        onSave(canvas.toDataURL('image/png', 0.8));
      }
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      loadFromHistory(newStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      loadFromHistory(newStep);
    }
  };

  const loadFromHistory = (step) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[step];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory(canvas);
    if (onSave) {
      onSave(canvas.toDataURL('image/png', 0.8));
    }
  };

  const getCanvasData = () => {
    return canvasRef.current?.toDataURL('image/png', 0.8);
  };

  // Expose methods
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.getCanvasData = getCanvasData;
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="glass-panel p-3 mb-2 flex items-center justify-between gap-2">
        {/* Tools */}
        <div className="flex gap-2">
          <button
            onClick={() => setTool('brush')}
            className={`px-3 py-2 rounded ${
              tool === 'brush' ? 'bg-white/20' : 'bg-white/5'
            } transition-all text-sm`}
          >
            ✏️ Pinceau
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-3 py-2 rounded ${
              tool === 'eraser' ? 'bg-white/20' : 'bg-white/5'
            } transition-all text-sm`}
          >
            🧽 Gomme
          </button>
        </div>

        {/* History */}
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className="px-3 py-2 rounded bg-white/5 disabled:opacity-30 text-sm"
          >
            ↶ Annuler
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="px-3 py-2 rounded bg-white/5 disabled:opacity-30 text-sm"
          >
            ↷ Refaire
          </button>
        </div>

        {/* Clear */}
        <button
          onClick={clear}
          className="px-3 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-sm"
        >
          🗑️ Effacer
        </button>
      </div>

      {/* Color Palette */}
      {tool === 'brush' && (
        <div className="glass-panel p-3 mb-2 flex gap-2 justify-center">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${
                color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 glass-panel p-2">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair rounded"
        />
      </div>
    </div>
  );
};

export default Canvas;
