# L'EXODE

## PITCH

Dans un monde ravagé par la guerre de l'eau et la sécheresse, un petit groupe de survivants fuit sa terre natale à la recherche d'un refuge légendaire : une vallée verdoyante où l'eau et la nourriture abondent encore. Leur seul bien : une charrette, outil de leur survie.

L'Exode est un jeu solo dont le message est simple : **on va plus loin, plus longtemps, ensemble**. Mais rien n'empêche d'essayer seul — le jeu ne jugera pas, il montrera juste, à travers ses mécaniques, ce que ça coûte réellement.

## UNIVERS

### Contexte

Post-apocalyptique. Une grande catastrophe climatique et des guerres pour l'eau ont détruit la civilisation industrielle. Les survivants ont reconstruit un mode de vie proche du Moyen-Âge — sociétés rurales, artisanat, traction animale et humaine, savoirs technologiques perdus ou oubliés. Mais le monde est en grande partie dévasté.

### Ton

Mélancolique, âpre, mais porteur d'espoir. Le monde est dur, mais l'humanité qui reste sait encore ce que signifie s'entraider.

## STRUCTURE DU VOYAGE

Le groupe traverse plusieurs biomes distincts lors de son exode, chacun avec ses propres défis, en s'éloignant progressivement de la désolation pour se rapprocher de la vie :

- **Terre d'origine** (désertique, aride, point de départ — guerre et sécheresse en toile de fond)
- **Biomes intermédiaires possibles** (ordre à définir : aléatoire ?)
  - Désert de sable : chaud
  - Désert de glace : froid
  - Plaine ravagée
  - Village abandonné
- **La Vallée** (biome final : verdoyant, eau et nourriture abondantes — la terre promise)

## LE GROUPE

Jusqu'à 5 personnages, chacun avec ses propres caractéristiques :

- Vitesse de marche
- Résistance à la fatigue (vitesse à laquelle il perd de l'énergie)
- Possibilité future : compétences spéciales, traits de personnalité, histoire personnelle

### Système d'énergie

Chaque personnage a une énergie maximale fixe de **100 points**. Ce qui varie d'un personnage à l'autre, c'est la vitesse à laquelle cette énergie diminue (résistance à la fatigue), pas le maximum lui-même.

### Mort

- **En groupe** : si l'énergie d'un personnage tombe à zéro, il meurt. Le convoi s'arrête pour lui rendre hommage avant de reprendre l'exode, diminué.
- **En solo** (un seul personnage) : la mort du personnage est un game over.

## MÉCANIQUE CENTRALE : LA CHARRETTE

La charrette est le cœur du gameplay. Elle transporte les ressources (eau, nourriture) et peut transporter les personnages fatigués. Elle est à la fois leur salut et leur fardeau.

### Règles de traction

- Tirer la charrette fatigue les personnages, mais la charge est répartie entre tous ceux qui tirent : plus on est nombreux, moins chacun se fatigue.
- La vitesse du convoi = vitesse du personnage le plus lent parmi ceux qui tirent.
- Un personnage peut être assigné à trois états :
  - **Tirer la charrette** : fatigue partagée, mais bride la vitesse au rythme du plus lent
  - **Se reposer sur la charrette** : récupère de l'énergie (si nourriture/eau disponible), mais alourdit la charge des autres tireurs
  - **Marcher librement** : récupère de l'énergie beaucoup plus lentement qu'en se reposant sur la charrette, ne pèse pas sur les tireurs, mais ne peut pas remonter à 100% d'énergie par ce biais

### Ressources : eau et nourriture

- Trouvées en explorant le chemin, stockées sur la charrette
- Un personnage ne consomme de l'eau ou de la nourriture que lorsque le joueur choisit de lui en donner
- L'eau et la nourriture font toutes deux remonter l'énergie
- En milieu aride, l'eau restaure plus d'énergie que la nourriture
- Les ressources sont limitées et partagées

### Le mécanisme de collecte

1. Pendant que le convoi avance, un personnage — choisi au hasard parmi le groupe — signale une ressource via une bulle de dialogue
2. Le joueur sait uniquement le type de ressource signalée (eau / nourriture / autre)
3. Le joueur choisit qui envoyer (ou de n'envoyer personne)
4. Le convoi s'arrête complètement pendant la collecte
5. Le personnage envoyé dépense un coût d'énergie aléatoire et caché, entre 0 et 50 points
6. Si l'énergie actuelle est inférieure au coût tiré, le personnage meurt

### Biomes et effets sur les ressources

- Certains biomes favorisent la découverte d'eau, d'autres celle de nourriture
- **Biomes chauds** :
  - La nourriture y restaure moins bien l'énergie que l'eau
  - Pénalité de fatigue passive propre au biome
- **Biomes froids** :
  - L'eau est inutilisable car gelée
  - Pénalité de fatigue passive propre au biome

## LE DILEMME CENTRAL

À chaque instant, le joueur doit arbitrer :

- Qui tire, qui se repose, qui marche à côté ?
- Faut-il ralentir pour préserver un personnage fragile, ou avancer plus vite au risque de l'épuiser ?

Github Page : https://jbbergy.github.io/exodus-game/
