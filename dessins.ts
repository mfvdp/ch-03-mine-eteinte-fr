// Tous les dessins sont du pixel art en 160 x 120 pixels. Aucune image n'est créée pendant le jeu : les deux images
// plein écran (masque et fond) sont créées une seule fois au départ.
namespace Nuit {
    // La police Unicode font8 garde les accents du français et de l'espagnol. Six pixels par lettre.
    let petitePolice = image.font8
    let masque = image.create(160,120)
    let masqueTempsMs = -999
    let masqueX = -100
    let masqueY = -100
    let masqueSalle = -1
    let masqueDirection = 99
    let masqueLumiere = false
    let masqueCache = -2
    let fond = image.create(160,120)
    let fondSalle = -1
    let fondNumeroMine = -1
    // Le nom du jeu, dessiné avec les lettres 5 x 7 de cinema.ts (Cinema.dessinerLettre). Il est centré, quelle que
    // soit sa longueur, mais au-delà de 12 lettres il déborde du cadre.
    export const NOM_DU_JEU = "MINE ÉTEINTE"
    function dessinerLogo(y: number, visibles: number) {
        let nombre=NOM_DU_JEU.length,x0=Math.floor((160-(nombre*12-2))/2)
        for(let i=0;i<Math.min(nombre,visibles);i++) {
            Cinema.dessinerLettre(NOM_DU_JEU.charAt(i),x0+1+i*12,y+2,2,6)
            Cinema.dessinerLettre(NOM_DU_JEU.charAt(i),x0+i*12,y,2,1)
            if(NOM_DU_JEU.charAt(i)!=" ")screen.setPixel(x0+2+i*12,y+3,12)
        }
        screen.drawLine(x0+6,y+19,x0+nombre*12-9,y+19,10)
        screen.fillRect(69,y+18,22,3,5)
    }
    function ecrire(texte: string,x: number,y: number,couleur: number) {
        screen.print(texte,x,y,couleur,petitePolice)
    }
    function ecrireAuCentre(texte: string,y: number,couleur: number) {
        ecrire(texte,Math.floor((160-texte.length*6)/2),y,couleur)
    }
    // De petites images à la place des lettres, de 7 pixels de haut au plus : fusible 7 x 5, sac 7 x 7,
    // sifflet 8 x 6, porte 5 x 7, prise du générateur 9 x 7.
    // Un fusible tel qu'il traîne dans la mine : embouts bruns, corps jaune, milieu blanc.
    function dessinerSymboleFusible(x: number,y: number) {
        screen.fillRect(x,y+1,7,5,13);screen.fillRect(x+1,y+2,5,3,5);screen.drawLine(x+3,y+1,x+3,y+5,1)
    }
    // Un fusible dans le générateur (installé) : prise grise, fente sombre, fusible jaune, voyant turquoise.
    function dessinerSymboleInstalle(x: number,y: number) {
        screen.fillRect(x,y,9,7,10);screen.fillRect(x+1,y+1,7,5,14)
        screen.fillRect(x+2,y+2,5,3,5);screen.setPixel(x+4,y+3,1);screen.setPixel(x+7,y+1,9)
    }
    // Le sac (fusibles transportés) : une poignée et un sac clair avec un rabat.
    function dessinerSymboleSac(x: number,y: number) {
        screen.drawLine(x+2,y,x+4,y,12);screen.setPixel(x+1,y+1,12);screen.setPixel(x+5,y+1,12)
        screen.fillRect(x,y+2,7,5,12);screen.drawLine(x+1,y+3,x+5,y+3,13)
    }
    // Le sifflet (temps avant qu'il soit de nouveau prêt) : embout et corps rond avec un trou.
    function dessinerSymboleSifflet(x: number,y: number) {
        screen.fillRect(x,y+2,3,2,12);screen.fillCircle(x+5,y+3,2,12)
        screen.setPixel(x+5,y+3,15);screen.setPixel(x+7,y,10)
    }
    // Une porte (la sortie près de l'ascenseur) : un cadre et une poignée.
    function dessinerSymbolePorte(x: number,y: number,couleur: number) {
        screen.drawRect(x,y,5,7,couleur);screen.setPixel(x+3,y+4,couleur)
    }
    function dessinerBarres(hauteur: number) {
        screen.fillRect(0,0,160,hauteur,15)
        screen.fillRect(0,120-hauteur,160,hauteur,15)
    }
    function dessinerPluie(tempsSceneMs: number,nombre: number) {
        for(let i=0;i<nombre;i++) {
            let x=(i*29+Math.floor(tempsSceneMs/60))%178-9,y=(i*47+Math.floor(tempsSceneMs/(i%3+5)))%130-8
            screen.drawLine(x,y,x-3,y+7,i%4==0?10:8)
        }
    }
    function dessinerImmeubles(tempsSceneMs: number) {
        screen.fill(11)
        screen.fillCircle(123,30,14,8);screen.fillCircle(127,26,14,11)
        for(let i=0;i<8;i++) {
            let x=i*24-12,hauteur=12+(i*19)%24
            screen.fillRect(x,78-hauteur,23,hauteur,8)
            screen.fillRect(x+4,70-hauteur,5,8,8)
        }
        // Des fenêtres éclairées au loin et des toits d'usine en escalier.
        for(let i=0;i<19;i++) {
            let x=(i*23+7)%158,y=57+(i*11)%18
            screen.fillRect(x,y,2,2,i%5==0?13:11)
        }
        screen.fillRect(0,78,160,42,15)
        // Chevalement, poulie, diagonales d'acier et bâtiment du treuil.
        screen.drawLine(37,82,52,22,10);screen.drawLine(39,82,54,22,8)
        screen.drawLine(86,82,69,22,10);screen.drawLine(84,82,67,22,8)
        screen.fillRect(48,19,25,5,14);screen.drawCircle(60,18,7,10)
        screen.drawLine(49,32,75,49,8);screen.drawLine(73,32,45,49,8)
        screen.drawLine(45,49,80,67,8);screen.drawLine(76,49,40,67,8)
        screen.drawLine(60,19,60,88,10);screen.drawLine(64,19,64,88,8)
        screen.fillRect(99,67,47,16,14);screen.fillRect(112,59,21,9,14)
        for(let i=0;i<4;i++)screen.fillRect(104+i*10,71,4,4,Math.floor(tempsSceneMs/500)%11==0?13:5)
        screen.fillRect(42,82,45,4,13)
        screen.drawLine(0,84,159,84,8)
        screen.drawLine(28,118,51,86,8);screen.drawLine(94,118,74,86,8)
        screen.drawLine(32,118,54,86,14);screen.drawLine(90,118,71,86,14)
        for(let i=0;i<5;i++) {
            let y=90+i*i
            screen.drawLine(48-i*4,y,77+i*4,y,11)
        }
        screen.drawLine(151,43,151,82,10)
        screen.fillRect(147,42,9,2,5)
        screen.drawLine(151,45,136,81,11);screen.drawLine(151,45,159,73,11)
        // Route mouillée, brouillard bas qui dérive et reflets de lumières de service.
        for(let i=0;i<14;i++) {
            let x=(i*31+Math.floor(tempsSceneMs/130))%180-20,y=85+(i*7)%25
            screen.drawLine(x,y,x+10+i%9,y,i%4==0?10:11)
        }
        dessinerPluie(tempsSceneMs,38)
    }
    function dessinerArriveeTitre(tempsSceneMs: number) {
        screen.fill(15)
        if(!reduit)for(let i=0;i<26;i++) {
            let phase=(tempsSceneMs/12+i*17)%160
            let dx=(i*31%101)-50,dy=(i*43%71)-35
            let x=80+dx*phase/50,y=55+dy*phase/50
            screen.drawLine(x,y,x+dx*0.08,y+dy*0.08,tempsSceneMs<1100?10:11)
        }
        // Le gros titre tombe à sa place lettre par lettre (sans chute avec les effets réduits) ; ensuite, une ligne
        // claire file dessous de gauche à droite.
        let pose=reduit?0:Math.max(0,1-tempsSceneMs/650)
        let y=43-Math.floor(pose*pose*24)
        dessinerLogo(y,Math.floor(tempsSceneMs/75))
        if(tempsSceneMs>850) {
            screen.drawLine(15,68,144,68,8)
            let balayage=Math.min(130,(tempsSceneMs-850)/4)
            screen.drawLine(15,68,15+balayage,68,13)
        }
        if(tempsSceneMs>1000)ecrireAuCentre("TROUVE 5 FUSIBLES !",79,5)
        if(tempsSceneMs>1400)ecrireAuCentre("TON SERVICE COMMENCE.",96,12)
        dessinerBarres(10)
    }
    function dessinerIntro() {
        let tempsFilmMs=tempsFilmIntroMs(ageMs)
        if(tempsFilmMs>=34500)dessinerArriveeTitre(tempsFilmMs-34500)
        else Cinema.dessiner(tempsFilmMs,reduit,petitePolice)
        // Pied de page : un jeu de couleurs pour chaque palette (la couleur 13 serait noire sur noir avec la
        // palette du studio).
        let studio=Cinema.estPaletteStudio()
        ecrireAuCentre("A/B : PASSER",112,studio?11:10)
        screen.fillRect(0,119,Math.min(160,ageMs*160/dureeIntroMs),1,studio?11:13)
    }
    function dessinerTitre() {
        dessinerImmeubles(ageMs+4000)
        // Un seul panneau entoure toutes les lignes, avec de la place pour la surbrillance de la ligne choisie.
        screen.fillRect(4,19,152,91,15)
        screen.drawRect(4,19,152,91,10)
        screen.drawRect(6,21,148,87,8)
        for(let x=8;x<154;x+=144) {
            screen.setPixel(x,23,12);screen.setPixel(x,105,10)
        }
        dessinerLogo(28,NOM_DU_JEU.length)
        ecrireAuCentre("5 FUSIBLES. 1 ROBOT.",53,12)
        for(let i=0;i<4;i++) {
            let y=63+i*9
            if(menu==i) screen.fillRect(12,y-1,136,9,8)
            let etiquette=i==0?"COMMENCER":i==1?"EXERCICE":
                i==2?(reduit?"EFFETS : RÉDUITS":"EFFETS : CINÉMA"):
                (muet?"SON : NON":"SON : OUI")
            ecrire(etiquette,28,y,menu==i?1:10)
            if(menu==i)ecrire(">",17,y,5)
        }
        screen.fillRect(0,112,160,8,15)
        ecrireAuCentre("DIRECTION : CHOIX  A : OK",112,10)

        ecrireAuCentre("SOUS TERRE / -480 M",10,12)
    }
    function dessinerChoixEntrainement() {
        screen.fill(15)
        screen.drawLine(12,18,147,18,10)
        ecrireAuCentre("RAPPORT D'ENTRETIEN / 09",9,5)
        ecrireAuCentre("AVANT DE DESCENDRE",30,1)
        ecrireAuCentre("Lampe, sifflet et Brummi.",46,12)
        ecrireAuCentre("Apprends sans danger.",56,12)
        screen.fillRect(15,73,130,13,8);ecrireAuCentre("A  LANCER L'EXERCICE",77,1)
        ecrireAuCentre("B  COMMENCER LE SERVICE",96,5)
        ecrireAuCentre("L'exercice est au choix.",112,10)
    }
    // Écran de la salle de contrôle dans l'ascenseur : le Calliope Hacker, de dos à son bureau, capuche relevée, sweat
    // noir avec un liseré clair, chaise et baskets turquoise. L'écran brille : dessinerObscurite() laisse un trou dans
    // le masque à cet endroit, donc on le voit dès la première seconde de chaque nuit et de l'entraînement.
    export const ECRAN_X = 9
    export const ECRAN_Y = 81
    function dessinerEcranControle() {
        let x=ECRAN_X,y=ECRAN_Y
        fond.fillRect(x,y,26,18,14);fond.drawRect(x,y,26,18,10);fond.fillRect(x+10,y+18,6,2,13)
        fond.fillRect(x+2,y+2,22,14,10)
        // son propre écran sur le bureau, avec un point jaune : Brummi sur le plan de la mine
        fond.fillRect(x+13,y+3,9,6,8);fond.fillRect(x+14,y+4,7,4,9);fond.setPixel(x+17,y+5,5)
        fond.fillRect(x+2,y+10,22,2,13)
        // capuche et sweat en noir (15) avec un liseré clair (12)
        fond.drawLine(x+7,y+3,x+8,y+3,15)
        fond.fillRect(x+6,y+4,4,4,15);fond.fillRect(x+5,y+8,7,6,15)
        fond.setPixel(x+6,y+3,12);fond.drawLine(x+5,y+4,x+5,y+7,12)
        fond.drawLine(x+4,y+8,x+4,y+13,12)
        fond.fillRect(x+11,y+9,3,2,15)
        // chaise et baskets en turquoise (9)
        fond.drawLine(x+4,y+14,x+12,y+14,9);fond.setPixel(x+5,y+15,9);fond.setPixel(x+11,y+15,9)
    }
    // Décor d'une salle, gardé en mémoire. Sa forme correspond exactement aux carreaux de collision.
    function dessinerDecorSalle() {
        fond.fill(15)
        let donneesSalle=salles[salle]
        for(let y=0;y<15;y++)for(let x=0;x<20;x++) {
            let genreCarreau=donneesSalle.carreaux.getUint8(y*20+x),pixelX=x*8,pixelY=y*8
            if(genreCarreau==1) {
                fond.fillRect(pixelX,pixelY,8,8,14)
                fond.drawLine(pixelX,pixelY,pixelX+7,pixelY,10)
                fond.drawLine(pixelX,pixelY,pixelX,pixelY+7,8)
                fond.drawLine(pixelX+1,pixelY+6,pixelX+7,pixelY+6,11)
                fond.setPixel(pixelX+2,pixelY+2,12)
                if(!estMur(salle,x,y+1)) {
                    fond.fillRect(pixelX,pixelY+4,8,4,8)
                    fond.drawLine(pixelX,pixelY+4,pixelX+7,pixelY+4,10)
                    fond.drawLine(pixelX,pixelY+7,pixelX+7,pixelY+7,15)
                }
                if(!estMur(salle,x+1,y))fond.drawLine(pixelX+7,pixelY,pixelX+7,pixelY+7,15)
            } else {
                fond.fillRect(pixelX,pixelY,8,8,(x+y)%2==0?11:15)
                fond.drawLine(pixelX,pixelY,pixelX+7,pixelY,8)
                fond.setPixel(pixelX+1,pixelY+1,14)
                if((x*13+y*7+salle)%5==0) {
                    fond.drawLine(pixelX+3,pixelY+5,pixelX+6,pixelY+5,14)
                    fond.setPixel(pixelX+2,pixelY+6,8)
                }
                if(estMur(salle,x,y-1))fond.fillRect(pixelX,pixelY,8,2,15)
                if(genreCarreau==2) {
                    fond.fillRect(pixelX+1,pixelY+3,6,3,15)
                    fond.drawLine(pixelX+1,pixelY+2,pixelX+6,pixelY+5,13)
                    fond.drawLine(pixelX+3,pixelY+6,pixelX+5,pixelY+1,4)
                    fond.setPixel(pixelX+2,pixelY+2,12)
                }
                if(genreCarreau==3) {
                    fond.fillRect(pixelX,pixelY,8,8,8)
                    fond.drawLine(pixelX+1,pixelY+2,pixelX+5,pixelY+2,10)
                    fond.drawLine(pixelX+3,pixelY+5,pixelX+7,pixelY+5,9)
                    fond.setPixel(pixelX+1,pixelY+6,7)
                }
            }
        }
        // Tuyaux de service au plafond, colliers et une cloison numérotée.
        fond.fillRect(12,12,136,5,15)
        fond.fillRect(12,12,136,3,10)
        fond.drawLine(12,12,147,12,12)
        for(let x=16;x<146;x+=22) {
            fond.fillRect(x,11,3,5,14);fond.setPixel(x+1,12,13)
        }
        fond.fillRect(118,18,27,10,15)
        fond.drawRect(118,18,27,10,8)
        fond.print((salle<10?"0":"")+salle,124,21,10,petitePolice)
        // Des silhouettes différentes pour chaque famille de salles.
        if(donneesSalle.genre==GenreSalle.Generateur || donneesSalle.genre==GenreSalle.Ascenseur) {
            fond.fillRect(57,37,40,31,8)
            fond.drawRect(57,37,40,31,10)
            for(let x=58;x<97;x+=6) {
                fond.drawLine(x,37,x+3,40,5)
                fond.drawLine(x,64,x+3,67,4)
            }
            if(donneesSalle.genre==GenreSalle.Ascenseur) {
                fond.fillRect(61,42,32,21,15)
                for(let x=63;x<92;x+=5)fond.drawLine(x,43,x,61,10)
                fond.drawLine(77,42,77,62,12)
                fond.fillRect(97,45,5,12,14);fond.setPixel(99,48,9)
                dessinerEcranControle()
            } else {
                fond.drawLine(76,37,76,19,13)
                fond.drawLine(78,37,78,19,4)
                fond.fillRect(60,70,33,6,15)
                for(let x=62;x<91;x+=3)fond.drawLine(x,71,x,74,10)
            }
        }
        if(donneesSalle.genre==GenreSalle.Atelier || donneesSalle.genre==GenreSalle.Depot) {
            fond.fillRect(13,88,13,17,15)
            fond.fillRect(12,86,13,16,13)
            fond.drawRect(12,86,13,16,10)
            fond.drawLine(14,88,22,99,14);fond.drawLine(22,88,14,99,14)
            fond.drawLine(12,86,24,86,12)
            fond.fillRect(130,96,14,9,8)
            for(let x=132;x<143;x+=3)fond.drawLine(x,97,x,103,10)
        }
        if(donneesSalle.genre==GenreSalle.Hall) {
            fond.fillRect(88,18,7,26,15)
            fond.drawLine(90,18,90,41,13);fond.drawLine(92,18,92,41,10)
            fond.drawCircle(93,43,4,13);fond.fillRect(94,38,4,4,11)
            fond.drawLine(12,94,147,94,8);fond.drawLine(12,97,147,97,14)
        }
        if(donneesSalle.genre==GenreSalle.Borne) {
            // Borne de recharge : un socle sous la place de parking de Brummi (116, 60), un poteau de charge avec une
            // lampe jaune, un câble jusqu'au mur et un panneau avec la tête de Brummi.
            fond.fillRect(106,64,21,5,13);fond.drawLine(106,64,126,64,12)
            fond.drawLine(107,68,125,68,14)
            fond.fillRect(130,44,6,25,10);fond.drawLine(130,44,135,44,12)
            fond.drawLine(135,45,135,68,14)
            fond.fillRect(131,47,4,3,5);fond.fillRect(131,53,4,8,14)
            fond.setPixel(132,55,9);fond.setPixel(132,58,9)
            fond.drawLine(126,66,129,66,14)
            fond.drawLine(136,50,151,50,14);fond.drawLine(136,51,151,51,8)
            fond.fillRect(96,36,15,12,14);fond.drawRect(96,36,15,12,10)
            fond.fillRect(100,40,7,5,12);fond.setPixel(103,38,5);fond.setPixel(103,39,10)
            fond.setPixel(101,42,9);fond.setPixel(105,42,9);fond.drawLine(102,44,104,44,10)
        }
        for(let direction=0;direction<4;direction++)if(donneesSalle.portes[direction]>=0) {
            let x=direction==0?150:direction==2?6:73,y=direction==1?108:direction==3?6:57
            if(direction%2==0) {
                fond.fillRect(x,y-3,4,3,10);fond.fillRect(x,y+15,4,3,10)
                fond.drawLine(x+1,y,x+1,y+13,13)
            } else {
                fond.fillRect(x-3,y,3,4,10);fond.fillRect(x+15,y,3,4,10)
                fond.drawLine(x,y+1,x+13,y+1,13)
            }
        }
    }
    function dessinerChose(chose: Chose) {
        let x=Math.floor(chose.x),y=Math.floor(chose.y)
        screen.fillRect(x-5,y+4,12,3,15)
        if(chose.genre==GenreChose.Fusible) {
            screen.fillRect(x-4,y-3,9,7,13)
            screen.fillRect(x-3,y-2,7,5,5)
            screen.fillRect(x-1,y-3,3,7,1)
            screen.drawLine(x-1,y,x+1,y,9)
            screen.setPixel(x-4,y-3,12);screen.setPixel(x+4,y+3,4)
        } else if(chose.genre==GenreChose.Batterie) {
            screen.fillRect(x-4,y-4,8,9,8)
            screen.fillRect(x-3,y-4,6,8,7)
            screen.drawLine(x-3,y-4,x+2,y-4,1)
            screen.fillRect(x-1,y-6,2,2,12)
            screen.drawLine(x-1,y-1,x+1,y-1,1);screen.drawLine(x,y-2,x,y,1)
            screen.drawLine(x-3,y+3,x+2,y+3,10)
        } else if(chose.genre==GenreChose.Casier) {
            screen.fillRect(x-6,y-8,13,17,15)
            screen.fillRect(x-6,y-8,11,15,10)
            screen.drawLine(x-6,y-8,x+4,y-8,12)
            screen.fillRect(x+4,y-7,2,14,8)
            screen.drawRect(x-4,y-6,7,12,8)
            for(let ligne=0;ligne<3;ligne++)screen.drawLine(x-3,y-4+ligne*2,x+1,y-4+ligne*2,15)
            screen.setPixel(x+1,y+3,5);screen.setPixel(x+2,y+3,4)
            screen.fillRect(x-5,y+7,2,2,13);screen.fillRect(x+3,y+7,2,2,13)
        } else if(chose.genre==GenreChose.Generateur) {
            screen.fillRect(x-9,y-8,19,17,15)
            screen.fillRect(x-9,y-8,17,14,10)
            screen.drawLine(x-8,y-8,x+7,y-8,12)
            screen.fillRect(x-7,y-6,14,10,8)
            screen.fillRect(x+8,y-6,2,13,14)
            for(let i=0;i<5;i++) {
                screen.fillRect(x-6+i*3,y-4,2,4,i<installes?9:13)
                if(i<installes)screen.setPixel(x-6+i*3,y-4,1)
            }
            screen.drawLine(x-5,y+3,x+4,y+3,installes==5?9:4)
            screen.fillRect(x-6,y+6,3,3,13);screen.fillRect(x+4,y+6,3,3,13)
            screen.setPixel(x-8,y-6,5);screen.setPixel(x-8,y+4,12)
        }
    }
    function dessinerPerso() {
        if(casierCache>=0)return
        dessinerPersoEn(Math.floor(persoX),Math.floor(persoY),
            regardX,regardY,lampe,Math.floor((persoX+persoY)/3)%2)
    }
    function dessinerPersoEn(x: number,y: number,regardX: number,
        regardY: number,lampe: boolean,phaseJambes: number) {
        screen.fillRect(x-4,y+4,9,3,15)
        screen.fillRect(x-2,y+2,2,3+phaseJambes,8);screen.fillRect(x+1,y+2,2,4-phaseJambes,8)
        screen.setPixel(x-2,y+5+phaseJambes,13);screen.setPixel(x+2,y+6-phaseJambes,13)
        screen.fillRect(x-3,y-2,7,5,10)
        screen.drawLine(x-2,y,x+2,y,5)
        screen.fillRect(x-1,y-3,3,3,13)
        screen.fillRect(x-3,y-6,6,4,4)
        screen.fillRect(x-2,y-6,4,2,5)
        screen.drawLine(x-3,y-3,x+3,y-3,5)
        screen.setPixel(x-1,y-5,1)
        let lampeX=x+Math.round(regardX*4),lampeY=y+Math.round(regardY*4)
        screen.fillRect(lampeX-1,lampeY-1,3,3,13)
        screen.setPixel(lampeX+Math.round(regardX),
            lampeY+Math.round(regardY),lampe?1:12)
    }
    // De petits signes au-dessus de Brummi, de 3 x 5 pixels, ligne par ligne : ? ! z et une note.
    const SYMBOLES = ["111001010000010", "010010010000010", "111001010100111", "011010010110110"]
    function dessinerSymbole(numero: number,x: number,y: number) {
        let motif=SYMBOLES[numero]
        for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(motif.charAt(j*3+i)=="1")screen.setPixel(x+i,y+j,5)
    }
    // Brummi, le robot de maintenance : corps clair aux angles arrondis, tête en dôme avec deux yeux-lampes turquoise,
    // antenne avec un voyant jaune, deux chenilles et deux pinces. Jamais dans les couleurs 2, 3 ou 6.
    // x, y : centre du corps ; l'image va de x-7 à x+7 (x+8 avec le fusible porté) et de y-10 à y+5 ;
    // les signes vont de x-8 à x+9 et montent jusqu'à y-19 (le deuxième z à la borne).
    // lumiere : couleur du voyant de l'antenne (5 jaune, 1 pendant un bip, 13 faible à la borne).
    // bras : 0 baissés, 1 pince droite levée avec un fusible, 2 les deux levées (il danse, il salue).
    export function dessinerRobot(x: number,y: number,comportement: number,
        phaseChenilles: number,lumiere: number,bras: number) {
        // chenilles
        screen.fillRect(x-5,y+3,4,3,14);screen.fillRect(x+2,y+3,4,3,14)
        screen.setPixel(x-5+phaseChenilles,y+4,10);screen.setPixel(x-3+phaseChenilles,y+4,10)
        screen.setPixel(x+2+phaseChenilles,y+4,10);screen.setPixel(x+4+phaseChenilles,y+4,10)
        // corps aux angles arrondis, ombre à droite et en bas, un petit panneau avec deux boutons
        screen.fillRect(x-4,y-3,9,7,12);screen.fillRect(x-5,y-2,11,5,12)
        screen.drawLine(x+5,y-2,x+5,y+2,10);screen.drawLine(x-4,y+3,x+4,y+3,10)
        screen.fillRect(x-2,y-1,5,3,14);screen.setPixel(x-1,y,5);screen.setPixel(x+1,y,9)
        // tête en dôme, antenne et voyant
        screen.fillRect(x-3,y-7,7,4,12);screen.fillRect(x-2,y-8,5,1,12);screen.drawLine(x+3,y-6,x+3,y-4,10)
        screen.fillRect(x-1,y-10,3,2,lumiere)
        // yeux : deux lampes turquoise ; Brummi regarde autour de lui quand il cherche et les ferme presque à la borne
        let decalageYeux=comportement==Comportement.Regarder?(Math.floor(ecouleMs/500)%2)*2-1:0
        if(comportement==Comportement.Borne) {
            screen.drawLine(x-2,y-5,x-1,y-5,10)
            screen.drawLine(x+1,y-5,x+2,y-5,10)
        }
        else {
            screen.fillRect(x-2+decalageYeux,y-6,2,2,9);screen.fillRect(x+1+decalageYeux,y-6,2,2,9)
            screen.setPixel(x-2+decalageYeux,y-6,1);screen.setPixel(x+1+decalageYeux,y-6,1)
        }
        screen.drawLine(x-1,y-4,x+1,y-4,10)
        // pinces
        if(bras==0) {
            screen.drawLine(x-6,y-1,x-6,y+1,12);screen.setPixel(x-7,y+1,14)
            screen.drawLine(x+6,y-1,x+6,y+1,12);screen.setPixel(x+7,y+1,14)
        } else {
            screen.drawLine(x+6,y-2,x+6,y-5,12);screen.setPixel(x+5,y-6,14);screen.setPixel(x+7,y-6,14)
            if(bras==2) {
                screen.drawLine(x-6,y-2,x-6,y-5,12)
                screen.setPixel(x-7,y-6,14);screen.setPixel(x-5,y-6,14)
            }
            else {
                screen.drawLine(x-6,y-1,x-6,y+1,12);screen.setPixel(x-7,y+1,14)
                // le fusible qu'il rapporte, tenu au-dessus de la pince droite
                screen.fillRect(x+4,y-10,5,4,13);screen.fillRect(x+5,y-9,3,2,5);screen.setPixel(x+6,y-10,1)
            }
        }
        // ce qu'il fait : ? curieux, ! veut ranger, ... cherche, deux notes écoute, z se recharge
        if(comportement==Comportement.Curieux)dessinerSymbole(0,x-1,y-16)
        else if(comportement==Comportement.Suivre)dessinerSymbole(1,x-1,y-16)
        else if(comportement==Comportement.Regarder) {
            screen.setPixel(x-3,y-13,5);screen.setPixel(x,y-13,5);screen.setPixel(x+3,y-13,5)
        }
        else if(comportement==Comportement.Ecouter) {
            let haut=Math.floor(ecouleMs/250)%2
            dessinerSymbole(3,x-8,y-15+haut)
            dessinerSymbole(3,x+5,y-14-haut)
        }
        else if(comportement==Comportement.Borne) {
            dessinerSymbole(2,x+4,y-14)
            if(Math.floor(ecouleMs/1000)%2==0)dessinerSymbole(2,x+7,y-19)
        }
    }
    // Brummi dans le monde : dessiné après dessinerObscurite(), donc jamais caché. Là où la lumière du personnage ne
    // l'atteint pas, un halo doux (cercle de couleur 8, gris-bleu sombre) le montre, même derrière les murs.
    function dessinerBrummiDansMonde() {
        if(brummi.salle!=salle)return
        let comportement=brummi.comportement,x=Math.floor(brummi.x),y=Math.floor(brummi.y)
        if(comportement==Comportement.Ecouter)x+=Math.floor(ecouleMs/250)%2
        if(!estVisible(brummi.x,brummi.y)) {
            screen.fillCircle(x,y-2,9,8)
            // garder le personnage devant le halo quand ils sont proches
            if(Math.abs(persoX-brummi.x)<17 && Math.abs(persoY-brummi.y)<17)dessinerPerso()
        }
        let lumiere=comportement==Comportement.Borne?13:alerteMs>0 && etat==Etat.Jeu?1:5
        dessinerRobot(x,y,comportement,comportement==Comportement.Ecouter
            || comportement==Comportement.Borne?0:Math.floor((brummi.x+brummi.y)/3)%2,lumiere,
            comportement==Comportement.Rapporter && brummi.numeroFusible>=0
                ?1:comportement==Comportement.Ecouter?2:0)
    }
    // Antenne du tableau : deux arcs, jaunes quand Brummi bipe.
    function dessinerAntenne(x: number,y: number,bipe: boolean) {
        let couleur=bipe?5:10
        screen.fillRect(x-1,y,3,2,bipe?5:12);screen.drawLine(x,y+2,x,y+7,10);screen.drawLine(x-2,y+8,x+2,y+8,10)
        screen.setPixel(x-3,y,couleur);screen.drawLine(x-4,y+1,x-4,y+3,couleur)
        screen.setPixel(x-3,y+4,couleur)
        screen.setPixel(x+3,y,couleur);screen.drawLine(x+4,y+1,x+4,y+3,couleur)
        screen.setPixel(x+3,y+4,couleur)
        if(bipe) {screen.drawLine(x-6,y,x-6,y+4,5);screen.drawLine(x+6,y,x+6,y+4,5)}
    }
    // Barre de curiosité : Brummi remarque un personnage qui porte un fusible (cadre 10, remplissage jaune).
    function dessinerBarreCuriosite(x: number,y: number) {
        screen.drawRect(x,y,40,4,10);screen.fillRect(x+1,y+1,38*Math.min(1,brummi.vuMs/600),2,5)
    }
    // Un éventail de petits rayons coupés par les murs donne des bords de lumière doux.
    // Les remplissages de triangles natifs évitent de parcourir tous les pixels de l'écran en TypeScript.
    function decouperEventailLumiere(rayon: number, segments: number, plein: boolean) {
        let dernierX=persoX,dernierY=persoY
        for(let i=0;i<=segments;i++) {
            let angle=plein?i*Math.PI*2/segments:-Math.PI/6+i*Math.PI/3/segments
            let cosAngle=Math.cos(angle),sinAngle=Math.sin(angle)
            let dx=plein?cosAngle:regardX*cosAngle-regardY*sinAngle,
                dy=plein?sinAngle:regardY*cosAngle+regardX*sinAngle
            let finX=persoX,finY=persoY
            for(let ecart=2;ecart<=rayon;ecart+=2) {
                finX=persoX+dx*ecart;finY=persoY+dy*ecart
                if(estMur(salle,Math.floor(finX/8),Math.floor(finY/8)))break
            }
            if(i>0)masque.fillTriangle(persoX,persoY,dernierX,dernierY,finX,finY,0)
            dernierX=finX;dernierY=finY
        }
    }
    function dessinerObscurite() {
        let direction=Math.round(regardX*10)+Math.round(regardY*10)*30
        let lumiere=lampe
        if(masqueSalle!=salle || masqueX!=persoX || masqueY!=persoY || masqueDirection!=direction
            || masqueLumiere!=lumiere || masqueCache!=casierCache) {
            if(ecouleMs-masqueTempsMs>=40 || masqueSalle!=salle
                || masqueLumiere!=lumiere || masqueCache!=casierCache) {
                masque.fill(15)
                for(let y=0;y<15;y++)for(let x=0;x<20;x++) {
                    let pixelX=x*8,pixelY=y*8
                    if(estMur(salle,x,y)) {
                        masque.fillRect(pixelX,pixelY,8,7,11)
                        if(!estMur(salle,x,y+1))masque.drawLine(pixelX,pixelY+4,pixelX+7,pixelY+4,8)
                    } else if((x+y)%2==0)masque.drawLine(pixelX,pixelY,pixelX+7,pixelY,11)
                    if(casierCache>=0 && estVisible(pixelX+4,pixelY+4))masque.fillRect(pixelX,pixelY,8,8,0)
                }
                // L'écran de la salle de contrôle, dans l'ascenseur, brille.
                if(salle==0)masque.fillRect(ECRAN_X,ECRAN_Y,26,20,0)
                if(casierCache<0) {
                    decouperEventailLumiere(12,16,true)
                    if(lumiere)decouperEventailLumiere(64,32,false)
                }
                masqueX=persoX;masqueY=persoY;masqueDirection=direction;masqueSalle=salle
                masqueLumiere=lumiere;masqueCache=casierCache;masqueTempsMs=ecouleMs
            }
        }
        screen.drawTransparentImage(masque,0,0)
    }
    function dessinerFleche(x: number,y: number,direction: number,couleur: number) {
        if(direction==0 || direction==2) {
            let signe=direction==0?1:-1
            screen.drawLine(x-3*signe,y,x+3*signe,y,couleur)
            screen.drawLine(x,y-3,x+3*signe,y,couleur);screen.drawLine(x,y+3,x+3*signe,y,couleur)
        } else {
            let signe=direction==1?1:-1
            screen.drawLine(x,y-3*signe,x,y+3*signe,couleur)
            screen.drawLine(x-3,y,x,y+3*signe,couleur);screen.drawLine(x+3,y,x,y+3*signe,couleur)
        }
    }
    function dessinerBalises() {
        let suivante=prochaineSalle(salle,installes>=5?0:4,true)
        for(let direction=0;direction<4;direction++) {
            let salleVoisine=salles[salle].portes[direction]
            if(salleVoisine<0)continue
            let x=direction==0?151:direction==2?8:79,y=direction==1?102:direction==3?18:63
            if(installes>=5 || salle==0 || salle==1 || salles[salleVoisine].visitee) {
                dessinerFleche(x,y,direction,salleVoisine==suivante?5:10)
                if(salleVoisine==suivante && (installes>=5 || salle==0 || salle==1)) {
                    // Sous la flèche, sauf pour la porte du bas : là, le signe se place à côté de la flèche,
                    // pour que la barre du bas de l'écran ne le cache pas.
                    let symboleX=direction==1?x+5:x-2,symboleY=direction==1?y-3:y+6
                    if(installes>=5)dessinerSymbolePorte(symboleX,symboleY,5)
                    else ecrire("G",symboleX,symboleY,5)
                }
            }
        }
    }
    function dessinerBandeauEntrainement() {
        screen.fillRect(0,0,160,24,15)
        screen.drawLine(0,0,159,0,8)
        screen.fillRect(0,3,2,17,5)
        ecrireAuCentre(titresEntrainement[etape],3,5)
        // La ligne de leçon garde deux pixels d'écart avec la bande jaune (x 0 à 1) : elle ne commence jamais à gauche
        // de x 4. Une ligne de 26 lettres va donc de x 4 à x 159 ; les lignes plus courtes restent centrées.
        let lecon=lignesEntrainement[etape]
        ecrire(lecon,Math.max(4,Math.floor((160-lecon.length*6)/2)),13,1)
        screen.fillRect(0,23,160*(etape+1)/titresEntrainement.length,1,10)
        if(etape==0) {
            screen.drawCircle(116,76,6,5);dessinerFleche(116,64,1,5)
        }
        // Les cibles de l'entraînement restent visibles pour guider.
        let cible=etape==3?0:etape==4?1:etape==5?2:-1
        if(cible>=0) {dessinerChose(choses[cible]);dessinerFleche(choses[cible].x,choses[cible].y+13,3,5)}
        // Étapes 04 à 06 : les nombres du tableau (cachés sous le bandeau d'entraînement) avec leurs images ;
        // à l'étape 04 une flèche montre le nombre du sac, à l'étape 05 celui du générateur.
        if(cible>=0) {
            screen.fillRect(94,25,65,12,15);screen.drawRect(94,25,65,12,10)
            dessinerSymboleInstalle(97,27);ecrire(installes+"/5",108,27,9)
            dessinerSymboleSac(129,27);ecrire(transportes+"/3",138,27,5)
            if(etape==3)dessinerFleche(147,42,3,5)
            if(etape==4)dessinerFleche(117,42,3,5)
        }
        // Étape 07 : Brummi bipe et l'antenne (d'habitude dans le tableau, sous ce bandeau) clignote ici.
        if(etape==6)dessinerAntenne(150,2,alerteMs>0)
        // Étape 12 : la batterie d'entraînement, visible dans le noir, avec une flèche au-dessus.
        if(etape==11) {
            if(choses.length>3 && !choses[3].prise) {
                dessinerChose(choses[3]);dessinerFleche(choses[3].x,choses[3].y-13,1,5)
            }
            // la barre de la lampe est sous le bandeau d'entraînement : on la montre sous le panneau
            screen.fillRect(4,59,46,9,15);dessinerBarreLampe(6,61)
        }
        if(etape==4) {
            let generateur=choses[1]
            let pret=choisi==1
            if(pret)screen.drawRect(generateur.x-10,generateur.y-9,20,18,9)
            screen.fillRect(4,75,152,29,15)
            if(enInsertion) {
                ecrireAuCentre("POSE  "+Math.min(3,Math.floor(insertionMs/1000))+
                    " / 3 S",77,9)
                screen.drawRect(29,87,102,6,10)
                screen.fillRect(30,88,Math.min(100,insertionMs/30),4,9)
                ecrireAuCentre("GARDE A APPUYÉ",96,12)
            } else {
                ecrireAuCentre(pret?(aVerrouille?"LÂCHE A ET RECOMMENCE":"C'EST BON : MAINTIENS A"):
                    "APPROCHE DU GÉNÉRATEUR",80,pret?9:5)
                ecrireAuCentre("LÂCHE LA CROIX",94,12)
            }
        }
        if(etape==2) {screen.drawRect(29,98,102,4,10);screen.fillRect(30,99,Math.min(100,progres/20),2,5)}
        if(etape==5 && casierCache>=0) {
            screen.fillRect(0,89,160,11,15);ecrireAuCentre("BIEN. A : RESSORS.",91,5)
        }
        if(etape>=6 && etape<=11) {
            // Expliquer la règle au-dessus de la démonstration, sans la cacher.
            screen.fillRect(3,27,154,31,15)
            if(etape==6) {
                ecrireAuCentre("IL PREND CE QUE TU PORTES",29,5)
                ecrireAuCentre("ET LE REMET À SA PLACE.",39,5)
                ecrireAuCentre("BIPS : IL EST PRÈS. A : OK",49,12)
            } else if(etape==7) {
                ecrireAuCentre("LA LUMIÈRE ATTIRE BRUMMI.",29,5)
                ecrireAuCentre("DANS LE NOIR IL VOIT PEU.",39,12)
                ecrireAuCentre("DE PRÈS, IL TE REPÈRE.",49,12)
                // la barre de curiosité est toujours visible à cette étape, juste au-dessus de Brummi
                dessinerBarreCuriosite(Math.floor(brummi.x)-20,Math.floor(brummi.y)-17)
            } else if(etape==8) {
                ecrireAuCentre("COURIR ATTIRE BRUMMI.",29,5)
                ecrireAuCentre("MARCHER EST PLUS DISCRET.",39,12)
                ecrireAuCentre("IL ENTEND LE GÉNÉRATEUR.",49,12)
                screen.drawRect(29,99,102,4,10)
                screen.fillRect(30,100,Math.min(100,progres/10),2,5)
            } else if(etape==9) {
                ecrireAuCentre("SIFFLE QUAND IL EST PRÈS.",29,5)
                ecrireAuCentre("IL S'ARRÊTE UN MOMENT.",39,12)
                ecrireAuCentre("IL ÉCOUTE ET IL DANSE.",49,12)
                dessinerFleche(109,76,0,5)
                screen.fillRect(4,94,152,15,15)
                ecrireAuCentre(pauseSiffletMs>0?
                    "SIFFLET PRÊT DANS "+Math.ceil(pauseSiffletMs/1000)+" S":
                    "MAINTIENS B",97,pauseSiffletMs>0?10:5)
            } else if(etape==10) {
                ecrireAuCentre("ÉLOIGNE-TOI VITE !",29,5)
                ecrireAuCentre("IL NE S'ARRÊTE QUE 2,5 S.",39,12)
                ecrireAuCentre("COURIR : A + DIRECTION",49,12)
                screen.drawCircle(40,76,6,5);dessinerFleche(52,76,2,5)
            } else {
                ecrireAuCentre("TA LAMPE SE VIDE.",29,5)
                ecrireAuCentre("LES BATTERIES LA CHARGENT.",39,12)
                ecrireAuCentre("VIDE ? SERVICE TERMINÉ.",49,12)
            }
            if(etape!=8 && etape!=9)ecrireAuCentre("EXERCICE SANS DANGER",101,10)
        }
        screen.fillRect(0,112,160,8,15);ecrireAuCentre("BOUTON MENU : PASSER",112,10)
        if(etape==12) {
            screen.fillRect(2,36,156,61,15);screen.drawRect(2,36,156,61,10)
            ecrireAuCentre("À TOI DE JOUER !",46,5)
            ecrireAuCentre("5 fusibles. Une sortie.",62,12)
            ecrireAuCentre("A  COMMENCER LE SERVICE",80,1)
        }
    }
    // Barre de la lampe : orange sous 20 %, son cadre change de couleur une fois par seconde (pas
    // de clignotement rapide).
    function dessinerBarreLampe(x: number,y: number) {
        let faible=charge<20
        screen.drawRect(x,y,25,5,faible?(Math.floor(ecouleMs/1000)%2==0?4:12):10)
        screen.fillRect(x+1,y+1,Math.max(0,23*charge/100),3,faible?4:5)
        ecrire(""+Math.ceil(charge),x+28,y,12)
    }
    function dessinerTableau() {
        screen.fillRect(0,0,160,11,15)
        screen.drawLine(0,10,159,10,8)
        dessinerBarreLampe(3,3)
        dessinerSymboleInstalle(53,3);ecrire(installes+"/5",64,3,9)
        dessinerSymboleSac(91,3);ecrire(transportes+"/3",100,3,5)
        if(distanceBip<=12)dessinerAntenne(150,1,alerteMs>0)
        if(transportes>0 && brummi.vuMs>0 && brummi.comportement!=Comportement.Suivre)dessinerBarreCuriosite(60,13)
        if(bMaintenuMs>0) {
            screen.drawRect(Math.floor(persoX)-7,Math.floor(persoY)+8,14,3,10)
            screen.fillRect(Math.floor(persoX)-6,Math.floor(persoY)+9,12*Math.min(1,bMaintenuMs/350),1,5)
        }
        if(pauseSiffletMs>0) {dessinerSymboleSifflet(137,13);ecrire(""+Math.ceil(pauseSiffletMs/1000),147,13,10)}
        screen.fillRect(0,112,160,8,15)
        if(enInsertion) {
            ecrire("POSER",4,112,5);screen.drawRect(65,114,89,4,10)
            screen.fillRect(66,115,87*insertionMs/3000,2,9)
        } else if(tempsMessageMs>0) {
            // Brummi a reposé un fusible : image de fusible et nom de la salle où il se trouve de nouveau.
            if(symboleMessage) {
                let x=Math.floor((160-texteMessage.length*6-10)/2)
                dessinerSymboleFusible(x,112)
                ecrire(texteMessage,x+10,112,5)
            }
            else ecrireAuCentre(texteMessage,112,5)
        }
        else if(choisi>=0) {
            let chose=choses[choisi],etiquette=chose.genre==GenreChose.Fusible?"A : PRENDRE LE FUSIBLE":
                chose.genre==GenreChose.Batterie?
                    "A : BATTERIE +"+Math.min(GAIN_BATTERIE,Math.floor(100-charge)):
                chose.genre==GenreChose.Casier?(casierCache>=0?"A : SORTIR DU CASIER":"A : SE CACHER"):
                chose.genre==GenreChose.Generateur?"MAINTIENS A : POSER":"ASCENSEUR / SANS COURANT"
            ecrireAuCentre(etiquette,112,12)
        } else {ecrireAuCentre(ageMs%6000<4000?salles[salle].nomSalle:"BOUTON MENU : PAUSE",112,10)}
        if(transitionMs>0) {screen.fillRect(3,49,154,13,15);ecrireAuCentre(salles[salle].nomSalle,53,5)}
    }
    function dessinerMonde() {
        if(fondSalle!=salle || fondNumeroMine!=numeroMine) {
            dessinerDecorSalle()
            fondSalle=salle
            fondNumeroMine=numeroMine
        }
        screen.drawImage(fond,0,0)
        for(let i=0;i<choses.length;i++)if(choses[i].salle==salle && !choses[i].prise)dessinerChose(choses[i])
        if(!reduit && lampe)for(let i=0;i<7;i++) {
            let x=(i*37+Math.floor(ecouleMs/160))%144+8
            let y=(i*23+Math.floor(ecouleMs/240))%92+16
            if(estVisible(x,y))screen.setPixel(x,y,i%3==0?12:10)
        }
        dessinerPerso();dessinerObscurite();dessinerBrummiDansMonde();dessinerBalises()
        // Sifflet : deux anneaux de son autour du personnage, de rayon 6 à 17 en 300 ms (dessin seulement : la lumière
        // ne change pas).
        if(effetSiffletMs>0) {
            let anneau=6+Math.floor((300-effetSiffletMs)/25),
                centreX=Math.floor(persoX),centreY=Math.floor(persoY)
            screen.drawCircle(centreX,centreY,anneau,9)
            if(anneau>10)screen.drawCircle(centreX,centreY,anneau-5,9)
        }
        dessinerTableau()
        if(etat==Etat.Entrainement)dessinerBandeauEntrainement()
    }
    function dessinerPause() {
        screen.fill(15)
        ecrireAuCentre("SERVICE EN PAUSE",18,5)
        screen.drawLine(15,29,145,29,10)
        for(let i=0;i<4;i++) {
            let etiquette=i==0?"REPRENDRE":
                i==1?(etatPrecedent==Etat.Entrainement?"PASSER L'EXERCICE":
                    (reduit?"EFFETS : RÉDUITS":"EFFETS : CINÉMA")):
                i==2?(muet?"SON : NON":"SON : OUI"):
                "ÉCRAN TITRE"
            ecrire(etiquette,23,38+i*13,menu==i?1:10)
            if(menu==i)ecrire(">",13,38+i*13,5)
        }
        ecrireAuCentre("DIRECTION : CHOIX  A : OK",112,10)
    }
    // Cartes de résultat. Personne ne perd rien ici : la lampe est vide, la nuit est finie.
    function dessinerBilan() {
        screen.fill(15)
        let phaseSalut=Math.floor(ageMs/500)%2
        let secondes=Math.floor(tempsMs/1000),y=75
        if(gagne) {
            for(let i=0;i<6;i++)screen.drawLine(35+i*18,15,35+i*18,45,8)
            screen.fillRect(32,35,98,4,5)
            // Brummi salue à côté de l'ascenseur
            dessinerRobot(142,38,Comportement.Ronde,0,5,phaseSalut?2:0)
            ecrireAuCentre("EN HAUT. ENFIN.",51,1)
            ecrireAuCentre(foisRemarque==0?"SANS UN BRUIT":
                fusiblesRepris==0?"RIEN PERDU !":"SERVICE RÉUSSI !",66,5)
        } else {
            // Brummi, avec sa lumière, accompagne le personnage jusqu'à l'ascenseur (image de y 8 à 35). La grille est
            // ouverte : ses barreaux repliés sont poussés de chaque côté et la cabine est éclairée.
            screen.fillRect(52,8,56,27,14);screen.drawRect(52,8,56,27,10);screen.fillRect(60,10,40,23,11)
            for(let x=54;x<59;x+=2) {screen.drawLine(x,10,x,32,8);screen.drawLine(x+47,10,x+47,32,8)}
            screen.drawLine(40,35,120,35,13)
            screen.fillCircle(66,25,10,8)
            dessinerRobot(66,29,Comportement.Ronde,phaseSalut,5,phaseSalut?2:0)
            dessinerPersoEn(88,28,-1,0,false,phaseSalut)
            ecrireAuCentre("FINI POUR AUJOURD'HUI.",38,1)
            ecrireAuCentre(raisonFin,47,5)
            ecrireAuCentre("BRUMMI TE RACCOMPAGNE.",56,12)
            // jusqu'où la nuit est allée (fusibles dans le générateur sur 5) et un conseil
            dessinerSymboleInstalle(65,66);ecrire(installes+"/5",77,66,9)
            ecrireAuCentre("PENSE AUX BATTERIES !",75,5)
            y=85
        }
        let ecartLignes=gagne?10:9
        ecrireAuCentre("TEMPS "+Math.floor(secondes/60)+":"+(secondes%60<10?"0":"")+secondes%60,y,12)
        ecrireAuCentre("VISITES DE BRUMMI : "+contacts,y+ecartLignes,10)
        ecrireAuCentre("SIFFLETS "+sifflets+"  MINE "+numeroMine,y+2*ecartLignes,10)
        ecrireAuCentre("A : REJOUER B : AUTRE MINE",gagne?109:112,5)
    }
    export function dessiner() {
        // La palette voulue pour cette image : celle du studio seulement dans la salle de contrôle et sur
        // la carte (Cinema.estTempsStudio).
        Cinema.choisirPalette(etat==Etat.Intro && Cinema.estTempsStudio(tempsFilmIntroMs(ageMs)))
        if(etat==Etat.Intro)dessinerIntro()
        else if(etat==Etat.Titre)dessinerTitre()
        else if(etat==Etat.ChoixEntrainement)dessinerChoixEntrainement()
        else if(etat==Etat.Jeu || etat==Etat.Entrainement)dessinerMonde()
        else if(etat==Etat.Pause)dessinerPause()
        else dessinerBilan()
    }
    export function oublierImages() {fondSalle=-1;masqueSalle=-1}
}
