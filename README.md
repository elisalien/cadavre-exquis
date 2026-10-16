# Cadavre Exquis Interactif 🎨

> Application web temps réel pour créer des cadavres exquis collectifs, à dessiner sur téléphone par équipes de 3 joueurs et à projeter sur grand écran.

![Platform](https://img.shields.io/badge/platform-Web-informational) ![Stack](https://img.shields.io/badge/stack-React%20%2B%20Socket.io-blue) ![Database](https://img.shields.io/badge/db-Supabase-3ECF8E)

## À propos

Les joueurs scannent un QR code, sont automatiquement regroupés par 3 et dessinent chacun une partie du corps (la tête, le buste, les jambes) sans voir celles des autres. Une fois les trois parties validées, le cadavre exquis complet apparaît en direct sur l'écran de projection. Une page d'administration permet de régler l'affichage, de modérer les dessins et de tester seul. Le projet est pensé pour des événements et expériences interactives.

## Fonctionnalités

- **Matching automatique** des joueurs par équipes de 3, avec attribution d'un rôle : tête / buste / jambes
- **Canvas de dessin mobile** : pinceau, gomme, palette de couleurs
- **Sauvegarde automatique** des dessins en cours et validation finale, signature optionnelle avec un pseudo
- **Écran de projection** (`/show`) mis à jour en temps réel, avec animations (statique, wiggle, rotation, breathing) et 3 à 5 colonnes
- **Page admin** (`/chantilly`) : stats temps réel, réglages d'affichage (animation, colonnes, affichage des signatures), modération, reset de session
- **Mode test solo** : dessiner seul les 3 parties pour créer un cadavre exquis de test
- **Indicateur de connexion** temps réel côté joueur

## Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Un projet [Supabase](https://supabase.com) ; pour la mise en ligne, un compte [Railway](https://railway.app) (backend) et [Netlify](https://netlify.com) (frontend)

### 1. Base de données Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Dans SQL Editor, copier/coller puis exécuter le contenu de [`database/schema.sql`](database/schema.sql)
3. Noter les credentials :
   - `SUPABASE_URL` (Project Settings > API > Project URL)
   - `SUPABASE_ANON_KEY` (Project Settings > API > anon/public key)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # puis renseigner les credentials Supabase
npm run dev
```

`backend/.env` :

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-anon-key
```

Le backend est accessible sur `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`frontend/.env` :

```env
VITE_BACKEND_URL=http://localhost:3001
```

Le frontend est accessible sur `http://localhost:5173`.

### Raccourcis depuis la racine

```bash
npm install          # installe concurrently
npm run setup        # installe backend + frontend
npm run dev          # lance backend et frontend en parallèle
```

### Déploiement

**Backend sur Railway** (configuré par `backend/railway.json`)

1. Sur [railway.app](https://railway.app), créer un projet (« Deploy from GitHub repo » sur le dossier `backend/`, ou « Empty Project » en y ajoutant les fichiers de `backend/`)
2. Variables d'environnement : `FRONTEND_URL=https://votre-site.netlify.app`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (`PORT` est défini automatiquement par Railway)
3. Déployer et noter l'URL du backend (ex. `https://votre-app.railway.app`)

**Frontend sur Netlify** (configuré par `frontend/netlify.toml`)

1. Connecter le repo (build command `npm run build`, publish directory `dist`) ou glisser-déposer le dossier `dist/` après `npm run build`
2. Variable d'environnement : `VITE_BACKEND_URL=https://votre-app.railway.app`
3. Redéployer si nécessaire

**CORS** : une fois en ligne, mettre `FRONTEND_URL` du backend sur l'URL Netlify.

## Utilisation

| Route | Pour qui | Rôle |
| --- | --- | --- |
| `/` | Joueurs | Scanner le QR code (généré avec l'URL Netlify), attendre l'équipe, dessiner sa partie, signer (optionnel), valider |
| `/show` | Écran de projection | Affiche les cadavres exquis terminés en temps réel |
| `/chantilly` | Admin | Stats, réglages d'affichage, modération, mode test solo, reset de session |

### Mode test solo

Dans `/chantilly` : activer « Mode Test Solo », dessiner les 3 parties, les signer (optionnel), cliquer « Créer le cadavre exquis de test ». Le dessin apparaît sur `/show`.

### API REST

- `GET /api/stats` : stats temps réel
- `GET /api/drawings` : liste des dessins
- `POST /api/drawings` : enregistrer un dessin
- `DELETE /api/drawings/:id` : supprimer un dessin
- `POST /api/reset-session` : reset de la session
- `POST /api/test-solo` : créer une équipe de test

### Événements WebSocket

- Client → serveur : `save_drawing` (sauvegarde auto), `validate_drawing` (validation finale), `ping` (heartbeat)
- Serveur → client : `connection_status`, `team_assigned`, `team_progress`, `team_disrupted`, `drawing_complete`, `new_drawing`, `delete_drawing`, `session_reset`, `pong`

### Personnalisation

- Couleurs : `frontend/src/index.css`
- Animations de projection : `getAnimationClass()` dans `frontend/src/pages/ShowPage.jsx`
- Canvas (taille du pinceau, couleurs, guides de dessin) : `frontend/src/components/Canvas.jsx`

### Documentation complémentaire

- [START_HERE.md](START_HERE.md) : vue d'ensemble et prochaines étapes
- [QUICKSTART.md](QUICKSTART.md) : démarrage en 5 minutes
- [EVENT_GUIDE.md](EVENT_GUIDE.md) : préparer et installer le dispositif lors d'un événement
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) : guide de dépannage détaillé
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) : description détaillée des fichiers

### Dépannage rapide

- **Le backend ne démarre pas** : vérifier que `.env` existe avec les bonnes clés, que le port 3001 est libre et que les credentials Supabase sont valides (`cd backend && npm install && node server.js`)
- **Le frontend ne se connecte pas** : vérifier `VITE_BACKEND_URL`, que le backend tourne, et l'absence d'erreur CORS dans la console du navigateur
- **Les dessins ne s'affichent pas** : vérifier que la table `drawings` existe dans Supabase, la configuration RLS et les logs du backend

## Structure du projet

```
cadavre-exquis/
├── backend/
│   ├── server.js            # Serveur Express + Socket.io (matching, API, Supabase)
│   ├── railway.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/           # PlayerPage, ShowPage, AdminPage
│   │   ├── components/      # Canvas, ConnectionStatus
│   │   ├── hooks/useSocket.js
│   │   ├── main.jsx         # routes /, /show, /chantilly
│   │   └── index.css
│   ├── netlify.toml
│   └── .env.example
├── database/
│   └── schema.sql           # Schéma Supabase
└── package.json             # scripts racine (setup, dev…)
```

## Stack technique

- Backend : Node.js, Express, Socket.io, `@supabase/supabase-js`, dotenv
- Frontend : React 18, Vite, React Router, Tailwind CSS, Framer Motion, socket.io-client
- Base de données : Supabase (PostgreSQL)
- Hébergement : Railway (backend) + Netlify (frontend)

## Crédits & licence

Créé pour des expériences interactives.

Aucune licence n'est spécifiée — tous droits réservés. (L'ancien README indiquait : « Projet personnel - Libre d'utilisation » ; un fichier LICENSE permettrait de formaliser cette intention.)

---

<p align="center">
  Fait par <a href="https://github.com/elisalien">Élisalien</a> ·
  <a href="https://gitlab.com/elisalien/catalog">Catalogue des shaders, sources & logiciels</a>
</p>
