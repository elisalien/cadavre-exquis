# 🔧 Guide de Dépannage

## Problèmes Courants

### 1. Backend ne démarre pas

**Symptôme** : `npm run dev` échoue

**Solutions** :

```bash
# Vérifier Node.js version
node --version  # Doit être 18+

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Vérifier le fichier .env
cat .env  # Doit contenir SUPABASE_URL et SUPABASE_ANON_KEY

# Tester la connexion Supabase
node -e "console.log(process.env.SUPABASE_URL)"
```

**Erreur** : `Error: Cannot find module 'socket.io'`
→ `npm install`

**Erreur** : `EADDRINUSE: address already in use`
→ Port 3001 occupé, tuer le processus :
```bash
lsof -i :3001
kill -9 [PID]
```

### 2. Frontend ne se connecte pas au backend

**Symptôme** : Page joueur reste sur "Recherche d'équipe..." indéfiniment

**Solutions** :

```bash
# Vérifier VITE_BACKEND_URL
cat frontend/.env

# Tester le backend directement
curl http://localhost:3001/api/stats

# Console navigateur (F12)
# Regarder les erreurs WebSocket
```

**Erreur Console** : `WebSocket connection failed`
→ Backend pas lancé ou mauvaise URL

**Erreur Console** : `CORS policy blocked`
→ Vérifier `FRONTEND_URL` dans backend/.env

### 3. Les dessins ne s'enregistrent pas

**Symptôme** : Dessin validé mais n'apparaît pas sur /show

**Solutions** :

```bash
# Vérifier Supabase
# Dans Supabase SQL Editor :
SELECT * FROM drawings ORDER BY created_at DESC LIMIT 5;

# Si vide, vérifier les logs backend
# Regarder les erreurs Supabase
```

**Erreur Backend** : `relation "drawings" does not exist`
→ Exécuter `database/schema.sql` dans Supabase SQL Editor

**Erreur Backend** : `permission denied for table drawings`
→ Vérifier RLS (Row Level Security) dans Supabase

### 4. Problèmes de déploiement Railway

**Symptôme** : Deploy échoue

**Solutions** :

```bash
# Vérifier les logs Railway
# Dans Railway dashboard > Deployments > View Logs

# Variables d'environnement manquantes
# Ajouter dans Railway Settings > Variables :
- PORT (auto)
- SUPABASE_URL
- SUPABASE_ANON_KEY
- FRONTEND_URL
```

**Erreur** : `Module not found`
→ Vérifier `package.json` contient toutes les dépendances

**Erreur** : `Cannot connect to Supabase`
→ Vérifier credentials Supabase

### 5. Problèmes de déploiement Netlify

**Symptôme** : Build échoue ou site inaccessible

**Solutions** :

```bash
# Build local
cd frontend
npm run build
# Si échoue ici, corriger avant de deploy

# Vérifier netlify.toml
cat netlify.toml

# Variables d'environnement
# Dans Netlify > Site settings > Environment variables
VITE_BACKEND_URL=https://ton-backend.railway.app
```

**Erreur** : `404 Not Found` sur routes
→ Ajouter redirects dans `netlify.toml` (déjà fait)

### 6. Canvas ne dessine pas

**Symptôme** : Cliquer sur le canvas ne fait rien

**Solutions** :

- Vérifier console navigateur (F12)
- Tester sur navigateur différent
- Vérifier que touch events fonctionnent sur mobile

**Fix mobile** : Ajouter dans Canvas.jsx si nécessaire :
```javascript
e.preventDefault(); // Empêcher scroll pendant dessin
```

### 7. Mode Test Solo ne fonctionne pas

**Symptôme** : Bouton "Créer" ne fait rien

**Solutions** :

- Vérifier console navigateur
- Dessiner les 3 parties (tête, buste, jambes)
- Vérifier endpoint `/api/drawings` existe (backend)

