// L'intro, mise en scène comme un petit film, sur une seule ligne de temps qui laisse le temps de lire. Tout est
// dessiné directement à la taille de l'écran : aucune image n'est créée pendant le film, le film n'utilise pas le
// hasard du jeu (Nuit.hasard) et aucune image ne vient de l'extérieur.
namespace Cinema {
    // Les lettres 5 x 7 partagées par le nom du jeu (dessins.ts) et la carte « CALLIOPE HACKER ». Cette police a les
    // caractères de alphabet : de A à Z et 13 lettres spéciales comme É, Ç ou Ü ; un autre caractère reste vide.
    const alphabet = "ACEHIKLOPRNTSBDFGJMQUVWXYZÀÁÈÉÊÍÓÚÇÑÄÖÜ"
    const motifsLettres = [
        "01110100011000111111100011000110001",
        "01111100001000010000100001000001111",
        "11111100001000011110100001000011111",
        "10001100011000111111100011000110001",
        "11111001000010000100001000010011111",
        "10001100101010011000101001001010001",
        "10000100001000010000100001000011111",
        "01110100011000110001100011000101110",
        "11110100011000111110100001000010000",
        "11110100011000111110101001001010001",
        "10001110011010110011100011000110001",
        "11111001000010000100001000010000100",
        "01111100001000001110000010000111110",
        "11110100011000111110100011000111110",
        "11110100011000110001100011000111110",
        "11111100001000011110100001000010000",
        "01111100001000010111100011000101111",
        "00001000010000100001000011000101110",
        "10001110111010110101100011000110001",
        "01110100011000110001101011001001101",
        "10001100011000110001100011000101110",
        "10001100011000110001100010101000100",
        "10001100011000110101101011010101010",
        "10001100010101000100010101000110001",
        "10001100010101000100001000010000100",
        "11111000010001000100010001000011111",
        "01000001000111010001111111000110001",
        "00010001000111010001111111000110001",
        "01000001001111110000111101000011111",
        "00010001001111110000111101000011111",
        "00100010101111110000111101000011111",
        "00010001001111100100001000010011111",
        "00010001000111010001100011000101110",
        "00010001001000110001100011000101110",
        "01111100001000010000011110010001100",
        "01101100101000111001101011001110001",
        "01010000000111010001111111000110001",
        "01010000000111010001100011000101110",
        "01010000001000110001100011000101110"
    ]
    // Le Calliope Hacker : une copie des données de la figure, 64 x 40 pixels, l'indice 0 est transparent,
    // dessinée seulement avec PALETTE_STUDIO. Ne jamais écrire dans HACKER ni le cloner (c'est un littéral gardé dans
    // la mémoire du programme). PALETTE_MINE est la palette du jeu, déclarée dans pxt.json.
    export const PALETTE_STUDIO = hex`000000ffffffffd23f2ee6d613998f7fd4ff2f6fe0ef3b45c58a4c7a4a26a7b0c6565d782b396607070be8a07a1a2038`
    export const HACKER = img`
        . . . . . . . . . . . . . . . . d d d d d . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . d d d d d d d 5 . . . . . c . c . b b b b b b b b b b b b b b b b b b b b b b . . . . . . . . . . .
        . . . . . . . . . . . . . d b b d d d d d d 5 . c . c . c . c d d d d d d d d d d d d d d d d d d d d d d . . . . . . . . . . .
        . . . . . . . . . . . . d b d d d d d d d d d 5 . c . c c c c d d f f f f f f f f f f f f f f f f f f d d . . . . . . . . . . .
        . . . . . . . . . . . . d b d d d d d d d d d 5 c c c c c c c d d f 5 5 5 5 5 5 f f f f f f f f f f f d d . c . . . . . . . . .
        . . . . . . . . . . . d b d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c . c . . . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f 2 2 2 2 2 2 2 2 2 f f f f f f d d . c . c . . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c c c . c . . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f 3 3 3 3 3 f f f f f f f f f f d d c c c c . c . . . . .
        . . . . . . . . . . . d d d d d d d d d d d d d 5 c c c c c c d d f f f f f f f f f f f f f f f f f f d d c c 2 2 c . c 2 2 . .
        . . . . . . . . . . . b d d d d d d d d d d d d 5 c c c c c c d d f f f f f 7 7 7 7 7 7 7 7 f f f f f d d c c 2 6 6 6 6 6 2 . .
        . . . . . . . . . . d d b d d d d d d d d d d d d 5 c c c c c d d f f f f f f f f f f f f f f f f f f d d c 6 6 6 6 6 6 6 6 6 .
        . . . . . . . . . d d d d b b d d d d d d d d d d d 5 c c c c d d f f f 5 5 5 5 5 5 5 5 5 5 5 f f f f d d 2 6 6 6 7 6 7 6 6 6 2
        . . . . . . d d d d d d d d d b b b b d d d d d d d d 5 c c c d d f f f f f f f f f f f f f f f f f f d d 2 6 6 6 7 7 7 6 6 6 2
        . . . . . d 3 3 3 3 3 3 d d d d d d d d d d d d d d d d 5 c c d d f 6 6 6 6 f f f f f f f f f f f f f d d c 6 6 6 6 7 6 6 6 6 .
        . . . . d 3 3 3 3 3 3 3 3 d d d d d d d d d d d d d d d d 5 c d d d d d d d d d d d d d d d d d d d d d d c c 2 6 6 6 6 6 2 . c
        . . . . d 3 3 3 3 3 3 3 4 d d d d d d d d d d d d b d d d d 5 d d d d d d d d d d d d d d d d d d d d d d c c 2 2 c d c 2 2 c .
        . . . . d 3 3 3 3 3 3 3 4 d d d d d d d d d d d d d b d d d d 5 c c c c c c c c c b b b c c c c c c c c c c c c c c c c . c . .
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d b d d d d d e e c c c b b b b b b b b b c c c c c c c c c c c c . c . c .
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d b d d d d e e d d d 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d d 6 b 5 b 3 b 7 b d 8 8 8 8 8 8 8 8 8 8 d d d d d d d d d d d d 8 8 8 8
        . . . . d 4 3 3 3 3 3 3 4 d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d d 1 d d a b a d 7 d 7 d d 8 8 8
        . . . . d 4 4 3 3 3 3 4 4 d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d 1 1 1 d d d d d 7 d 7 d d 8 8 8
        . . . . d 4 4 3 3 3 3 4 4 d d d d d d d d d d d d d d d d 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 d 1 d d d d d d d d d d 8 8 8 8
        . . . . . d 4 4 3 3 4 4 d d d d d d d d d d d d d d d d d d d d 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . . d 4 4 4 4 4 4 4 d d d d d d d d d d d d d d d d d d d d b 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        . . . . . . d 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 d d d d d d d d d d d d c c c c c c c c c c c b b c c . c . c . c . . b a a a a a a
        . . . . . . . d d d d d d d d d d d d d d d d d d d d d d d d d d d c c c c c c c c c c c b b c . c . c . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d . d d d d d . c d d d d d b . c . c . c . c . c . c b b . c . . . . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d . d d d d d . . c d d d d b c . c . c . c . c . c . b b . . 4 3 3 3 4 . . . b a b b b b a
        . . . . . . . . . . . . . . . . . d d . d d d d d . . . d d d d b . . . c . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        . . . . . . . . . . . . . . . . . d d 3 3 3 3 3 3 3 . . d d d d b . . . . . . . . . . . . b b . 4 3 d d d 3 4 . . b a a a a a a
        . . d . . . d . . . . . . . . . . d d 3 1 3 3 3 3 3 . . d d d d b . . . . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        . . d d . d d . . . . . . . . . . d d 1 1 1 1 1 1 1 . . d d d d b . . . . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a b b b b a
        . d 1 1 1 1 1 d 1 1 . . . . . . . d d . . . . . . . . 3 3 3 3 3 3 3 3 . . . . . . . . . . b b . 4 3 b b b 3 4 . . b a a a a a a
        . 1 1 d 1 1 1 1 1 1 1 d d d d d d d d d d d d d d . 3 3 1 3 3 3 3 3 3 3 . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        d 1 1 1 1 1 1 d d 1 1 . . . . d d . . . . . . d d . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . b b . 4 3 3 3 3 3 4 . . b a a a a a a
        4 3 3 3 3 3 3 3 3 3 4 . . . . b b . . . . . . b b . . . . . . . . . . . . . . . . . . . . b b . . 4 4 4 4 4 . . . b a b b b b a
        . 4 4 4 4 4 4 4 4 4 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b a a a a a a
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b a a a a a a
    `
    export const PALETTE_MINE = hex`000000eaf3dde65042a92d3fdd8b45f1cf7c49395378a29725384377c5c443616a151f2ba3b5a0625958353e40080c13`
    // Palette du studio pour sceneSalleControle et pour la carte du studio (sceneStudio) : de 23000 à 34500 ms du film
    // (de 37 à 57 s en temps réel).
    export function estTempsStudio(filmMs: number): boolean {return filmMs>=23000 && filmMs<34500}
    // Nuit.dessiner appelle choisirPalette() à chaque image avec la palette voulue ; elle ne change que si le souhait
    // change. Après un saut, un passage de l'intro ou une pause, la bonne palette est donc de retour
    // à l'image suivante.
    let paletteStudioActive = false
    export function choisirPalette(studio: boolean) {
        if(studio!=paletteStudioActive) {
            paletteStudioActive=studio
            image.setPalette(studio?PALETTE_STUDIO:PALETTE_MINE)
        }
    }
    export function estPaletteStudio(): boolean {return paletteStudioActive}
    let police: image.Font
    let estReduit = false
    function borner(x: number): number {return Math.max(0,Math.min(1,x))}
    function adoucir(x: number): number {x=borner(x);return x*x*(3-2*x)}
    function etiqueter(texte: string,y: number,couleur: number) {
        screen.print(texte,Math.floor((160-texte.length*6)/2),y,couleur,police)
    }
    export function dessinerLettre(lettre: string,x: number,y: number,taille: number,couleur: number) {
        let numero=alphabet.indexOf(lettre)
        if(numero<0)return
        let motif=motifsLettres[numero]
        for(let j=0;j<7;j++)for(let i=0;i<5;i++)
            if(motif.charAt(j*5+i)=="1")
                screen.fillRect(Math.round(x+i*taille),Math.round(y+j*taille),
                    Math.ceil(taille),Math.ceil(taille),couleur)
    }
    function dessinerBandesCinema() {
        screen.fillRect(0,0,160,9,15);screen.fillRect(0,111,160,9,15)
    }
    // Un jeu de couleurs par palette. Le trait : 3 pour le studio, 8 pour la mine. La deuxième ligne de texte : 5 pour
    // le studio, 12 pour la mine. La première ligne a toujours la couleur 1.
    function afficherSoustitre(ligne1: string,ligne2: string) {
        screen.fillRect(5,90,150,21,15);screen.drawLine(32,90,127,90,paletteStudioActive?3:8)
        etiqueter(ligne1,94,1);etiqueter(ligne2,103,paletteStudioActive?5:12)
    }
    function dessinerTaches(tempsSceneMs: number,nombre: number,couleur: number) {
        if(estReduit)return
        for(let i=0;i<nombre;i++) {
            let x=(i*47+tempsSceneMs/80)%172-6,y=(i*29+tempsSceneMs/(28+i%5))%99+9
            screen.drawLine(x,y,x-1,y+2,couleur)
        }
    }
    function dessinerEclat(x: number,y: number,rayon: number,couleur: number) {
        screen.drawLine(x-rayon,y,x+rayon,y,couleur);screen.drawLine(x,y-rayon/3,x,y+rayon/3,couleur)
        screen.fillRect(x-1,y-1,3,3,1)
    }
    function dessinerGerbe(tempsSceneMs: number,x: number,y: number,nombre: number) {
        if(estReduit || tempsSceneMs<0 || tempsSceneMs>1400)return
        for(let i=0;i<nombre;i++) {
            let angle=i*2.3999,secondes=tempsSceneMs/1000,vitesse=16+i%7*7
            let dx=Math.cos(angle)*vitesse,dy=Math.sin(angle)*vitesse
            let etincelleX=x+dx*secondes,etincelleY=y+dy*secondes+24*secondes*secondes
            screen.drawLine(etincelleX,etincelleY,etincelleX-dx*0.04,etincelleY-dy*0.04,tempsSceneMs<450?5:i%3==0?4:13)
        }
    }
    function sceneExterieur(tempsSceneMs: number) {
        screen.fill(11)
        let panoramique=estReduit?0:adoucir(tempsSceneMs/4200)*13
        // La lune derrière des bancs de nuages ; les immeubles lointains bougent beaucoup plus lentement.
        screen.fillCircle(123-panoramique/5,29,15,10)
        screen.fillCircle(128-panoramique/5,25,14,11)
        for(let i=0;i<7;i++) {
            let x=i*29-10-panoramique/4,hauteur=13+i*17%23
            screen.fillRect(x,77-hauteur,25,hauteur,8)
            for(let j=0;j<3;j++)screen.fillRect(x+5+j*6,69-hauteur,2,2,j==1?13:11)
        }
        // Un chevalement massif avec des croisillons, un tambour d'enroulement et un câble.
        let x=57-panoramique
        screen.fillTriangle(x-28,86,x-6,21,x-1,21,14)
        screen.fillTriangle(x+32,86,x+9,21,x+4,21,14)
        screen.drawLine(x-27,85,x-5,22,10)
        screen.drawLine(x+31,85,x+8,22,10)
        for(let i=0;i<4;i++) {
            let y=30+i*14,largeur=9+i*5
            screen.drawLine(x-largeur,y,x+largeur+4,y+14,10)
            screen.drawLine(x+largeur,y,x-largeur-4,y+14,8)
        }
        screen.fillRect(x-13,18,33,7,8);screen.drawLine(x-13,18,x+19,18,12)
        screen.drawCircle(x+2,18,8,10);screen.drawCircle(x+2,18,5,8)
        screen.drawLine(x+1,25,x+1,87,13);screen.drawLine(x+5,25,x+5,87,10)
        screen.fillRect(95-panoramique,61,65,26,14)
        screen.fillTriangle(89-panoramique,62,116-panoramique,48,151-panoramique,62,8)
        for(let i=0;i<5;i++)screen.fillRect(99-panoramique+i*12,69,5,7,5)
        screen.fillRect(0,87,160,24,15)
        // Le béton mouillé attrape de longs reflets.
        for(let i=0;i<22;i++) {
            let refletX=(i*31)%160,refletY=90+i*7%18
            screen.drawLine(refletX,refletY,refletX+3+i%8,refletY,i%6==0?13:8)
        }
        screen.drawLine(17-panoramique,110,49-panoramique,87,10)
        screen.drawLine(95-panoramique,110,70-panoramique,87,8)
        let faisceauX=estReduit?30:28+Math.sin(tempsSceneMs/1600)*21
        screen.drawLine(144,77,faisceauX,12,10);screen.drawLine(145,77,faisceauX+12,12,8)
        // Des silhouettes au premier plan passent devant les bâtiments.
        for(let i=0;i<7;i++) {
            let formeX=i*32-panoramique*2
            screen.fillRect(formeX,83,3,28,14);screen.drawLine(formeX,87,formeX+32,104,8)
        }
        dessinerTaches(tempsSceneMs,32,10)
        dessinerBandesCinema()
        if(tempsSceneMs>700) {etiqueter("MINE 09",15,1);etiqueter("23:47 / SERVICE DE NUIT",100,5)}
        // Un iris s'ouvre depuis le noir, au lieu d'éclairer tout l'écran d'un coup.
        let couverture=estReduit?0:80*(1-adoucir(tempsSceneMs/1000))
        screen.fillRect(0,9,couverture,102,15);screen.fillRect(160-couverture,9,couverture,102,15)
    }
    function sceneClef(tempsSceneMs: number) {
        screen.fill(15)
        screen.fillRect(13,14,134,95,8)
        screen.drawRect(13,14,134,95,10);screen.drawRect(17,18,126,87,14)
        for(let x=21;x<144;x+=119)for(let y=22;y<105;y+=78) {
            screen.fillCircle(x,y,2,13);screen.drawLine(x-1,y,x+1,y,15)
        }
        screen.fillRect(20,27,74,29,15);screen.drawRect(20,27,74,29,10)
        screen.print("CABINE",23,32,12,police)
        screen.print(tempsSceneMs<1100?"BLOQUÉE":"DÉPART",23,44,tempsSceneMs<1100?3:9,police)
        screen.drawCircle(111,43,12,14);screen.fillCircle(111,43,9,tempsSceneMs<1100?6:9)
        screen.drawCircle(111,43,6,15)
        screen.drawLine(111,43,111+(tempsSceneMs<1100?-5:5),38,1)
        screen.fillRect(30,64,98,6,15)
        for(let i=0;i<14;i++)screen.fillRect(32+i*7,65,4,4,tempsSceneMs>1100+i*40?5:14)
        // Une main gantée tourne la clé : d'abord elle avance, puis elle tourne.
        let allonge=adoucir(tempsSceneMs/900),rotation=adoucir((tempsSceneMs-950)/500)
        let mainX=114,mainY=110-allonge*26
        screen.fillRect(mainX-11,mainY,30,31,14)
        screen.fillRect(mainX-13,mainY-9,24,17,13)
        for(let i=0;i<4;i++)screen.drawLine(mainX-10+i*5,mainY-7,mainX-10+i*5,mainY+1,8)
        screen.drawLine(111,43,111-rotation*10,57,12)
        screen.fillRect(105-rotation*8,55,13,4,10)
        dessinerBandesCinema()
        if(tempsSceneMs>1300)afficherSoustitre("CONTRÔLE À L'ENTRETIEN :","VÉRIFIE LE GÉNÉRATEUR.")
    }
    function sceneDescente(tempsSceneMs: number) {
        screen.fill(15)
        let trajet=estReduit?90:tempsSceneMs/18+tempsSceneMs*tempsSceneMs/180000
        let pointDeFuiteX=estReduit?80:80+Math.sin(tempsSceneMs/1300)*2,pointDeFuiteY=47
        // Trois triangles pleins donnent de la masse aux parois du puits, au lieu de simples traits.
        screen.fillTriangle(0,9,pointDeFuiteX,pointDeFuiteY,0,111,8)
        screen.fillTriangle(160,9,pointDeFuiteX,pointDeFuiteY,160,111,11)
        screen.fillTriangle(0,9,pointDeFuiteX,pointDeFuiteY,160,9,14)
        for(let i=8;i>=0;i--) {
            let profondeur=((i*23+trajet)%207)/207,largeur=8+190*profondeur*profondeur,hauteur=largeur*0.65
            let x=pointDeFuiteX-largeur/2,y=pointDeFuiteY-hauteur/2
            screen.drawRect(x,y,largeur,hauteur,10)
            screen.drawRect(x+2,y+2,largeur-4,hauteur-4,8)
            screen.drawLine(x,y+hauteur,x+largeur,y+hauteur,13)
            screen.fillRect(x+4,y+3,3,2,i%3==0?5:14)
            screen.drawLine(x+4,y+hauteur-2,x+4,y+hauteur-6,12)
        }
        for(let i=0;i<4;i++)screen.drawLine(i*53,110,pointDeFuiteX,pointDeFuiteY,i%2==0?14:8)
        // Une grille au premier plan, des boulons et une console fixe.
        screen.fillRect(0,9,7,102,14);screen.fillRect(153,9,7,102,14)
        screen.drawLine(7,9,7,110,12);screen.drawLine(152,9,152,110,10)
        for(let i=0;i<8;i++) {
            let x=14+i*19
            screen.fillRect(x,9,2,81,14);screen.drawLine(x+1,10,x+1,89,10)
        }
        screen.fillRect(43,63,74,24,15);screen.drawRect(43,63,74,24,10)
        screen.print("NIVEAU",49,68,12,police)
        screen.print("-"+Math.min(480,Math.floor(tempsSceneMs*480/7500))+" M",49,77,5,police)
        for(let i=0;i<3;i++)screen.fillRect(98+i*5,70,3,3,tempsSceneMs<5500?9:3)
        if(tempsSceneMs>3600 && tempsSceneMs<5700)dessinerGerbe((tempsSceneMs-3600)%1100,147,18,21)
        dessinerBandesCinema()
        if(tempsSceneMs<2600)afficherSoustitre("PUIS REMONTE.","C'EST NOTÉ !")
        if(tempsSceneMs>5700)afficherSoustitre("OH ! C'ÉTAIT QUOI ?","PLUS DE COURANT.")
    }
    // Le hall sombre de sceneHallSombre. sceneBrummi le reprend avec toutes les lampes du plafond éteintes.
    // couleurLampeEteinte : couleur des lampes éteintes (3 dans sceneHallSombre, 14 dans sceneBrummi)
    function dessinerHall(tempsSceneMs: number, couleurLampeEteinte: number) {
        screen.fill(15)
        screen.fillTriangle(0,9,80,48,0,111,8)
        screen.fillTriangle(160,9,80,48,160,111,11)
        screen.fillTriangle(0,111,80,48,160,111,14)
        for(let i=0;i<7;i++) {
            let taille=18+i*i*4,x=80-taille/2,y=48-taille/3
            screen.drawRect(x,y,taille,taille*0.7,tempsSceneMs>1100+i*130?8:10)
            screen.drawLine(x,y+taille*0.7,x+taille,y+taille*0.7,15)
            let allume=tempsSceneMs<700+(6-i)*210
            screen.fillRect(76,y+3,8,2,allume?5:couleurLampeEteinte)
            if(allume) {
                screen.drawLine(76,y+5,x+5,y+taille*0.7,10)
                screen.drawLine(84,y+5,x+taille-5,y+taille*0.7,10)
            }
        }
        for(let i=0;i<5;i++)screen.drawLine(80,48,i*40,111,8)
        screen.fillRect(6,34,17,10,14);screen.print("09",9,37,12,police)
        // caisses à outils à droite
        if(tempsSceneMs>1800) {
            screen.fillRect(115,86,38,25,8);screen.fillRect(110,81,23,16,13)
            screen.fillRect(102,72,22,13,14);screen.drawLine(103,72,122,72,12)
            screen.fillRect(100,74,3,9,5)
        }
    }
    function sceneHallSombre(tempsSceneMs: number) {
        dessinerHall(tempsSceneMs,3)
        dessinerGerbe(tempsSceneMs-1000,133,22,28)
        dessinerBandesCinema()
        if(tempsSceneMs>1700)afficherSoustitre("IL MANQUE 5 FUSIBLES.","L'ASCENSEUR EST BLOQUÉ.")
    }
    // Brummi à toutes les tailles : la même construction que Nuit.dessinerRobot (dessins.ts), chaque pièce est agrandie
    // de echelle autour de (x, y).
    function dessinerPiece(x: number,y: number,echelle: number,dx: number,
        dy: number,largeur: number,hauteur: number,couleur: number) {
        screen.fillRect(Math.round(x+dx*echelle),Math.round(y+dy*echelle),
            Math.ceil(largeur*echelle),Math.ceil(hauteur*echelle),couleur)
    }
    function dessinerGrosBrummi(x: number,y: number,echelle: number,
        phaseChenilles: number,lumiere: number,bras: number) {
        // chenilles avec des plots qui bougent
        dessinerPiece(x,y,echelle,-5,3,4,3,14);dessinerPiece(x,y,echelle,2,3,4,3,14)
        for(let i=0;i<4;i++)dessinerPiece(x,y,echelle,i*2+(i>1?-2:-5)+phaseChenilles,4,1,1,10)
        // corps aux angles arrondis, ombre, un petit panneau avec deux boutons
        dessinerPiece(x,y,echelle,-4,-3,9,7,12);dessinerPiece(x,y,echelle,-5,-2,11,5,12)
        dessinerPiece(x,y,echelle,5,-2,1,5,10);dessinerPiece(x,y,echelle,-4,3,9,1,10)
        dessinerPiece(x,y,echelle,-2,-1,5,3,14)
        dessinerPiece(x,y,echelle,-1,0,1,1,5);dessinerPiece(x,y,echelle,1,0,1,1,9)
        // tête en dôme, son voyant jaune, deux lampes turquoise comme yeux et un petit sourire
        dessinerPiece(x,y,echelle,-3,-7,7,4,12)
        dessinerPiece(x,y,echelle,-2,-8,5,1,12);dessinerPiece(x,y,echelle,3,-6,1,3,10)
        dessinerPiece(x,y,echelle,-1,-10,3,2,lumiere)
        dessinerPiece(x,y,echelle,-2,-6,2,2,9);dessinerPiece(x,y,echelle,1,-6,2,2,9)
        dessinerPiece(x,y,echelle,-2,-6,1,1,1);dessinerPiece(x,y,echelle,1,-6,1,1,1)
        dessinerPiece(x,y,echelle,-1.5,-4,0.5,0.5,10)
        dessinerPiece(x,y,echelle,2,-4,0.5,0.5,10);dessinerPiece(x,y,echelle,-1,-3.5,3,0.5,10)
        // pinces : 0 baissées, 1 la droite levée, 2 les deux levées
        if(bras==0)dessinerPiece(x,y,echelle,6,-1,1,3,12)
        else {
            dessinerPiece(x,y,echelle,6,-5,1,4,12)
            dessinerPiece(x,y,echelle,5,-6,1,1,14)
            dessinerPiece(x,y,echelle,7,-6,1,1,14)
        }
        if(bras==2) {
            dessinerPiece(x,y,echelle,-6,-5,1,4,12)
            dessinerPiece(x,y,echelle,-7,-6,1,1,14)
            dessinerPiece(x,y,echelle,-5,-6,1,1,14)
        }
        else dessinerPiece(x,y,echelle,-6,-1,1,3,12)
        if(bras==0)dessinerPiece(x,y,echelle,7,1,1,1,14)
        if(bras<2)dessinerPiece(x,y,echelle,-7,1,1,1,14)
    }
    // sceneBrummi : Brummi se réveille dans le hall sombre. Son voyant jaune s'allume doucement (un petit cercle
    // grandit en 0,7 s). Brummi roule de la droite jusqu'au milieu en grandissant un peu (de 1,0 à 1,3), lève les deux
    // pinces et salue. Son voyant clignote une fois (un petit point blanc).
    function sceneBrummi(tempsSceneMs: number) {
        dessinerHall(9999,14)
        let roulement=estReduit?1:adoucir((tempsSceneMs-720)/2180),echelle=2.4*(1+0.3*roulement)
        let x=Math.round(148-68*roulement),y=Math.round(88-6*echelle)
        let lueur=estReduit?1:borner(tempsSceneMs/720)
        let bras=tempsSceneMs<2950?0:tempsSceneMs<3400?2:Math.floor((tempsSceneMs-3400)/400)%2+1
        dessinerGrosBrummi(x,y,echelle,roulement>0 && roulement<1?Math.floor(tempsSceneMs/150)%2:0,lueur<1?14:5,bras)
        if(lueur<1)screen.fillCircle(x,y-9*echelle,Math.round(lueur*1.4*echelle),5)
        if(tempsSceneMs>2790 && tempsSceneMs<3060)screen.fillCircle(x,y-9*echelle,2,1)
        dessinerBandesCinema()
        if(tempsSceneMs>630)etiqueter("BIP ! BIP ! ON RANGE !",101,12)
    }
    // sceneSalleControle, avec la palette du studio : la salle de contrôle. Le Calliope Hacker est assis à son bureau
    // (vu de dos) ; c'est lui qui a construit Brummi. L'écran s'allume case par case et montre le plan de la mine : un
    // point jaune, Brummi, rapporte un fusible à sa place (la case jaune).
    function sceneSalleControle(tempsSceneMs: number) {
        screen.fill(12)
        screen.fillRect(0,83,160,28,15);screen.drawLine(0,83,159,83,11)
        screen.drawTransparentImage(HACKER,4,44)
        screen.fillRect(82,13,74,60,13);screen.drawRect(82,13,74,60,11)
        screen.fillRect(116,73,6,6,11);screen.fillRect(108,78,22,2,11)
        for(let i=0;i<12;i++) {
            if(!estReduit && tempsSceneMs<i*60)continue
            let colonne=i%4,ligne=Math.floor(i/4),x=89+colonne*15,y=19+ligne*13
            if(colonne<3)screen.drawLine(x+11,y+4,x+14,y+4,4)
            if(ligne<2)screen.drawLine(x+5,y+8,x+5,y+12,4)
            screen.drawRect(x,y,11,8,i==0?2:3)
        }
        if(tempsSceneMs>800) {
            // le long de la rangée du bas vers la gauche (45 px), puis vers le haut (26 px)
            let trajet=adoucir((tempsSceneMs-800)/1500)*71,
                pointX=139-Math.min(45,trajet),pointY=trajet>45?49-(trajet-45):49
            screen.fillRect(pointX-1,pointY-1,3,3,2);screen.setPixel(pointX+2,pointY-2,1)
        }
        screen.fillRect(89,62,3,3,2);screen.print("BRUMMI",95,60,5,police)
        dessinerBandesCinema()
        if(tempsSceneMs>900)afficherSoustitre("J'AI CONSTRUIT BRUMMI.","IL REMET TOUT EN PLACE.")
    }
    // sceneStudio, la carte « Calliope Hacker présente », avec la palette du studio et ses indices fixes (fond 15,
    // lettres 1 avec une ombre 4 puis 13, trait 3, « présente » 2, éclat 2 avec un centre 1) : le personnage surgit de
    // derrière l'estrade en 0,4 s, les lettres arrivent en volant, un trait, « présente », un éclat. La carte se ferme
    // ensuite doucement sur le titre, sans saut.
    function sceneStudio(tempsSceneMs: number) {
        screen.fill(15)
        if(!estReduit)for(let i=0;i<6;i++) {
            let angle=tempsSceneMs/2200+i*1.047,dx=Math.cos(angle)*83,dy=Math.sin(angle)*43
            screen.fillTriangle(80,43,80+dx,43+dy,80+dx+4,43+dy+3,i%2==0?12:11)
        }
        let montee=estReduit?0:1-adoucir(tempsSceneMs/400)
        screen.drawTransparentImage(HACKER,48,18+Math.round(montee*42))
        // l'estrade devant lui, pour qu'il surgisse de derrière en montant
        screen.fillRect(0,58,160,53,15)
        for(let i=0;i<7;i++)screen.drawLine(80,58,i*27,111,12)
        for(let i=0;i<4;i++)screen.drawLine(10,81+i*i*2,150,81+i*i*2,12)
        // Les lettres arrivent une par une en volant, puis restent lisibles environ cinq secondes.
        const nomStudio="CALLIOPE HACKER"
        for(let i=0;i<nomStudio.length;i++) {
            let arrivee=estReduit?1:adoucir((tempsSceneMs-1500-i*65)/650)
            let x=13+i*9,y=66+(1-arrivee)*(i%2==0?-54:58)
            if(tempsSceneMs<1500+i*65 && !estReduit)continue
            dessinerLettre(nomStudio.charAt(i),x+2,y+3,1.5,13)
            dessinerLettre(nomStudio.charAt(i),x+1,y+1,1.5,4)
            dessinerLettre(nomStudio.charAt(i),x,y,1.5,1)
        }
        if(tempsSceneMs>2550) {
            let large=59*adoucir((tempsSceneMs-2550)/600)
            screen.drawLine(80-large,86,80+large,86,3)
            screen.fillRect(77,85,6,3,2)
        }
        if(tempsSceneMs>3200)etiqueter("présente",96,2)
        // Un seul éclat qui voyage.
        if(!estReduit && tempsSceneMs>3000 && tempsSceneMs<4000)dessinerEclat(13+(tempsSceneMs-3000)*0.134,64,7,2)
        if(!estReduit && tempsSceneMs>2200)for(let i=0;i<22;i++) {
            let ageEtincelleMs=(tempsSceneMs-2200+i*191)%2400,fraction=ageEtincelleMs/2400
            let x=(i*37)%150+5,y=107-fraction*88
            screen.setPixel(x,y,i%3==0?3:5)
        }
        // Fermer doucement sur le titre ; pas de saut brutal de la carte lumineuse à l'image suivante.
        if(tempsSceneMs>8300) {
            let couverture=estReduit?0:80*adoucir((tempsSceneMs-8300)/700)
            screen.fillRect(0,9,couverture,102,15);screen.fillRect(160-couverture,9,couverture,102,15)
        }
        dessinerBandesCinema()
    }
    export function dessiner(tempsFilmMs: number,reduit: boolean,petitePolice: image.Font) {
        police=petitePolice;estReduit=reduit
        if(tempsFilmMs<4200)sceneExterieur(tempsFilmMs)
        else if(tempsFilmMs<7000)sceneClef(tempsFilmMs-4200)
        else if(tempsFilmMs<14500)sceneDescente(tempsFilmMs-7000)
        else if(tempsFilmMs<18500)sceneHallSombre(tempsFilmMs-14500)
        else if(tempsFilmMs<23000)sceneBrummi(tempsFilmMs-18500)
        else if(tempsFilmMs<25500)sceneSalleControle(tempsFilmMs-23000)
        else sceneStudio(tempsFilmMs-25500)
        // Le titre du jeu est dessiné par Nuit entre 34,5 et 38 s du film.
    }
}
