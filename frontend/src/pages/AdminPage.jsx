import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import Canvas from '../components/Canvas';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const AdminPage = () => {
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    connectedPlayers: 0,
    waitingPlayers: 0,
    activeTeams: 0
  });
  const [drawings, setDrawings] = useState([]);
  const [settings, setSettings] = useState({
    animation: 'wiggle',
    hideUI: false,
    showSignatures: true,
    columns: 3
  });
  const [testMode, setTestMode] = useState(false);
  const [testPart, setTestPart] = useState('head'); // head, body, legs
  const [testSignatures, setTestSignatures] = useState({
    head: 'Test Head',
    body: 'Test Body',
    legs: 'Test Legs'
  });
  const canvasRefs = {
    head: useRef(null),
    body: useRef(null),
    legs: useRef(null)
  };

  useEffect(() => {
    fetchStats();
    fetchDrawings();

    const statsInterval = setInterval(fetchStats, 3000);
    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_drawing', () => {
      fetchDrawings();
    });

    socket.on('delete_drawing', () => {
      fetchDrawings();
    });

    return () => {
      socket.off('new_drawing');
      socket.off('delete_drawing');
    };
  }, [socket]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDrawings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/drawings`);
      const data = await response.json();
      setDrawings(data);
    } catch (error) {
      console.error('Error fetching drawings:', error);
    }
  };

  const handleDeleteDrawing = async (id) => {
    if (!confirm('Supprimer ce cadavre exquis ?')) return;

    try {
      await fetch(`${BACKEND_URL}/api/drawings/${id}`, {
        method: 'DELETE'
      });
      fetchDrawings();
    } catch (error) {
      console.error('Error deleting drawing:', error);
    }
  };

  const handleResetSession = async () => {
    if (!confirm('⚠️ Réinitialiser la session ? Tous les dessins seront supprimés.')) return;

    try {
      await fetch(`${BACKEND_URL}/api/reset-session`, {
        method: 'POST'
      });
      fetchDrawings();
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  };

  const handleDownloadAll = async () => {
    alert('Fonctionnalité à implémenter : téléchargement ZIP');
  };

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (socket) {
      socket.emit('update_settings', newSettings);
    }
  };

  const handleTestSubmit = async () => {
    const headData = canvasRefs.head.current?.getCanvasData?.();
    const bodyData = canvasRefs.body.current?.getCanvasData?.();
    const legsData = canvasRefs.legs.current?.getCanvasData?.();

    if (!headData || !bodyData || !legsData) {
      alert('Dessine les 3 parties !');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/drawings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          head_data: headData,
          body_data: bodyData,
          legs_data: legsData,
          head_signature: testSignatures.head || null,
          body_signature: testSignatures.body || null,
          legs_signature: testSignatures.legs || null
        })
      });

      if (response.ok) {
        alert('✅ Cadavre exquis de test créé !');
        fetchDrawings();
        
        // Broadcast to show page
        if (socket) {
          const data = await response.json();
          socket.emit('new_drawing', {
            id: data.id,
            headData,
            bodyData,
            legsData,
            signatures: [
              testSignatures.head,
              testSignatures.body,
              testSignatures.legs
            ].filter(Boolean).join(' • ') || null
          });
        }
      }
    } catch (error) {
      console.error('Error creating test drawing:', error);
      alert('Erreur lors de la création');
    }
  };

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-light mb-8">🍰 Admin - Chantilly</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4">
            <p className="text-white/60 text-sm mb-1">Joueurs connectés</p>
            <p className="text-3xl font-light">{stats.connectedPlayers}</p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-white/60 text-sm mb-1">En attente</p>
            <p className="text-3xl font-light">{stats.waitingPlayers}</p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-white/60 text-sm mb-1">Équipes actives</p>
            <p className="text-3xl font-light">{stats.activeTeams}</p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-white/60 text-sm mb-1">Dessins créés</p>
            <p className="text-3xl font-light">{drawings.length}</p>
          </div>
        </div>

        {/* Settings */}
        <div className="glass-panel p-6 mb-8">
          <h2 className="text-2xl font-light mb-4">⚙️ Configuration d'affichage</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Animation</label>
              <select
                value={settings.animation}
                onChange={(e) => handleSettingsChange('animation', e.target.value)}
                className="glass-input"
              >
                <option value="static">Statique</option>
                <option value="wiggle">Wiggle</option>
                <option value="rotation">Rotation</option>
                <option value="breathing">Breathing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Colonnes</label>
              <select
                value={settings.columns}
                onChange={(e) => handleSettingsChange('columns', Number(e.target.value))}
                className="glass-input"
              >
                <option value={3}>3 colonnes</option>
                <option value={4}>4 colonnes</option>
                <option value={5}>5 colonnes</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.hideUI}
                onChange={(e) => handleSettingsChange('hideUI', e.target.checked)}
                className="mr-3"
              />
              <label className="text-white/80">Masquer UI sur /show</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showSignatures}
                onChange={(e) => handleSettingsChange('showSignatures', e.target.checked)}
                className="mr-3"
              />
              <label className="text-white/80">Afficher signatures</label>
            </div>
          </div>
        </div>

        {/* Test Mode */}
        <div className="glass-panel p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-light">🧪 Mode Test Solo</h2>
            <button
              onClick={() => setTestMode(!testMode)}
              className={`glass-button ${testMode ? 'bg-green-500/20' : ''}`}
            >
              {testMode ? '✓ Actif' : 'Activer'}
            </button>
          </div>

          {testMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTestPart('head')}
                  className={`glass-button ${testPart === 'head' ? 'bg-white/20' : ''}`}
                >
                  Tête
                </button>
                <button
                  onClick={() => setTestPart('body')}
                  className={`glass-button ${testPart === 'body' ? 'bg-white/20' : ''}`}
                >
                  Buste
                </button>
                <button
                  onClick={() => setTestPart('legs')}
                  className={`glass-button ${testPart === 'legs' ? 'bg-white/20' : ''}`}
                >
                  Jambes
                </button>
              </div>

              <input
                type="text"
                placeholder={`Signature ${testPart}`}
                value={testSignatures[testPart]}
                onChange={(e) => setTestSignatures({
                  ...testSignatures,
                  [testPart]: e.target.value
                })}
                className="glass-input mb-2"
              />

              <div className="h-96">
                <Canvas
                  ref={canvasRefs[testPart]}
                  role={testPart}
                  guide={true}
                />
              </div>

              <button
                onClick={handleTestSubmit}
                className="glass-button-primary w-full"
              >
                Créer le cadavre exquis de test
              </button>
            </motion.div>
          )}
        </div>

        {/* Session Actions */}
        <div className="glass-panel p-6 mb-8">
          <h2 className="text-2xl font-light mb-4">🎮 Session</h2>
          <div className="flex gap-4">
            <button
              onClick={handleResetSession}
              className="glass-button bg-red-500/20 hover:bg-red-500/30"
            >
              ⚠️ Reset Session
            </button>
            <button
              onClick={handleDownloadAll}
              className="glass-button bg-blue-500/20 hover:bg-blue-500/30"
            >
              📥 Télécharger tout
            </button>
          </div>
        </div>

        {/* Moderation */}
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-light mb-4">🗂️ Modération</h2>
          
          <div className="grid grid-cols-4 gap-4">
            {drawings.map((drawing) => {
              const signatures = [
                drawing.head_signature,
                drawing.body_signature,
                drawing.legs_signature
              ].filter(Boolean).join(' • ');

              return (
                <div key={drawing.id} className="glass-panel p-3 relative group">
                  <div className="space-y-1 mb-2">
                    <img src={drawing.head_data} alt="Head" className="w-full rounded" />
                    <img src={drawing.body_data} alt="Body" className="w-full rounded" />
                    <img src={drawing.legs_data} alt="Legs" className="w-full rounded" />
                  </div>
                  
                  {signatures && (
                    <p className="text-xs text-white/40 text-center mb-2">{signatures}</p>
                  )}

                  <button
                    onClick={() => handleDeleteDrawing(drawing.id)}
                    className="w-full glass-button bg-red-500/20 hover:bg-red-500/40 text-sm"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              );
            })}
          </div>

          {drawings.length === 0 && (
            <p className="text-white/40 text-center py-12">Aucun dessin pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
