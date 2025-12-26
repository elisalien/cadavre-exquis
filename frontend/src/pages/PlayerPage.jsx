import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import Canvas from '../components/Canvas';
import ConnectionStatus from '../components/ConnectionStatus';

const PlayerPage = () => {
  const { socket, isConnected, connectionQuality } = useSocket();
  const [gameState, setGameState] = useState('waiting'); // waiting, drawing, validated, complete
  const [role, setRole] = useState(null);
  const [roleLabel, setRoleLabel] = useState('');
  const [teamProgress, setTeamProgress] = useState({ validated: 0, total: 3 });
  const [signature, setSignature] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const canvasRef = useRef(null);
  const autoSaveInterval = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Team assigned
    socket.on('team_assigned', (data) => {
      setRole(data.role);
      setRoleLabel(data.roleLabel);
      setGameState('drawing');
    });

    // Team progress
    socket.on('team_progress', (data) => {
      setTeamProgress(data);
    });

    // Drawing complete
    socket.on('drawing_complete', (data) => {
      setGameState('complete');
    });

    // Team disrupted
    socket.on('team_disrupted', (data) => {
      alert(data.message);
      resetGame();
    });

    return () => {
      socket.off('team_assigned');
      socket.off('team_progress');
      socket.off('drawing_complete');
      socket.off('team_disrupted');
    };
  }, [socket]);

  // Auto-save every 3 seconds
  useEffect(() => {
    if (gameState === 'drawing' && socket && canvasRef.current) {
      autoSaveInterval.current = setInterval(() => {
        const canvasData = canvasRef.current.getCanvasData?.();
        if (canvasData) {
          socket.emit('save_drawing', {
            canvasData,
            signature
          });
        }
      }, 3000);
    }

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [gameState, socket, signature]);

  const handleValidate = () => {
    if (!socket || !canvasRef.current) return;

    const canvasData = canvasRef.current.getCanvasData?.();
    if (!canvasData) return;

    socket.emit('validate_drawing', {
      canvasData,
      signature: signature.trim() || null
    });

    setGameState('validated');
  };

  const resetGame = () => {
    setGameState('waiting');
    setRole(null);
    setRoleLabel('');
    setTeamProgress({ validated: 0, total: 3 });
    setSignature('');
  };

  const handleSave = (canvasData) => {
    if (socket && gameState === 'drawing') {
      socket.emit('save_drawing', {
        canvasData,
        signature
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark p-4 relative">
      <ConnectionStatus quality={connectionQuality} isConnected={isConnected} />

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && gameState === 'waiting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel p-8 max-w-md animation-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-light mb-4">Bienvenue ! ✨</h2>
              <p className="text-white/70 mb-6 leading-relaxed">
                Tu vas créer un cadavre exquis avec 2 autres personnes.
                Chacun dessinera une partie sans voir ce que les autres font.
                <br /><br />
                Une fois terminé, le résultat complet apparaîtra sur l'écran de projection !
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="glass-button-primary w-full"
              >
                J'ai compris
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting State */}
      {gameState === 'waiting' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-light mb-2">Recherche d'une équipe...</h1>
            <p className="text-white/50">En attente de joueurs</p>
          </motion.div>
        </div>
      )}

      {/* Drawing State */}
      {gameState === 'drawing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col h-screen"
        >
          <div className="glass-panel p-4 mb-4">
            <h2 className="text-xl font-light mb-1">Tu dessines :</h2>
            <p className="text-3xl font-medium">{roleLabel}</p>
          </div>

          <div className="flex-1 mb-4">
            <Canvas 
              ref={canvasRef}
              role={role} 
              onSave={handleSave}
              guide={true}
            />
          </div>

          <div className="glass-panel p-4 space-y-3">
            <input
              type="text"
              placeholder="Ton pseudo (optionnel)"
              value={signature}
              onChange={(e) => setSignature(e.target.value.slice(0, 20))}
              maxLength={20}
              className="glass-input"
            />
            <p className="text-xs text-white/40">Laisse vide pour rester anonyme</p>
            
            <button
              onClick={handleValidate}
              className="glass-button-primary w-full text-lg"
            >
              ✓ Valider le dessin
            </button>
          </div>
        </motion.div>
      )}

      {/* Validated State */}
      {gameState === 'validated' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-panel p-8"
          >
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-light mb-2">Dessin validé !</h2>
            <p className="text-white/60">
              En attente de tes coéquipiers...
            </p>
            <p className="text-3xl font-medium mt-4">
              {teamProgress.validated}/{teamProgress.total}
            </p>
          </motion.div>
        </div>
      )}

      {/* Complete State */}
      {gameState === 'complete' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-panel p-8"
          >
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-light mb-4">Cadavre exquis créé !</h2>
            <p className="text-white/60 mb-8">
              Regarde l'écran de projection pour voir le résultat
            </p>
            <button
              onClick={resetGame}
              className="glass-button-primary"
            >
              Créer un nouveau cadavre exquis
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlayerPage;
