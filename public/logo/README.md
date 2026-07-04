# OxyGen — Kit logo

Logo : **modèle de Bohr de l'oxygène** (noyau + 2 électrons internes + 6 externes). Logotype : **l'atome est le « O » d'OxyGen**. Géométrie « V1 stable », traitement « cœur serti » (structure navy, noyau or), police **Manrope**.

## Règle clair / sombre

| Élément | Fond clair | Fond sombre |
| --- | --- | --- |
| Orbites + électrons (structure) | navy | blanc |
| Noyau (le cœur) | **or** | **or** |
| Texte « xy » | navy | blanc |
| Texte « Gen » | **or** | **or** |

L'or ne change jamais — c'est le fil conducteur.

## Couleurs

| Rôle | Hex |
| --- | --- |
| Navy structure | `#1B2A4A` |
| Navy texte / encre | `#16213A` |
| Navy dégradé (clair) | `#3C5A8C` → `#1B2A4A` |
| Or accent / « Gen » | `#D4A843` |
| Or noyau (dégradé) | `#FCEFC6` → `#E6BC58` → `#B6852A` |
| Structure blanche (sombre) | `#FFFFFF` → `#C3D0E6` |
| Fond sombre (squircle) | `#21345C` → `#0E1730` |

## Police

**Manrope** — ExtraBold (800) pour le logotype ; 600/700 pour l'interface. Google Fonts : https://fonts.google.com/specimen/Manrope

## Fichiers

```
svg/
  oxygen-logotype-light.svg   logotype complet, fond clair
  oxygen-logotype-dark.svg    logotype complet, fond sombre
  oxygen-mark-light.svg       atome seul, fond clair
  oxygen-mark-dark.svg        atome seul, fond sombre
  oxygen-appicon.svg          icône d'app (squircle navy) — PWA / écran d'accueil
  oxygen-favicon.svg          favicon (atome seul) — onglet navigateur
png/
  logotype/   64h · 128h · 256h  (light + dark, fond transparent)
  mark/       64 · 128 · 256 · 512  (light + dark, fond transparent)
  appicon/    120 · 180 · 192 · 512 · 1024  (Apple touch 180, PWA 192/512)
  favicon/    16 · 32 · 48
```

## Usage rapide (web)

- Onglet navigateur → `png/favicon/oxygen-favicon-32.png` (ou `svg/oxygen-favicon.svg`)
- Icône PWA → `png/appicon/oxygen-appicon-192.png` et `-512.png`
- Apple touch icon → `png/appicon/oxygen-appicon-180.png`
- En-tête de site (fond clair) → `svg/oxygen-logotype-light.svg`
- Le texte du logotype est déjà vectorisé (tracés) — aucune dépendance à la police pour l'afficher.

*Note : les fichiers `OxyGen_mark_V1_*` / `OxyGen_appicon_V*` à la racine sont d'anciens brouillons (avant le choix « cœur serti »). Tu peux les supprimer — tout le kit final est dans `svg/` et `png/`.*
