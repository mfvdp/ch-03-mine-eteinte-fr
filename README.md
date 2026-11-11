# Mine éteinte

Salut ! Voici **Mine éteinte**, un jeu de **Calliope Hacker** pour le **Calliope mini 3 avec le GameKit**.

C'est la nuit dans la mine. Il n'y a plus de courant et tu n'as que ta lampe de casque. Trouve cinq fusibles, mets-les
dans le générateur et remonte par l'ascenseur. Surveille ta lampe : quand la batterie est vide, la nuit est finie.
Brummi, le petit robot de maintenance, adore ranger : chaque fois qu'il te rejoint, il te reprend un fusible et le
rapporte à sa place. Le Calliope Hacker l'a construit et regarde tout depuis la salle de contrôle, en haut.

## Comment jouer

- **Croix directionnelle :** marcher
- **A + direction :** courir (ça fait du bruit)
- **A :** ramasser un fusible ou une batterie, entrer dans un casier et en sortir
- **Tenir A devant le générateur :** installer un fusible
- **B, appui court :** allumer ou éteindre la lumière
- **Tenir B :** siffler ; si Brummi est près, il s'arrête un instant et écoute
- **Menu :** pause

## À toi de construire

Tout le code source est dans ce fichier de jeu. Ouvre-le dans MakeCode Arcade (arcade.makecode.com, « Importer »).
Change un nombre, lance le simulateur et regarde ce qui se passe :

- **La lampe dure plus longtemps :** dans `regles.ts`, `CONSO_FAISCEAU = 0.30`. C'est le pourcentage
  perdu par seconde quand la lumière est allumée. Essaie `0.1`.
- **Brummi est plus rapide :** dans `regles.ts`, `VITESSE_SUIVI = 64`. C'est le nombre de pixels par
  seconde quand Brummi te suit. Avec `90`, tu dois courir.
- **Siffler plus souvent :** dans `regles.ts`, `PAUSE_SIFFLET_MS = 6000`. C'est l'attente entre deux
  coups de sifflet, en millisecondes. Essaie `1000`.

L'explication du code pour les enfants, les parents et les enseignants est sur calliope-hacker.de.
