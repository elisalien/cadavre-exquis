# 📁 Structure du Projet

## Vue d'ensemble

```
cadavre-exquis/
├── backend/                    # Serveur Node.js
├── frontend/                   # Application React
├── database/                   # Scripts SQL
└── docs/                       # Documentation
```

## Backend (`/backend`)

### Fichiers principaux

- **`server.js`** (350 lignes)
  - Serveur Express + Socket.io
  - Logique de matching des équipes
  - Gestion WebSocket temps réel
  - Endpoints API REST
  - Intégration Supabase

- **`package.json`**
  - Dépendances Node.js
  - Scripts npm

- **`.env.example`**
  - Template variables d'environnement
  - À copier en `.env`

- **`railway.json`**
  - Configuration Railway
  - Build + deploy settings

### Dépendances

```json
{
  "express": "Serveur HTTP",
  "socket.io": "WebSocket temps réel",
  "cors": "Cross-Origin Resource Sharing",
  "@supabase/supabase-js": "Client Supabase",
  "dotenv": "Variables d'environnement"
}
```

## Frontend (`/frontend`)

### Structure

```
frontend/
├── src/
│   ├── pages/              # Pages React
│   ├── components/         # Composants réutilisables
│   ├── hooks/              # Custom React hooks
│   ├── main.jsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── public/                 # Fichiers statiques
├── index.html              # HTML de base
└── Configuration files
```

### Pages (`/src/pages`)

- **`PlayerPage.jsx`** (150 lignes)
  - Interface joueur mobile
  - États : waiting, drawing, validated, complete
  - Canvas de dessin
  - Input signature
  - Notifications temps réel

- **`ShowPage.jsx`** (120 lignes)
  - Écran de projection
  - Grille responsive de dessins
  - Animations configurables
  - Mise à jour temps réel

- **`AdminPage.jsx`** (200 lignes)
  - Dashboard admin
  - Stats temps réel
  - Configuration affichage
  - Modération dessins
  - Mode test solo
  - Reset session

### Composants (`/src/components`)

- **`Canvas.jsx`** (200 lignes)
  - Canvas HTML5 drawing
  - Outils : pinceau, gomme
  - Palette couleurs
  - Undo/Redo
  - Guides visuels
  - Auto-save

- **`ConnectionStatus.jsx`** (30 lignes)
  - Indicateur connexion
  - 3 états : good, fair, poor
  - Heartbeat monitoring

### Hooks (`/src/hooks`)

- **`useSocket.js`** (60 lignes)
  - Connexion Socket.io
  - Auto-reconnexion
  - Heartbeat ping/pong
  - État connexion

### Styles

- **`index.css`** (100 lignes)
  - Tailwind base
  - Glasscore styles
  - Animations CSS
  - Utilitaires

### Configuration

- **`vite.config.js`** - Configuration Vite
- **`tailwind.config.js`** - Configuration Tailwind
- **`postcss.config.js`** - Configuration PostCSS
- **`netlify.toml`** - Configuration Netlify
- **`.env.example`** - Template variables

## Database (`/database`)

- **`schema.sql`**
  - Table `drawings`
  - Index optimisations
  - Row Level Security
  - Policies

### Structure Table

```sql
drawings (
  id UUID PRIMARY KEY,
  team_id TEXT,
  head_data TEXT,
  body_data TEXT,
  legs_data TEXT,
  head_signature TEXT,
  body_signature TEXT,
  legs_signature TEXT,
  created_at TIMESTAMP
)
```

## Documentation

- **`README.md`** - Documentation complète
- **`QUICKSTART.md`** - Démarrage rapide
- **`EVENT_GUIDE.md`** - Guide événements
- **`TROUBLESHOOTING.md`** - Dépannage

## Fichiers Racine

- **`package.json`** - Scripts globaux
- **`.gitignore`** - Fichiers ignorés Git
- **`QUICKSTART.md`** - Guide démarrage
- **`EVENT_GUIDE.md`** - Guide événements
- **`TROUBLESHOOTING.md`** - Dépannage

## Flow de Données

### 1. Joueur se connecte

```
Player Device → Socket.io → Backend
              ← team_assigned ←
```

### 2. Joueur dessine

```
Canvas → Auto-save (3s) → Socket.io → Backend
                                    → Supabase
```

### 3. Joueur valide

```
Canvas → validate_drawing → Backend → Supabase
                                   → Show Screen (broadcast)
```

### 4. Affichage temps réel

```
Backend → new_drawing → Show Screen
                     → Update display
```

## API Endpoints

### REST

```
GET    /api/stats              # Stats temps réel
GET    /api/drawings           # Liste dessins
POST   /api/drawings           # Créer dessin (test)
DELETE /api/drawings/:id       # Supprimer dessin
POST   /api/reset-session      # Reset session
```

### WebSocket Events

#### Client → Server

```javascript
'save_drawing'      // Auto-save
'validate_drawing'  // Validation finale
'ping'              // Heartbeat
```

#### Server → Client

```javascript
'team_assigned'     // Équipe formée
'team_progress'     // Progression
'drawing_complete'  // Dessin fini
'new_drawing'       // Broadcast nouveau
'delete_drawing'    // Broadcast suppression
'update_settings'   // Maj config
'session_reset'     // Reset
```

## Technologies

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.io Client** - WebSocket
- **React Router** - Navigation

### Backend

- **Node.js** - Runtime
- **Express** - HTTP server
- **Socket.io** - WebSocket
- **Supabase** - Database

### Infrastructure

- **Railway** - Backend hosting
- **Netlify** - Frontend hosting
- **Supabase** - Database + Storage

## Flux de Développement

### 1. Local Development

```bash
# Terminal 1 : Backend
cd backend && npm run dev

# Terminal 2 : Frontend  
cd frontend && npm run dev
```

### 2. Testing

- Tester sur plusieurs onglets/devices
- Vérifier matching automatique
- Tester canvas sur mobile
- Vérifier /show mise à jour

### 3. Deployment

```bash
# Frontend
cd frontend
npm run build
# Deploy dist/ sur Netlify

# Backend
# Push sur Railway
# Configure variables d'environnement
```

## Maintenance

### Régulière

- Surveiller logs Railway
- Vérifier quota Supabase
- Nettoyer vieux dessins si nécessaire
- Backup base de données

### Updates

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend  
npm update
```

## Fichiers à Personnaliser

### Design

- `frontend/src/index.css` - Couleurs, styles
- `frontend/tailwind.config.js` - Thème Tailwind

### Logique

- `backend/server.js` - Logique serveur
- `frontend/src/components/Canvas.jsx` - Outils dessin

### Config

- `backend/.env` - Variables backend
- `frontend/.env` - Variables frontend
- `database/schema.sql` - Structure DB

## Checklist Nouvelle Feature

- [ ] Backend : ajouter logique dans `server.js`
- [ ] Frontend : créer composant/page
- [ ] Test en local
- [ ] Update documentation
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test en production

## Métriques

### Performance

- Temps matching : < 1 seconde
- Temps sauvegarde : < 500ms
- Latency WebSocket : < 100ms
- Chargement page : < 2 secondes

### Capacité

- 100+ joueurs simultanés
- 30+ équipes actives
- 1000+ dessins stockés

## Ressources

### Documentation

- Socket.io : https://socket.io/docs/
- React : https://react.dev
- Supabase : https://supabase.com/docs
- Tailwind : https://tailwindcss.com

### Outils

- Railway : https://railway.app
- Netlify : https://netlify.com
- Vite : https://vitejs.dev

---

Tout est prêt pour être déployé ! 🚀
