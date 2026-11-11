# Côté technique : Mine éteinte

Ici, tu trouves en bref comment le code est organisé et comment le construire. Le mot de bienvenue et les premières
idées pour changer le jeu sont dans `README.md`.

## Organisation

C'est un projet pour MakeCode Arcade, écrit en TypeScript. `pxt.json` donne le nom du projet `mine-eteinte`, la
palette de 16 couleurs et la liste de tous les fichiers, dans l'ordre où MakeCode les lit. `mkc.json` dit pour quel
appareil on construit : le Calliope mini 3 avec le GameKit (variante « n3 »).

Les fichiers du jeu :

- `regles.ts` : les règles de la nuit de travail : salles, personnage, Brummi, lampe, sifflet, menus et entraînement.
- `dessins.ts` : tous les dessins sont du pixel art en 160 x 120 pixels.
- `cinema.ts` : L'intro, mise en scène comme un petit film, sur une seule ligne de temps qui laisse le temps de lire.
- `son.ts` : une musique amicale et une ambiance douce de mine ; chaque voix finit par s'éteindre.
- `main.ts` : adaptateur du matériel : il lit les touches et donne au jeu le temps écoulé.

Le jeu est découpé en trois espaces de noms : `Nuit` (les règles et le dessin, répartis entre `regles.ts` et
`dessins.ts`), `NuitSon` (musique et bruitages) et `Cinema` (l'intro).

## Comment le jeu se déroule

1. `main.ts` prépare le son (`NuitSon.preparer`) et branche la touche menu sur `Nuit.basculerPause`.
2. Le jeu commence dans l'état `Etat.Intro` : l'intro avec la carte du studio du Calliope Hacker. Un premier appui sur A
   ou B saute à la carte du studio ; ce n'est qu'au deuxième appui, au plus tôt 1,5 s plus tard, que le menu du
   titre s'ouvre.
3. Viennent ensuite le menu du titre (`Etat.Titre`), la proposition d'entraînement (`Etat.ChoixEntrainement`) et
   l'entraînement en 13 étapes (`Etat.Entrainement`).
4. Dans tous les états, `main.ts` appelle `Nuit.actualiser` à chaque tour avec le temps écoulé et les touches pressées.
   Dans l'état `Etat.Jeu`, les règles tournent là : déplacer le personnage, la lampe, le sifflet, Brummi
   (`actualiserBrummi`), les fusibles.
5. `Nuit.dessiner` redessine chaque image : la salle, l'obscurité avec le faisceau de lumière, Brummi, le tableau et,
   selon l'état, le titre, l'entraînement, la pause ou le bilan.
6. `NuitSon.actualiser` joue les sons que les règles ont demandés avec `demanderSon`.

La mine a 12 salles de 20 × 15 carreaux, chaque carreau fait 8 × 8 pixels. Chaque carreau est un nombre : 0 sol, 1 mur,
2 métal et 3 eau. Les salles sont placées par `SALLE_X` et `SALLE_Y`, leurs noms sont dans `NOMS_SALLES`.

## Construire le jeu

- **Dans le navigateur :** ouvre arcade.makecode.com, choisis « Importer » et ouvre le fichier du jeu
  `mine-eteinte.hex`. Tout le code est dans le fichier du jeu. Le simulateur montre le jeu tout de suite.
- **Sur l'ordinateur :** avec l'outil en ligne de commande de MakeCode (paquet npm `makecode`), lance `makecode build`
  dans ce dossier. Le fichier du jeu pour l'appareil se trouve ensuite dans `built/n3/binary.hex`.

## Sur l'appareil

Branche le Calliope mini 3 à l'ordinateur avec le câble USB. Il apparaît comme un lecteur. Fais glisser le fichier du
jeu (`.hex`) sur ce lecteur ; le jeu démarre ensuite tout seul. L'écran du GameKit a 160 × 120 pixels et 16 couleurs.
Ce jeu ne sauvegarde rien.

Ce jeu existe aussi en allemand, en anglais et en espagnol. Les quatre versions viennent du même projet de départ.
