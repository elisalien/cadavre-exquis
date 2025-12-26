# Cadavre Exquis Interactif 🎨

Application web temps réel pour créer des cadavres exquis collectifs en équipe de 3 joueurs.

## 📋 Vue d'ensemble

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Base de données**: Supabase (PostgreSQL)
- **Hébergement**: Railway (backend) + Netlify (frontend)

## 🚀 Installation Locale

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Compte Railway (backend)
- Compte Netlify (frontend)

### 1. Configuration Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Aller dans SQL Editor
3. Copier/coller le contenu de `database/schema.sql`
4. Exécuter le script
5. Noter les credentials :
   - `SUPABASE_URL` (Project Settings > API > Project URL)
   - `SUPABASE_ANON_KEY` (Project Settings > API > anon/public key)

### 2. Installation Backend

```bash
cd backend
npm install

# Créer .env (copier depuis .env.example)
cp .env.example .env

# Éditer .env avec vos credentials Supabase
nano .env
```

Fichier `.env` :
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-anon-key
```

Lancer le serveur :
```bash
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

### 3. Installation Frontend

```bash
cd frontend
npm install

# Créer .env (copier depuis .env.example)
cp .env.example .env

# Éditer .env
nano .env
```

Fichier `.env` :
```env
VITE_BACKEND_URL=http://localhost:3001
```

Lancer le frontend :
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 🌐 Déploiement

### Backend sur Railway

1. Se connecter à [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Sélectionner "Deploy from GitHub repo" ou "Empty Project"
4. Si empty project, ajouter les fichiers du dossier `backend/`
5. Configurer les variables d'environnement :
   ```
   PORT=3001 (Railway le définit automatiquement)
   FRONTEND_URL=https://votre-site.netlify.app
   SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_ANON_KEY=votre-anon-key
   ```
6. Deploy !
7. Noter l'URL du backend (ex: `https://votre-app.railway.app`)

### Frontend sur Netlify

1. Build du frontend :
```bash
cd frontend
npm run build
```

2. Se connecter à [netlify.com](https://netlify.com)
3. Glisser/déposer le dossier `dist/` dans Netlify
   OU
   Connecter le repo GitHub et configurer :
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Configurer les variables d'environnement :
   ```
   VITE_BACKEND_URL=https://votre-app.railway.app
   ```
5. Redéployer si nécessaire

### Configuration CORS

Une fois déployé, mettre à jour le backend `.env` sur Railway :
```env
FRONTEND_URL=https://votre-site.netlify.app
```

## 📱 Utilisation

### Pour les joueurs

1. Scanner le QR Code (généré avec l'URL Netlify)
2. Attendre d'être assigné à une équipe (auto-matching)
3. Dessiner la partie assignée (tête/buste/jambes)
4. Optionnel : signer avec un pseudo
5. Valider
6. Le résultat apparaît sur l'écran de projection !

### Pour la projection

Ouvrir `/show` sur l'écran de projection

### Pour l'admin

Ouvrir `/chantilly` pour :
- Voir les stats en temps réel
- Configurer l'affichage
- Modérer les dessins
- Tester en mode solo
- Reset la session

## 🧪 Mode Test Solo

Dans `/chantilly` :
1. Activer "Mode Test Solo"
2. Dessiner les 3 parties (tête, buste, jambes)
3. Signer chaque partie (optionnel)
4. Cliquer "Créer le cadavre exquis de test"
5. Le dessin apparaît sur `/show`

## 🎨 Personnalisation

### Couleurs

Modifier `frontend/src/index.css` :
```css
.bg-dark {
  background: #0a0a0a; /* Votre couleur */
}
```

### Animations

Modifier `frontend/src/pages/ShowPage.jsx` :
```javascript
const getAnimationClass = () => {
  // Ajouter vos animations
}
```

### Canvas

Modifier `frontend/src/components/Canvas.jsx` pour :
- Taille du pinceau
- Couleurs disponibles
- Guides de dessin

## 🐛 Debug

### Backend ne démarre pas
```bash
cd backend
npm install
node server.js
```

Vérifier :
- `.env` existe et contient les bonnes clés
- Port 3001 disponible
- Credentials Supabase valides

### Frontend ne se connecte pas
Vérifier :
- `VITE_BACKEND_URL` dans `.env`
- Backend est lancé
- Pas de blocage CORS (voir console navigateur)

### Les dessins ne s'affichent pas
Vérifier :
- Table `drawings` existe dans Supabase
- RLS (Row Level Security) configuré
- Logs du backend pour erreurs SQL

## 📊 Structure du Projet

```
cadavre-exquis/
├── backend/
│   ├── server.js          # Serveur Express + Socket.io
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PlayerPage.jsx    # Page joueur
│   │   │   ├── ShowPage.jsx      # Page projection
│   │   │   └── AdminPage.jsx     # Page admin
│   │   ├── components/
│   │   │   ├── Canvas.jsx        # Composant dessin
│   │   │   └── ConnectionStatus.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js      # Hook Socket.io
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
└── database/
    └── schema.sql         # Schema Supabase
```

## 🔧 Variables d'Environnement

### Backend (.env)
```env
PORT=3001
FRONTEND_URL=https://votre-site.netlify.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

### Frontend (.env)
```env
VITE_BACKEND_URL=https://votre-backend.railway.app
```

## 📝 API Endpoints

- `GET /api/stats` - Stats temps réel
- `GET /api/drawings` - Liste des dessins
- `DELETE /api/drawings/:id` - Supprimer un dessin
- `POST /api/reset-session` - Reset la session
- `POST /api/test-solo` - Créer équipe de test

## 🎯 WebSocket Events

### Client → Server
- `save_drawing` - Sauvegarde auto
- `validate_drawing` - Validation finale
- `ping` - Heartbeat

### Server → Client
- `team_assigned` - Équipe formée
- `team_progress` - Progression équipe
- `drawing_complete` - Dessin finalisé
- `new_drawing` - Nouveau dessin (broadcast)

## 🆘 Support

Pour toute question :
1. Vérifier les logs backend et console navigateur
2. Tester en local d'abord
3. Vérifier les credentials Supabase
4. Vérifier les URLs dans les .env

## 📄 License

Projet personnel - Libre d'utilisation

---

Créé avec ❤️ pour des expériences interactives
"# cadavre-exquis" 
