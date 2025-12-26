const ConnectionStatus = ({ quality, isConnected }) => {
  const getColor = () => {
    if (!isConnected) return 'bg-red-500';
    switch (quality) {
      case 'good': return 'bg-green-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getLabel = () => {
    if (!isConnected) return 'Déconnecté';
    switch (quality) {
      case 'good': return 'Connecté';
      case 'fair': return 'Connexion moyenne';
      case 'poor': return 'Connexion faible';
      default: return 'Connexion...';
    }
  };

  return (
    <div className="fixed top-4 right-4 glass-panel px-4 py-2 flex items-center gap-2 z-50">
      <div className={`w-2 h-2 rounded-full ${getColor()} animation-pulse-soft`} />
      <span className="text-xs text-white/70">{getLabel()}</span>
    </div>
  );
};

export default ConnectionStatus;
