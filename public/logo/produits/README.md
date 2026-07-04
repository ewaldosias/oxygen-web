# OxyGen — Kit logos par produit

Système : l'atome cœur-or et « OxyGen » restent **corporate** (navy + or). Chaque produit ajoute sa **couleur d'accent** (nom du produit + fond de l'icône d'app).

## Couleurs d'accent

| Produit | Accent (clair) | Accent (sombre) | Fond icône |
| --- | --- | --- | --- |
| Care | `#0E8A5F` | `#15B57E` | `#12A074` → `#0A5E43` |
| Edu | `#2456C9` | `#5E8DF5` | `#3470EE` → `#1B3F9E` |
| Clinic Academy | `#5B3CC9` | `#9277F0` | `#7350EA` → `#3F2A9E` |
| Shift | `#CC4E22` | `#F2855A` | `#ED6A3A` → `#B23E1C` |

## Les formats de logo — quand les utiliser

- **principal** ⭐ : atome-O « ⊛xyGen » + nom du produit **dessous** (60 %, aligné sous l'atome). C'est le **logo produit principal** — usage par défaut.
- **horizontal** : bandeaux larges, barre de navigation. (Long si le nom est long.)
- **twoline** (deux lignes) : en-tête de lettre alternatif, signatures, cartes.
- **stacked** (empilé) : carré, splash d'app, avatar réseaux sociaux.

Dans `principal` et `horizontal`, l'atome **est** le O de OxyGen. Dans `twoline` et `stacked`, l'atome est un **symbole autonome** à côté de « OxyGen » (O normal).

## Fichiers par produit (`care/`, `edu/`, `academy/`, `shift/`)

```
svg/
  {prod}-appicon-named.svg     icône d'app + nom gravé
  {prod}-appicon.svg           icône d'app sans texte
  {prod}-logo-horizontal-light.svg / -dark.svg
  {prod}-logo-twoline-light.svg    / -dark.svg
  {prod}-logo-stacked-light.svg    / -dark.svg
png/
  {prod}-appicon[-named]-1024/512/192/180/120.png
  {prod}-logo-{format}-{light|dark}-256h/128h.png
```

- **App / PWA icon** → `-appicon-named-192.png` & `-512.png` (ou sans nom si tu préfères)
- **Apple touch icon** → `-appicon-named-180.png`
- **En-tête de lettre** → `-logo-twoline-light.svg`
- Versions **dark** = pour fonds sombres (structure + « xy »/« Oxy » en blanc, or et accent éclairci). Fond transparent.

Identité corporate (atome seul, logotype OxyGen, favicon) : voir le dossier parent `logo/`.
