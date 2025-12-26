# 🎪 Guide d'Installation pour Événements

## Préparation (1 jour avant)

### 1. Vérifications techniques

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Base de données Supabase opérationnelle
- [ ] Test complet du flow (3 joueurs → dessin → affichage)
- [ ] QR code généré et imprimé

### 2. Matériel nécessaire

- **Écran de projection** (1920x1080 minimum)
- **Ordinateur** connecté à l'écran (pour /show)
- **WiFi stable** (crucial !)
- **QR codes imprimés** (plusieurs exemplaires)
- **Panneaux indicateurs** ("Scanne pour participer")
- **Backup** : hotspot mobile au cas où

### 3. Configuration avant événement

```bash
# Sur /chantilly, configure :
- Animation : selon l'ambiance (wiggle pour festif, statique pour exposition)
- Colonnes : 3 (petits écrans) à 5 (grands écrans)
- Signatures : ON (pour engagement communautaire)
```

## Installation sur site (30 min)

### Étape 1 : Écran de projection (5 min)

1. Connecter l'ordinateur à l'écran
2. Ouvrir navigateur en plein écran (F11)
3. Aller sur `/show`
4. Tester la réactivité (créer un test sur /chantilly)

### Étape 2 : QR Codes (5 min)

1. Placer les QR codes bien visibles
2. Vérifier qu'ils scannent correctement
3. Tester sur plusieurs téléphones

### Étape 3 : Tests finaux (10 min)

1. 3 personnes scannent le QR code
2. Vérifient qu'ils sont bien assignés
3. Dessinent rapidement
4. Valident
5. Résultat apparaît sur l'écran ✅

### Étape 4 : Admin en coulisses (5 min)

1. Ouvrir `/chantilly` sur un laptop/tablette
2. Garder un œil sur les stats
3. Prêt à modérer si besoin

## Pendant l'événement

### Monitoring

Surveiller sur `/chantilly` :
- Nombre de joueurs connectés
- Équipes actives
- Problèmes de connexion

### Modération

Si contenu inapproprié :
1. Aller sur /chantilly
2. Section Modération
3. Hover sur le dessin
4. Cliquer "Supprimer"

### Troubleshooting rapide

**Problème** : Joueurs ne se connectent pas
- Vérifier WiFi
- Tester QR code
- Redémarrer backend si nécessaire

**Problème** : Dessins n'apparaissent pas
- F5 sur /show
- Vérifier console navigateur
- Tester mode test solo

**Problème** : Trop de monde
- Les joueurs attendent automatiquement
- 3 par 3, c'est géré !

## Fin d'événement

### Export des créations

1. Sur /chantilly, cliquer "Télécharger tout"
2. Récupérer le ZIP avec tous les dessins
3. Partager sur réseaux sociaux si autorisation

### Cleanup

Option 1 : Garder les dessins (archive)
Option 2 : Reset session pour prochain événement

## Astuces Pro

### Pour maximiser l'engagement

- **Annoncer régulièrement** : "Scannez le QR code pour participer !"
- **Montrer l'écran** : Les gens voient les résultats en direct
- **Créer du suspense** : "Voyons ce que vous avez créé ensemble !"

### Pour gérer la foule

- **Files d'attente virtuelles** : Le système gère automatiquement
- **Encourager les groupes** : "Venez à 3 pour jouer ensemble"
- **Rotation rapide** : 2-3 minutes par personne max

### Pour un rendu optimal

- **Éclairage** : Écran bien visible mais pas trop de lumière directe
- **Son** : Musique d'ambiance + annonces micro
- **Espace** : Zone claire pour que les gens dessinent confortablement

## Checklist rapide avant de commencer

✅ Écran allumé sur /show
✅ QR codes visibles
✅ WiFi stable
✅ Admin ouvert sur /chantilly
✅ Test complet effectué
✅ Batterie laptop chargée
✅ Hotspot backup prêt

## Scénarios d'urgence

### WiFi tombe

1. Activer hotspot mobile
2. Mettre à jour QR code si nécessaire
3. Annoncer brève interruption

### Backend crash

1. Redémarrer sur Railway
2. Pendant ce temps : mode test solo pour démo
3. 2-3 minutes de downtime max

### Trop de contenu inapproprié

1. Pause temporaire
2. Annoncer les règles
3. Modération active
4. Reset si nécessaire

## Après l'événement

- [ ] Télécharger toutes les créations
- [ ] Partager sur réseaux (avec permissions)
- [ ] Analyser les stats (combien de participants ?)
- [ ] Noter les feedbacks
- [ ] Planifier améliorations

---

Bon événement ! 🎉
