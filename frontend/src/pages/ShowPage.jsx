import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';

const ShowPage = () => {
  const { socket } = useSocket();
  const [drawings, setDrawings] = useState([]);
  const [settings, setSettings] = useState({
    animation: 'wiggle',
    hideUI: false,
    showSignatures: true
  });

  useEffect(() => {
    // Fetch existing drawings
    fetchDrawings();

    if (!socket) return;

    // New drawing
    socket.on('new_drawing', (data) => {
      setDrawings((prev) => [data, ...prev]);
    });

    // Delete drawing
    socket.on('delete_drawing', (data) => {
      setDrawings((prev) => prev.filter((d) => d.id !== data.id));
    });

    // Update settings
    socket.on('update_settings', (data) => {
      setSettings(data);
    });

    // Session reset
    socket.on('session_reset', () => {
      setDrawings([]);
    });

    return () => {
      socket.off('new_drawing');
      socket.off('delete_drawing');
      socket.off('update_settings');
      socket.off('session_reset');
    };
  }, [socket]);

  const fetchDrawings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/drawings`);
      const data = await response.json();
      
      const formatted = data.map(d => ({
        id: d.id,
        headData: d.head_data,
        bodyData: d.body_data,
        legsData: d.legs_data,
        signatures: [d.head_signature, d.body_signature, d.legs_signature]
          .filter(Boolean)
          .join(' • ') || null,
        createdAt: d.created_at
      }));
      
      setDrawings(formatted);
    } catch (error) {
      console.error('Error fetching drawings:', error);
    }
  };

  const getAnimationClass = () => {
    switch (settings.animation) {
      case 'wiggle':
        return 'hover:rotate-1 transition-transform duration-300';
      case 'rotation':
        return 'animate-spin-slow';
      case 'breathing':
        return 'animation-pulse-soft';
      case 'static':
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen bg-dark ${settings.hideUI ? '' : 'p-8'}`}>
      <AnimatePresence>
        {!settings.hideUI && (
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-4xl font-light text-center mb-12 text-white/80"
          >
            Cadavres Exquis
          </motion.h1>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <AnimatePresence>
          {drawings.map((drawing, index) => (
            <motion.div
              key={drawing.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-panel p-4 ${getAnimationClass()}`}
            >
              {/* Drawing parts */}
              <div className="space-y-1 mb-3">
                <div className="w-full aspect-square bg-dark/50 rounded overflow-hidden">
                  <img 
                    src={drawing.headData} 
                    alt="Tête" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full aspect-square bg-dark/50 rounded overflow-hidden">
                  <img 
                    src={drawing.bodyData} 
                    alt="Buste" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full aspect-square bg-dark/50 rounded overflow-hidden">
                  <img 
                    src={drawing.legsData} 
                    alt="Jambes" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Signatures */}
              {settings.showSignatures && drawing.signatures && (
                <p className="text-center text-xs text-white/50 mt-2">
                  {drawing.signatures}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {drawings.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <p className="text-white/40 text-xl">En attente de créations...</p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ShowPage;