### 8. WebSocket déconnexions fréquentes

**Symptôme** : Status rouge, reconnexions constantes

**Solutions** :

```javascript
// Dans backend/server.js, augmenter timeout :
io.on('connection', (socket) => {
  socket.timeout = 30000; // 30 secondes
});

// Vérifier réseau :
ping ton-backend.railway.app
```

### 9. Performances lentes

**Symptôme** : Lag, dessins lents à apparaître

**Solutions** :

- Réduire qualité images : `canvas.toDataURL('image/png', 0.5)`
- Augmenter intervalle auto-save : 5 secondes au lieu de 3
- Limiter nombre de dessins affichés sur /show

```javascript
// Dans ShowPage.jsx
const recentDrawings = drawings.slice(0, 12); // Afficher seulement 12 derniers
```

### 10. Supabase quota dépassé

**Symptôme** : Erreur "quota exceeded"

**Solutions** :

- Passer au plan Supabase Pro
- Nettoyer anciennes données :
```sql
DELETE FROM drawings WHERE created_at < NOW() - INTERVAL '30 days';
```

## Logs Utiles

### Backend

```javascript
// Ajouter debug dans server.js
console.log('Player connected:', socket.id);
console.log('Team formed:', teamId);
console.log('Drawing saved:', drawingData.id);
```

### Frontend

```javascript
// Ajouter debug dans PlayerPage.jsx
console.log('Socket connected:', socket.connected);
console.log('Team assigned:', data);
console.log('Canvas data:', canvasData.length);
```

### Supabase

```sql
-- Voir dernières activités
SELECT * FROM drawings ORDER BY created_at DESC LIMIT 10;

-- Compter dessins
SELECT COUNT(*) FROM drawings;

-- Dessins par jour
SELECT DATE(created_at) as day, COUNT(*) as count 
FROM drawings 
GROUP BY DATE(created_at) 
ORDER BY day DESC;
```

## Tests de Diagnostic

### Test 1 : Backend fonctionne ?

```bash
curl http://localhost:3001/api/stats
# Doit retourner JSON avec stats
```

### Test 2 : Supabase accessible ?

```bash
# Dans Supabase SQL Editor
SELECT NOW();
# Doit retourner l'heure actuelle
```

### Test 3 : WebSocket fonctionne ?

Ouvrir console navigateur :
```javascript
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected!'));
```

### Test 4 : Frontend build OK ?

```bash
cd frontend
npm run build
# Doit créer dist/ sans erreurs
```

## Commandes de Reset

### Reset complet local

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend  
cd frontend
rm -rf node_modules package-lock.json dist
npm install

# Supabase
# Exécuter dans SQL Editor :
DELETE FROM drawings;
```

### Reset production

```bash
# Railway : Redeploy
# Netlify : Clear cache and redeploy
# Supabase : Garder les données sauf si problème
```

## Contact Support

Si problème persiste :

1. Vérifier tous les logs (backend, frontend, Supabase)
2. Tester en local d'abord
3. Vérifier variables d'environnement
4. Tester avec navigateur différent
5. Consulter documentation officielle :
   - Socket.io : https://socket.io/docs/
   - Supabase : https://supabase.com/docs
   - Railway : https://docs.railway.app
   - Netlify : https://docs.netlify.com

## Checklist Debug Rapide

- [ ] Backend lancé et accessible ?
- [ ] Frontend lancé et accessible ?
- [ ] .env corrects (backend ET frontend) ?
- [ ] Supabase table créée ?
- [ ] Console navigateur sans erreurs ?
- [ ] WebSocket connecté (vert) ?
- [ ] Testé sur navigateur différent ?
- [ ] Testé sur réseau différent ?

---

99% des problèmes viennent de :
1. Variables d'environnement manquantes (40%)
2. Backend pas lancé (30%)
3. Schema Supabase pas exécuté (20%)
4. CORS / URLs incorrectes (10%)
