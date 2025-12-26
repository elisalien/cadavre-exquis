# 🚀 Guide de Démarrage Rapide

## Installation en 5 minutes

### 1. Configuration Supabase (2 min)

1. Va sur https://supabase.com et crée un projet
2. Dans SQL Editor, copie/colle le fichier `database/schema.sql`
3. Note tes credentials :
   - URL du projet
   - Clé anon/public

### 2. Backend (1 min)

```bash
cd backend
npm install
cp .env.example .env
# Édite .env avec tes credentials Supabase
npm run dev
```

### 3. Frontend (1 min)

```bash
cd frontend
npm install
cp .env.example .env
# Édite .env avec VITE_BACKEND_URL=http://localhost:3001
npm run dev
```

### 4. Test (1 min)

1. Ouvre http://localhost:5173 sur plusieurs onglets/téléphones
2. Les joueurs seront automatiquement groupés par 3
3. Ouvre http://localhost:5173/show pour voir les résultats
4. Ouvre http://localhost:5173/chantilly pour l'admin

## Déploiement Production

### Railway (Backend)

```bash
# Sur Railway.app
1. New Project
2. Deploy from GitHub (dossier backend/)
3. Variables d'environnement :
   - SUPABASE_URL=...
   - SUPABASE_ANON_KEY=...
   - FRONTEND_URL=https://ton-site.netlify.app
```

### Netlify (Frontend)

```bash
cd frontend
npm run build

# Sur Netlify
1. Glisse/dépose le dossier dist/
2. Variable d'environnement :
   - VITE_BACKEND_URL=https://ton-backend.railway.app
```

## Générer le QR Code

Utilise https://qr-code-generator.com avec ton URL Netlify

## Problèmes courants

**Backend ne démarre pas**
→ Vérifie que le .env existe et contient les bonnes clés

**Frontend ne se connecte pas**
→ Vérifie VITE_BACKEND_URL dans frontend/.env

**CORS errors**
→ Mets à jour FRONTEND_URL dans backend/.env

**Les dessins ne s'enregistrent pas**
→ Vérifie que le schema.sql a bien été exécuté dans Supabase

## Mode Test Solo

1. Va sur /chantilly
2. Active "Mode Test Solo"
3. Dessine les 3 parties
4. Valide
5. Résultat visible sur /show

C'est tout ! 🎉
