// Les règles de la nuit de travail : salles, personnage, Brummi, lampe, sifflet, menus et entraînement. Ici, rien n'est
// dessiné et aucun son n'est joué. Le temps arrive de l'extérieur sous la forme d'une valeur dt, pour que le jeu se
// déroule toujours de la même façon. demanderSon note seulement une demande pour le fichier son.ts. Le dessin
// n'intervient ici que pour oublier ses images en cache (oublierImages).
namespace Nuit {
    export enum Etat { Intro, Titre, ChoixEntrainement, Entrainement, Jeu, Pause, Bilan }
    export enum Comportement { Borne, Ronde, Curieux, Suivre, Regarder, Ecouter, Rapporter }
    // GenreSalle dit ce qu'est une salle (GenreSalle.Generateur : la salle du générateur) ; GenreChose dit ce qui se
    // trouve dans une salle (GenreChose.Generateur : le générateur lui-même, où l'on met les fusibles).
    export enum GenreSalle { Ascenseur, Couloir, Atelier, Hall, Generateur, Depot, Borne }
    export enum GenreChose { Fusible, Batterie, Casier, Generateur, Sortie }
    export class DonneesSalle {
        x: number; y: number; genre: GenreSalle; nomSalle: string
        portes: number[]; carreaux: Buffer; visitee: boolean
        constructor(x: number, y: number, genre: GenreSalle, nomSalle: string) {
            this.x = x; this.y = y; this.genre = genre; this.nomSalle = nomSalle
            this.portes = [-1, -1, -1, -1]; this.carreaux = control.createBuffer(300); this.visitee = false
        }
    }
    export class Chose {
        salle: number; x: number; y: number; genre: GenreChose; prise: boolean
        constructor(salle: number, x: number, y: number, genre: GenreChose) {
            this.salle = salle; this.x = x; this.y = y; this.genre = genre; this.prise = false
        }
    }
    export class Robot {
        constructor() {}
        salle = 11; x = 116; y = 60; dx = -1; dy = 0
        comportement: Comportement = Comportement.Borne; salleCible = 11; cibleX = 116; cibleY = 60
        minuteurMs = 0; horsDeVueMs = 0; vuMs = 0; reveilRestantMs = 0; casierObserve = -1
        routeX = 0; routeY = 0; ageRouteMs = 1000; numeroCaseCible = -1; attenteMs = 0
        numeroFusible = -1 // numéro du fusible que Brummi rapporte, -1 = aucun
    }
    // Une seule ligne de temps pour l'image et le son du film d'intro. Les passages à lire reçoivent plus de temps que
    // les passages d'action : reperesFilmMs donne des instants du film, reperesReelsMs les mêmes endroits en temps
    // réel. Entre deux repères, le temps est étiré ou comprimé. Les sons gardent leur vitesse et leur hauteur.
    export const dureeIntroMs = 64000
    const reperesFilmMs = [0,4200,5500,7000,9600,12700,14500,16200,18500,23000,23900,25500,34500,38000]
    const reperesReelsMs = [0,6000,7800,12000,17000,20000,25000,27500,32000,37000,38500,43500,57000,64000]
    export function tempsFilmIntroMs(reelMs: number): number {
        for(let i=1;i<reperesReelsMs.length;i++)if(reelMs<reperesReelsMs[i])
            return reperesFilmMs[i-1]+(reelMs-reperesReelsMs[i-1])*
                (reperesFilmMs[i]-reperesFilmMs[i-1])/(reperesReelsMs[i]-reperesReelsMs[i-1])
        return reperesFilmMs[reperesFilmMs.length-1]
    }
    export function tempsReelIntroMs(filmMs: number): number {
        for(let i=1;i<reperesFilmMs.length;i++)if(filmMs<reperesFilmMs[i])
            return reperesReelsMs[i-1]+(filmMs-reperesFilmMs[i-1])*
                (reperesReelsMs[i]-reperesReelsMs[i-1])/(reperesFilmMs[i]-reperesFilmMs[i-1])
        return dureeIntroMs
    }
    export let etat = Etat.Intro
    export let etatPrecedent = Etat.Jeu
    export let ageMs = 0
    export let tempsMs = 0
    export let numeroMine = 9137
    let valeurHasard = 9137
    export let salles: DonneesSalle[] = []
    export let choses: Chose[] = []
    export let brummi = new Robot()
    export let salle = 0
    export let persoX = 76
    export let persoY = 60
    export let regardX = 1
    export let regardY = 0
    export let charge = 100
    export let lampe = false
    export let transportes = 0
    export let installes = 0
    export let casierCache = -1
    export let insertionMs = 0
    export let enInsertion = false
    export let foisRemarque = 0
    export let sifflets = 0
    export let effetSiffletMs = 0
    export let pauseSiffletMs = 0
    export let bMaintenuMs = 0
    export let bDeclenche = false
    export let aVerrouille = false
    export let choisi = -1
    export let etape = 0
    export let ageEtapeMs = 0
    export let progres = 0
    export let texteMessage = ""
    export let tempsMessageMs = 0
    // une petite image de fusible avant le message : Brummi a reposé un fusible dans cette salle
    export let symboleMessage = false
    // les alertes de la lampe attendent pendant qu'un fusible se met en place ; les autres messages disparaissent quand
    // la pose commence
    export let messageAttend = false
    export let reduit = false
    export let muet = false
    export let gagne = false
    export let raisonFin = ""
    export let menu = 0
    export let bipRestantMs = 0
    export let distanceBip = 999
    export let numeroEffet = 0
    export let prioriteEffet = 0
    export let effetRestantMs = 0
    export let dernierBruitMs = 0
    export let salleDernierBruit = -1
    export let dernierBruitX = 0
    export let dernierBruitY = 0
    export let transitionMs = 0
    export let alerteMs = 0
    export let ecouleMs = 0
    // combien de fois Brummi a rejoint le personnage pendant cette nuit (avec ou sans fusible)
    export let contacts = 0
    // fusibles que Brummi a rapportés à leur place (c'est de là que dépend « RIEN PERDU ! »)
    export let fusiblesRepris = 0
    export let graceMs = 0       // millisecondes pendant lesquelles un deuxième contact ne compte pas
    export let contentMs = 0     // millisecondes pendant lesquelles Brummi est content et ne remarque rien
    export let sac: number[] = [] // numéros des fusibles transportés, le plus ancien d'abord
    export let alertesDonnees = 0 // alertes de la lampe déjà données (0, 1 ou 2)
    // Valeurs à essayer : pour rendre le jeu plus facile ou plus difficile, change ces nombres et observe le résultat.
    export const CONSO_REPOS = 0.08      // pourcentage par seconde : la lampe de casque brille toujours un peu
    // pourcentage par seconde quand le faisceau est allumé (à la place de CONSO_REPOS)
    export const CONSO_FAISCEAU = 0.30
    export const GAIN_BATTERIE = 35      // pourcentage gagné par batterie
    export const ALERTE_LAMPE_1 = 30     // première alerte de la lampe, en pourcentage
    export const ALERTE_LAMPE_2 = 15     // deuxième alerte de la lampe, en pourcentage
    export const VITESSE_SUIVI = 64      // pixels par seconde quand Brummi suit (marche 45, course 92)
    export const PLUS_SUIVI = 2          // pixels par seconde en plus pour chaque fusible installé
    export const SUIVI_A_VIDE = 0        // 1 = Brummi suit aussi un personnage sans fusible (0 dans le jeu)
    export const VITESSE_PORT = 60       // pixels par seconde quand Brummi rapporte un fusible
    export const GRACE_MS = 4000         // temps sans nouveau contact (jamais moins de 3000)
    export const CONTENT_MS = 10000      // Brummi est content après avoir reposé un fusible et ne remarque rien
    // ... et 5 s de plus pour chaque fusible qu'il a déjà reposé pendant cette nuit
    export const CONTENT_PLUS_MS = 5000
    export const CONTENT_MAX_MS = 30000  // ... mais jamais plus de 30 s
    export const REGARD_MS = 5000        // Brummi regarde autour de lui après avoir perdu le personnage de vue
    export const ARRET_SIFFLET_MS = 2500 // Brummi s'arrête et écoute après un coup de sifflet
    export const PAUSE_SIFFLET_MS = 6000
    // en pixels, dans la même salle, dans toutes les directions, sans avoir besoin de voir le personnage
    export const PORTEE_SIFFLET = 72
    export const BIP_PROCHE_MS = 500     // pause entre deux bips quand Brummi est tout près
    export const BIP_PAR_CARREAU_MS = 150 // millisecondes en plus par carreau de distance
    export const REVEIL_MS = 4000        // du premier fusible pris jusqu'au départ de Brummi de sa borne
    // Règles fixes, pas des valeurs d'équilibrage.
    // A et B comptent comme la combinaison de pause seulement s'ils sont pressés à moins de 150 ms l'un de l'autre.
    export const PAUSE_COMBO_MS = 150
    export const DEBUT_CARTE_MS = 43500  // la carte « Calliope Hacker présente » commence ici (temps réel de l'intro)
    export const BLOCAGE_CARTE_MS = 1500 // sur la carte, A ou B ouvre le menu du titre après ce délai
    // charge de la lampe à l'étape 12 de l'entraînement, jusqu'à ce que la batterie soit prise
    export const CHARGE_ENTRAINEMENT = 40
    let dernieresTouches = 0
    let comboMs = 0
    let horlogeBruitMs = 0
    let horlogeBruitInsertionMs = 0
    let horlogeRadarMs = 0
    let ambianceMs = 0
    let aAppuyeMs = 0
    let bAppuyeMs = 0
    // 12 salles de 300 carreaux ; des tampons de 16 bits partagés évitent des milliers de nombres séparés.
    // Un numéro de case compte les carreaux de toute la mine : salle × 300 + ligne × 20 + colonne.
    let file = control.createBuffer(7200)
    let distances = control.createBuffer(7200)
    let distancesChemin = control.createBuffer(600)
    let fileChemin = control.createBuffer(600)
    let numeroCaseChemin = -1
    export let calculsChemin = 0
    let sallesRoute: number[] = []
    let tableRoutes = control.createBuffer(144)
    let tableRoutesValide = false
    const SALLE_X = [0,1,1,2,2,2,1,3,3,3,4,4]
    const SALLE_Y = [2,2,1,1,2,3,3,1,2,3,2,3]
    const GENRES_SALLES = [GenreSalle.Ascenseur,GenreSalle.Couloir,
        GenreSalle.Atelier,GenreSalle.Hall,GenreSalle.Generateur,GenreSalle.Atelier,
        GenreSalle.Hall,GenreSalle.Depot,GenreSalle.Couloir,GenreSalle.Depot,GenreSalle.Couloir,GenreSalle.Borne]
    const NOMS_SALLES = ["ASCENSEUR", "RÉPARTITEUR", "ATELIER", "HALL DES GRUES", "GÉNÉRATEUR", "POMPES",
        "BASSIN", "DÉPÔT NORD", "PUITS", "DÉPÔT SUD", "CONVOYEUR", "BORNE DE RECHARGE"]
    export const titresEntrainement = [
        "01 / ARRIVÉE", "02 / LUMIÈRE", "03 / MOUVEMENT", "04 / RAMASSER", "05 / COURANT",
        "06 / SE CACHER", "07 / BRUMMI", "08 / VISION", "09 / OUÏE",
        "10 / SIFFLET", "11 / DISTANCE", "12 / LAMPE", "13 / EN ROUTE"
    ]
    export const lignesEntrainement = [
        "Va à la cible jaune.",
        "B court : allume la lampe.",
        "A + direction : cours 2 s.",
        "Au fusible : immobile, A.",
        "À l'arrêt, maintiens A.",
        "Au casier : A, puis A.",
        "Voici Brummi.",
        "B court : éteins la lampe.",
        "A + direction : cours 1 s.",
        "Maintiens B : siffle.",
        "Cours à la cible gauche.",
        "Prends la batterie : A.",
        "Exercice fini. A : jouer"
    ]
    export function demanderSon(numero: number, priorite: number) {
        if (priorite >= prioriteEffet || effetRestantMs <= 0) {
            numeroEffet = numero; prioriteEffet = priorite; effetRestantMs = priorite >= 3 ? 350 : 100
        }
    }
    export function afficherMessage(texte: string) {
        texteMessage = texte; tempsMessageMs = 2200; symboleMessage = false; messageAttend = false
    }
    export function hasard(limite: number): number {
        valeurHasard = (valeurHasard * 1664525 + 1013904223) | 0
        return (valeurHasard & 0x7fffffff) % limite
    }
    export function entrerEtat(nouveau: Etat) {
        etat = nouveau; ageMs = 0; bMaintenuMs = 0; bDeclenche = false; insertionMs = 0; enInsertion = false
        aVerrouille = true; comboMs = 0; menu = 0
        // Une touche encore tenue avant le changement d'état ne compte qu'une fois relâchée :
        // B ne fait rien tant qu'elle n'est pas relâchée, et A+B tenus pendant le changement ne forment pas la
        // combinaison de pause.
        bDeclenche = true; aAppuyeMs = -1000000; bAppuyeMs = 1000000
    }
    function relier(origine: number, arrivee: number) {
        let direction = SALLE_X[arrivee] > SALLE_X[origine] ? 0
            : SALLE_Y[arrivee] > SALLE_Y[origine] ? 1 : SALLE_X[arrivee] < SALLE_X[origine] ? 2 : 3
        salles[origine].portes[direction] = arrivee; salles[arrivee].portes[(direction + 2) % 4] = origine
    }
    export function estMur(numeroSalle: number, x: number, y: number): boolean {
        if (numeroSalle < 0 || numeroSalle >= salles.length || x < 0 || y < 0 || x >= 20 || y >= 15) return true
        return salles[numeroSalle].carreaux.getUint8(y * 20 + x) == 1
    }
    export function carreau(numeroSalle: number, x: number, y: number): number {
        if (x < 0 || y < 0 || x >= 20 || y >= 15) return 1
        return salles[numeroSalle].carreaux.getUint8(y * 20 + x)
    }
    function poserCarreau(numeroSalle: number, x: number, y: number, valeur: number) {
        salles[numeroSalle].carreaux.setUint8(y * 20 + x, valeur)
    }
    function poserObstacle(numeroSalle: number, x: number, y: number, largeur: number, hauteur: number) {
        for (let j = y; j < y + hauteur; j++) for (let i = x; i < x + largeur; i++) poserCarreau(numeroSalle, i, j, 1)
    }
    export function construireMonde(graine: number) {
        numeroMine = Math.max(1, graine & 0x7fffffff); valeurHasard = numeroMine
        salles = []; choses = []; tableRoutesValide = false; numeroCaseChemin = -1; calculsChemin = 0
        for (let i = 0; i < 12; i++) salles.push(new DonneesSalle(SALLE_X[i],
            SALLE_Y[i], GENRES_SALLES[i], NOMS_SALLES[i]))
        relier(0,1); relier(1,2); relier(1,6); relier(2,3); relier(3,4); relier(4,5); relier(5,6)
        relier(3,7); relier(7,8); relier(8,9); relier(9,5); relier(8,10); relier(10,11); relier(11,9)
        if (hasard(2)) relier(4,8)
        for (let numeroSalle = 0; numeroSalle < 12; numeroSalle++) {
            for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++)
                poserCarreau(numeroSalle,x,y,x == 0 || y == 0 || x == 19 || y == 14 ? 1 : 0)
            if (salles[numeroSalle].portes[0] >= 0) {
                poserCarreau(numeroSalle,19,7,0)
                poserCarreau(numeroSalle,19,8,0)
            }
            if (salles[numeroSalle].portes[2] >= 0) { poserCarreau(numeroSalle,0,7,0); poserCarreau(numeroSalle,0,8,0) }
            if (salles[numeroSalle].portes[1] >= 0) {
                poserCarreau(numeroSalle,9,14,0)
                poserCarreau(numeroSalle,10,14,0)
            }
            if (salles[numeroSalle].portes[3] >= 0) {
                poserCarreau(numeroSalle,9,0,0)
                poserCarreau(numeroSalle,10,0,0)
            }
            if (numeroSalle != 0 && numeroSalle != 1) {
                // Un obstacle change de hauteur selon la variante ; la croix du centre et les lignes des objets
                // restent toujours libres.
                let variante = hasard(2)
                poserObstacle(numeroSalle,5,4,2,variante ? 3 : 2)
                poserObstacle(numeroSalle,13,9,2,2)
                if (GENRES_SALLES[numeroSalle] == GenreSalle.Depot) {
                    poserObstacle(numeroSalle,13,3,2,3)
                    poserObstacle(numeroSalle,5,10,2,2)
                }
                if (GENRES_SALLES[numeroSalle] == GenreSalle.Atelier)
                    for (let x = 11; x < 14; x++) poserCarreau(numeroSalle,x,5,2)
            }
            if (numeroSalle == 5 || numeroSalle == 6) for (let x = 3; x < 6; x++) for (let y = 8; y < 11; y++)
                if (!estMur(numeroSalle,x,y)) poserCarreau(numeroSalle,x,y,3)
        }
        choses.push(new Chose(0,76,52,GenreChose.Sortie))
        choses.push(new Chose(4,76,52,GenreChose.Generateur))
        choses.push(new Chose(1,76,60,GenreChose.Fusible))
        let candidats = [2,3,5,6,7,8,9,10]
        for (let i = candidats.length - 1; i > 0; i--) {
            let j = hasard(i+1); let echange=candidats[i]; candidats[i]=candidats[j]; candidats[j]=echange
        }
        for (let i = 0; i < 4; i++) choses.push(new Chose(candidats[i], i % 2 ? 124 : 28, 92, GenreChose.Fusible))
        for (let i = 0; i < 4; i++) choses.push(new Chose([7,9,2,5][i],124,28,GenreChose.Batterie))
        for (let i = 0; i < 4; i++) choses.push(new Chose([2,5,7,9][i],28,28,GenreChose.Casier))
        for(let origine=0;origine<12;origine++)for(let arrivee=0;arrivee<12;arrivee++)tableRoutes.setUint8(
            origine*12+arrivee,prochaineSalle(origine,arrivee,true))
        tableRoutesValide = true
    }
    export function estMondeValide(): boolean {
        if(salles.length!=12)return false
        distances.fill(0)
        let caseDepart=9+7*20,positionLecture=0,positionEcriture=1
        file.setNumber(NumberFormat.UInt16LE,0,caseDepart)
        distances.setNumber(NumberFormat.UInt16LE,caseDepart*2,1)
        while(positionLecture<positionEcriture) {
            let numeroCase=file.getNumber(NumberFormat.UInt16LE,positionLecture++*2)
            for(let direction=0;direction<4;direction++) {
                let caseVoisine=voisin(numeroCase,direction)
                if(caseVoisine>=0 && distances.getNumber(NumberFormat.UInt16LE,caseVoisine*2)==0) {
                    distances.setNumber(NumberFormat.UInt16LE,caseVoisine*2,1)
                    file.setNumber(NumberFormat.UInt16LE,positionEcriture++*2,caseVoisine)
                }
            }
        }
        for(let numeroSalle=0;numeroSalle<12;numeroSalle++)for(let numeroCarreau=0;numeroCarreau<300;numeroCarreau++) {
            if(salles[numeroSalle].carreaux.getUint8(numeroCarreau)!=1
                && distances.getNumber(NumberFormat.UInt16LE,(numeroSalle*300+numeroCarreau)*2)==0)
                return false
        }
        let sallesFusibles=control.createBuffer(12),fusibles=0,batteries=0
        for(let i=0;i<choses.length;i++) {
            let chose=choses[i]
            if(!peutRester(chose.salle,chose.x,chose.y))return false
            if(chose.genre==GenreChose.Fusible) {
                if(sallesFusibles.getUint8(chose.salle))return false
                sallesFusibles.setUint8(chose.salle,1)
                fusibles++
            }
            if(chose.genre==GenreChose.Batterie)batteries++
        }
        return fusibles==5 && batteries==4 && peutRester(11,116,60)
    }
    export function commencer(graine: number, entrainement: boolean) {
        construireMonde(graine)
        // Chaque monde construit est vérifié. S'il n'est pas valide, on en refait un avec une autre graine (49 essais
        // au plus), et en dernier recours avec 9137.
        let essais = 0
        while (!estMondeValide() && essais < 49) { essais++; construireMonde(graine + essais) }
        if (!estMondeValide()) construireMonde(9137)
        Nuit.oublierImages()
        salle = 0; persoX = 76; persoY = 76; regardX = 1; regardY = 0
        charge = 100; lampe = false; transportes = 0; installes = 0; casierCache = -1
        pauseSiffletMs = 0; effetSiffletMs = 0; foisRemarque = 0
        sifflets = 0; tempsMs = 0; symboleMessage = false; messageAttend = false
        contacts = 0; fusiblesRepris = 0; graceMs = 0; contentMs = 0; sac = []; alertesDonnees = 0
        brummi = new Robot(); texteMessage = ""; tempsMessageMs = 0; distanceBip = 999
        horlogeRadarMs = 0; horlogeBruitMs = 0; horlogeBruitInsertionMs = 0; bipRestantMs = 0; alerteMs = 0
        etape = 0; progres = 0; ageEtapeMs = 0; gagne = false; raisonFin = ""
        dernierBruitMs = 0; salleDernierBruit = -1; transitionMs = 0; dernieresTouches = 0
        numeroEffet = 0; prioriteEffet = 0; effetRestantMs = 0; choisi = -1; ambianceMs = 0
        if (entrainement) {
            // L'entraînement est séparé du jeu : son inventaire, sa batterie et le comportement de Brummi ne passent
            // jamais dans une vraie nuit. Le générateur et le casier se trouvent à y = 32, sous la ligne de leçon du
            // bandeau (qui finit à y = 23).
            choses = [new Chose(0,116,44,GenreChose.Fusible),new Chose(0,76,32,GenreChose.Generateur),
                new Chose(0,28,32,GenreChose.Casier)]
            salles[0].portes[0] = -1; poserCarreau(0,19,7,1); poserCarreau(0,19,8,1)
        }
        salles[0].visitee = true
        entrerEtat(entrainement ? Etat.Entrainement : Etat.Jeu)
        if(entrainement)demanderSon(21,2)
    }
    export function vueLibre(numeroSalle: number, departX: number,
        departY: number, arriveeX: number, arriveeY: number): boolean {
        let x = Math.floor(departX/8), y = Math.floor(departY/8),
            colonneCible = Math.floor(arriveeX/8), ligneCible = Math.floor(arriveeY/8)
        let dx = Math.abs(colonneCible-x), dy = -Math.abs(ligneCible-y),
            pasX = x<colonneCible ? 1 : -1, pasY = y<ligneCible ? 1 : -1
        let erreur = dx + dy
        for (let passage = 0; passage < 40; passage++) {
            if (x == colonneCible && y == ligneCible) return true
            if (estMur(numeroSalle,x,y)) return false
            let erreurDouble = 2*erreur
            if (erreurDouble >= dy) { erreur += dy; x += pasX }
            if (erreurDouble <= dx) { erreur += dx; y += pasY }
        }
        return false
    }
    export function dansFaisceau(departX: number, departY: number, dx: number, dy: number,
        pointX: number, pointY: number, rayon: number, cosinus: number): boolean {
        let ecartX = pointX-departX, ecartY=pointY-departY,
            ecart = Math.sqrt(ecartX*ecartX+ecartY*ecartY)
        return ecart <= rayon && (ecart < 1 || (ecartX*dx+ecartY*dy) / ecart >= cosinus)
    }
    export function estVisible(x: number, y: number): boolean {
        let proche = (x-persoX)*(x-persoX)+(y-persoY)*(y-persoY) <= 144
        if (casierCache >= 0)
            return Math.abs(y-persoY) < 8 && Math.abs(x-persoX)<64 && vueLibre(salle,persoX,persoY,x,y)
        return (proche || lampe && dansFaisceau(persoX,persoY,regardX,regardY,x,y,64,0.866))
            && vueLibre(salle,persoX,persoY,x,y)
    }
    export function voitPerso(): boolean {
        if (brummi.comportement == Comportement.Borne
            || brummi.comportement == Comportement.Ecouter || brummi.comportement == Comportement.Rapporter
            || graceMs > 0 || contentMs > 0 || casierCache >= 0
            || salle == 0 && etat != Etat.Entrainement || brummi.salle != salle) return false
        if (!vueLibre(salle,brummi.x,brummi.y,persoX,persoY)) return false
        let dx = persoX-brummi.x, dy = persoY-brummi.y
        if (dx*dx+dy*dy <= 144) return true
        return dansFaisceau(brummi.x,brummi.y,brummi.dx,brummi.dy,persoX,persoY,lampe ? 72 : 24,0.819)
    }
    function voisin(numeroCase: number, direction: number): number {
        let numeroSalle = Math.floor(numeroCase/300), numeroCarreau = numeroCase%300,
            x=numeroCarreau%20, y=Math.floor(numeroCarreau/20)
        let colonneVoisine=x+(direction==0 ? 1 : direction==2 ? -1 : 0),
            ligneVoisine=y+(direction==1 ? 1 : direction==3 ? -1 : 0)
        if (colonneVoisine<0 || colonneVoisine>=20 || ligneVoisine<0 || ligneVoisine>=15) {
            numeroSalle = salles[numeroSalle].portes[direction]
            if (numeroSalle<0) return -1
            colonneVoisine = colonneVoisine<0 ? 19 : colonneVoisine>=20 ? 0 : colonneVoisine
            ligneVoisine=ligneVoisine<0 ? 14 : ligneVoisine>=15 ? 0 : ligneVoisine
        }
        if (estMur(numeroSalle,colonneVoisine,ligneVoisine)) return -1
        return numeroSalle*300+ligneVoisine*20+colonneVoisine
    }
    // Calcul exact de la distance à pied, limité au rayon d'écoute (12 carreaux).
    export function cheminSonore(numeroSalle: number, x: number, y: number,
        autreSalle: number, autreX: number, autreY: number, limite: number): number {
        let caseDepart = numeroSalle*300+Math.floor(y/8)*20+Math.floor(x/8)
        let caseArrivee = autreSalle*300+Math.floor(autreY/8)*20+Math.floor(autreX/8)
        distances.fill(0)
        let positionLecture=0,positionEcriture=1; file.setNumber(NumberFormat.UInt16LE,0,caseDepart)
        distances.setNumber(NumberFormat.UInt16LE,caseDepart*2,1)
        while (positionLecture<positionEcriture) {
            let numeroCase=file.getNumber(NumberFormat.UInt16LE,positionLecture++*2),
                valeur=distances.getNumber(NumberFormat.UInt16LE,numeroCase*2)
            if (numeroCase==caseArrivee) return valeur-1
            if (valeur>limite) continue
            for (let direction=0;direction<4;direction++) {
                let suivante=voisin(numeroCase,direction)
                if (suivante>=0 && distances.getNumber(NumberFormat.UInt16LE,suivante*2)==0) {
                    distances.setNumber(NumberFormat.UInt16LE,suivante*2,valeur+1)
                    file.setNumber(NumberFormat.UInt16LE,positionEcriture++*2,suivante)
                }
            }
        }
        return 999
    }
    export function faireDuBruit(rayon: number, x: number, y: number, salleSource: number) {
        if (carreau(salleSource,Math.floor(x/8),Math.floor(y/8)) == 3) rayon /= 2
        dernierBruitMs=450; dernierBruitX=x; dernierBruitY=y; salleDernierBruit=salleSource
        if (brummi.comportement == Comportement.Borne
            || brummi.comportement == Comportement.Ecouter || brummi.comportement == Comportement.Rapporter
            || contentMs > 0 || etat == Etat.Entrainement) return
        if (cheminSonore(salleSource,x,y,brummi.salle,brummi.x,brummi.y,rayon) <= rayon) {
            brummi.attenteMs=0;brummi.salleCible=salleSource
            brummi.cibleX=x; brummi.cibleY=y; brummi.ageRouteMs=1000
            if (brummi.comportement != Comportement.Suivre) {
                brummi.comportement=Comportement.Curieux
                brummi.minuteurMs=0
            }
        }
    }
    export function prochaineSalle(depuis: number, vers: number, ascenseurPermis: boolean): number {
        if (depuis == vers || !ascenseurPermis && vers == 0) return depuis
        if (tableRoutesValide) return tableRoutes.getUint8(depuis*12+vers)
        let sallesAvant: number[] = []; sallesRoute = []
        for(let i=0;i<salles.length;i++) sallesAvant.push(-2)
        sallesAvant[depuis]=-1; sallesRoute.push(depuis)
        for (let positionLecture=0;positionLecture<sallesRoute.length;positionLecture++) {
            let numeroSalle=sallesRoute[positionLecture]
            for(let direction=0;direction<4;direction++) {
                let salleVoisine=salles[numeroSalle].portes[direction]
                if(salleVoisine<0 || !ascenseurPermis && salleVoisine==0 || sallesAvant[salleVoisine]!=-2) continue
                sallesAvant[salleVoisine]=numeroSalle; sallesRoute.push(salleVoisine)
            }
        }
        if(sallesAvant[vers]==-2) return depuis
        let suivante=vers
        while(sallesAvant[suivante]>=0 && sallesAvant[suivante]!=depuis) suivante=sallesAvant[suivante]
        return suivante
    }
    function commencerRonde() {
        brummi.comportement=Comportement.Ronde; brummi.minuteurMs=0; brummi.casierObserve=-1
        let destination=1+hasard(11)
        if(destination==brummi.salle) destination=destination%11+1
        brummi.salleCible=destination; brummi.cibleX=76; brummi.cibleY=76; brummi.ageRouteMs=1000
    }
    function suivre() {
        if(brummi.comportement!=Comportement.Suivre) { foisRemarque++; demanderSon(5,4) }
        brummi.comportement=Comportement.Suivre; brummi.horsDeVueMs=0; brummi.attenteMs=0
        brummi.salleCible=salle; brummi.cibleX=persoX; brummi.cibleY=persoY
    }
    // Brummi ne veut que des fusibles : si le personnage n'en porte aucun, il ne le suit pas.
    function veutFusible(): boolean { return transportes > 0 || SUIVI_A_VIDE > 0 }
    // Brummi a rejoint le personnage. Il prend le fusible ramassé en dernier et le rapporte à sa place ; les fusibles
    // déjà dans le générateur y restent. texte : le texte du message, ou "" pour le message par défaut.
    function ranger(texte: string) {
        contacts++; graceMs = GRACE_MS
        brummi.vuMs = 0; brummi.casierObserve = -1; brummi.horsDeVueMs = 0
        if (transportes > 0 && sac.length > 0) {
            let numero = sac.pop(); transportes--; fusiblesRepris++; enInsertion = false; insertionMs = 0
            brummi.comportement = Comportement.Rapporter; brummi.numeroFusible = numero; brummi.attenteMs = 600
            brummi.salleCible = choses[numero].salle; brummi.cibleX = choses[numero].x
            brummi.cibleY = choses[numero].y; brummi.ageRouteMs = 1000
            afficherMessage(texte == "" ? "BRUMMI PREND 1 FUSIBLE !" : texte); demanderSon(25, 4)
        } else toucherSansFusible()
    }
    // Contact sans fusible : il ne se passe rien, Brummi repart et reste content un moment.
    function toucherSansFusible() {
        commencerRonde(); contentMs = CONTENT_MS; brummi.attenteMs = 800
        afficherMessage("RIEN À RANGER."); demanderSon(26, 3)
    }
    // Brummi repose le fusible là où il l'avait trouvé, attend et commence une nouvelle ronde. Plus il a déjà reposé de
    // fusibles pendant la nuit, plus il reste content longtemps (un joueur lent ne perd pas toujours le même fusible).
    // Le message donne la salle où le fusible est revenu (image de fusible et nom de la salle), sauf si une alerte de
    // la lampe est affichée.
    function deposer() {
        if (brummi.numeroFusible >= 0) {
            let chose = choses[brummi.numeroFusible]
            chose.prise = false
            if (!(tempsMessageMs > 0 && messageAttend)) {
                afficherMessage(salles[chose.salle].nomSalle)
                symboleMessage = true
            }
        }
        brummi.numeroFusible = -1; commencerRonde(); brummi.attenteMs = 1500; demanderSon(28, 2)
        contentMs = Math.min(CONTENT_MAX_MS,
            CONTENT_MS + CONTENT_PLUS_MS * Math.max(0, fusiblesRepris - 1))
    }
    function calculerCheminBrummi(cibleX: number, cibleY: number) {
        let colonneDepart=Math.floor(brummi.x/8),ligneDepart=Math.floor(brummi.y/8),
            colonneBut=Math.floor(cibleX/8),ligneBut=Math.floor(cibleY/8)
        let numeroCaseCible=brummi.salle*300+ligneBut*20+colonneBut
        if(numeroCaseChemin!=numeroCaseCible) {
        numeroCaseChemin=numeroCaseCible;calculsChemin++;distancesChemin.fill(0)
        let positionLecture=0,positionEcriture=1,carreauBut=ligneBut*20+colonneBut
        fileChemin.setNumber(NumberFormat.UInt16LE,0,carreauBut)
        distancesChemin.setNumber(NumberFormat.UInt16LE,carreauBut*2,1)
        while(positionLecture<positionEcriture) {
            let numeroCarreau=fileChemin.getNumber(NumberFormat.UInt16LE,positionLecture++*2),
                x=numeroCarreau%20,y=Math.floor(numeroCarreau/20)
            let distanceCarreau=distancesChemin.getNumber(NumberFormat.UInt16LE,numeroCarreau*2)
            for(let direction=0;direction<4;direction++) {
                let colonneVoisine=x+(direction==0?1:direction==2?-1:0),
                    ligneVoisine=y+(direction==1?1:direction==3?-1:0),suivante=ligneVoisine*20+colonneVoisine
                if(!estMur(brummi.salle,colonneVoisine,ligneVoisine)
                    && distancesChemin.getNumber(NumberFormat.UInt16LE,suivante*2)==0) {
                    distancesChemin.setNumber(NumberFormat.UInt16LE,suivante*2,distanceCarreau+1)
                    fileChemin.setNumber(NumberFormat.UInt16LE,positionEcriture++*2,suivante)
                }
            }
        }
        }
        let meilleur=distancesChemin.getNumber(NumberFormat.UInt16LE,(ligneDepart*20+colonneDepart)*2)
        brummi.routeX=brummi.x; brummi.routeY=brummi.y
        if(colonneDepart==colonneBut && ligneDepart==ligneBut) { brummi.routeX=cibleX;brummi.routeY=cibleY;return }
        for(let direction=0;direction<4;direction++) {
            let colonneVoisine=colonneDepart+(direction==0?1:direction==2?-1:0),
                ligneVoisine=ligneDepart+(direction==1?1:direction==3?-1:0)
            if(estMur(brummi.salle,colonneVoisine,ligneVoisine)) continue
            let distanceVoisine=distancesChemin.getNumber(NumberFormat.UInt16LE,(ligneVoisine*20+colonneVoisine)*2)
            if(distanceVoisine>0 && (distanceVoisine<meilleur || meilleur==0)) {
                meilleur=distanceVoisine
                brummi.routeX=colonneVoisine*8+4
                brummi.routeY=ligneVoisine*8+4
            }
        }
    }
    function deplacerBrummi(dt: number) {
        if(brummi.attenteMs>0) {brummi.attenteMs-=dt;return}
        let cibleX=brummi.cibleX,cibleY=brummi.cibleY,suivante=brummi.salle,porte=-1
        if(brummi.salleCible!=brummi.salle) {
            suivante=prochaineSalle(brummi.salle,brummi.salleCible,false)
            if(suivante==brummi.salle) {
                if(brummi.comportement==Comportement.Rapporter)deposer()
                else commencerRonde()
                return
            }
            for(let direction=0;direction<4;direction++) if(salles[brummi.salle].portes[direction]==suivante)
                porte=direction
            cibleX=porte==0?156:porte==2?4:76;cibleY=porte==1?116:porte==3?4:60
        }
        brummi.ageRouteMs+=dt
        let numeroCase=Math.floor(cibleX/8)+Math.floor(cibleY/8)*20+brummi.salle*300
        if(brummi.ageRouteMs>=200 || Math.abs(brummi.x-brummi.routeX)+Math.abs(brummi.y-brummi.routeY)<1
            || brummi.numeroCaseCible!=numeroCase) {
            calculerCheminBrummi(cibleX,cibleY);brummi.ageRouteMs=0;brummi.numeroCaseCible=numeroCase
        }
        let dx=brummi.routeX-brummi.x,dy=brummi.routeY-brummi.y,ecart=Math.sqrt(dx*dx+dy*dy)
        let vitesse=brummi.comportement==Comportement.Suivre?VITESSE_SUIVI+installes*PLUS_SUIVI:
            brummi.comportement==Comportement.Rapporter?VITESSE_PORT
                :brummi.comportement==Comportement.Ronde?30:brummi.comportement==Comportement.Regarder?50:45
        if(ecart>0.1) {
            brummi.dx=dx/ecart;brummi.dy=dy/ecart
            let trajet=Math.min(ecart,vitesse*dt/1000)
            brummi.x+=brummi.dx*trajet;brummi.y+=brummi.dy*trajet
        }
        if(porte>=0 && Math.abs(brummi.x-cibleX)+Math.abs(brummi.y-cibleY)<2) {
            brummi.salle=suivante;brummi.x=porte==0?4:porte==2?156:76
            brummi.y=porte==1?4:porte==3?116:60;brummi.ageRouteMs=1000
        } else if(porte<0 && Math.abs(brummi.x-cibleX)+Math.abs(brummi.y-cibleY)<3) {
            if(brummi.comportement==Comportement.Ronde) {commencerRonde();brummi.attenteMs=installes>=2?1000:2000}
            else if(brummi.comportement==Comportement.Curieux) {
                brummi.minuteurMs+=dt
                if(brummi.minuteurMs>=3000)commencerRonde()
            }
            else if(brummi.comportement==Comportement.Rapporter) deposer()
        }
    }
    function actualiserBrummi(dt: number) {
        if(brummi.comportement==Comportement.Borne) {
            if(brummi.reveilRestantMs>0) {
                brummi.reveilRestantMs-=dt
                if(brummi.reveilRestantMs<=0)commencerRonde()
            }
            return
        }
        if(brummi.comportement==Comportement.Ecouter) {
            brummi.minuteurMs-=dt
            if(brummi.minuteurMs<=0) {
                brummi.comportement=Comportement.Curieux
                brummi.minuteurMs=0
                brummi.ageRouteMs=1000
            }
            return
        }
        // Brummi rapporte un fusible : il roule seulement et ne remarque rien.
        if(brummi.comportement==Comportement.Rapporter) {deplacerBrummi(dt);return}
        let voit=voitPerso(),veut=veutFusible()
        if(voit && veut) {
            brummi.vuMs+=dt
            let dx=persoX-brummi.x,dy=persoY-brummi.y
            if(brummi.vuMs>=600 || dx*dx+dy*dy<=144 || brummi.comportement==Comportement.Suivre)
                suivre()
        } else brummi.vuMs=0
        // Plus rien à ranger (par exemple parce que le dernier fusible est dans le générateur) : il arrête tout de
        // suite de suivre.
        if(!veut && (brummi.comportement==Comportement.Suivre || brummi.comportement==Comportement.Regarder))
            commencerRonde()
        // Cache-cache : Brummi a vu le personnage entrer dans le casier et le trouve là.
        if(brummi.casierObserve==casierCache && casierCache>=0 && brummi.salle==salle
            && Math.abs(brummi.x-persoX)+Math.abs(brummi.y-persoY)<10) {
            casierCache=-1;ranger("TROUVÉ ! BRUMMI RANGE.");return
        }
        if(brummi.comportement==Comportement.Suivre && !voit) {
            brummi.horsDeVueMs+=dt
            if(brummi.horsDeVueMs>=2000) {brummi.comportement=Comportement.Regarder;brummi.minuteurMs=REGARD_MS}
        }
        if(brummi.comportement==Comportement.Regarder) {
            brummi.minuteurMs-=dt
            if(brummi.minuteurMs<=0) commencerRonde()
            else if(brummi.salle==brummi.salleCible
                && Math.abs(brummi.x-brummi.cibleX)+Math.abs(brummi.y-brummi.cibleY)<5) {
                let x=Math.max(12,Math.min(148,brummi.cibleX+hasard(65)-32)),
                    y=Math.max(20,Math.min(100,brummi.cibleY+hasard(65)-32))
                if(peutRester(brummi.salle,x,y)) {brummi.cibleX=x;brummi.cibleY=y;brummi.ageRouteMs=1000}
            }
        }
        // Une tache de lumière ne fait que rendre Brummi curieux ; elle ne montre jamais d'où elle vient.
        if(lampe && contentMs<=0 && brummi.salle==salle && salle!=0
            && brummi.comportement==Comportement.Ronde && !voit) {
            for(let ecart=16;ecart<=64;ecart+=16) {
                let x=persoX+regardX*ecart,y=persoY+regardY*ecart
                if(!estMur(salle,Math.floor(x/8),Math.floor(y/8)) && estVisible(x,y)
                    && dansFaisceau(brummi.x,brummi.y,brummi.dx,brummi.dy,x,y,72,0.819)
                    && vueLibre(salle,brummi.x,brummi.y,x,y)) {
                    brummi.attenteMs=0;brummi.comportement=Comportement.Curieux;brummi.salleCible=salle
                    brummi.cibleX=x;brummi.cibleY=y;brummi.minuteurMs=0;break
                }
            }
        }
        deplacerBrummi(dt)
        if(graceMs<=0 && contentMs<=0 && casierCache<0 && brummi.salle==salle && salle!=0
            && Math.abs(brummi.x-persoX)<6 && Math.abs(brummi.y-persoY)<6) ranger("")
    }
    export function trouverChose(): number {
        if(casierCache>=0)return casierCache
        let meilleur=-1,meilleurEcart=100000
        for(let i=0;i<choses.length;i++) {
            let chose=choses[i]
            if(chose.salle!=salle || chose.prise)continue
            let dx=chose.x-persoX,dy=chose.y-persoY,ecartCarre=dx*dx+dy*dy
            // L'image du générateur fait 19 x 17 pixels (le corps 17 x 14). Pour se tenir devant son panneau, il ne
            // faut pas avoir à toucher le dessin ni à regarder son centre.
            let distanceMax=chose.genre==GenreChose.Generateur ? 18 : 11
            let enFace=chose.genre==GenreChose.Generateur || ecartCarre<=25 || dx*regardX+dy*regardY>=0
            if(ecartCarre<distanceMax*distanceMax && ecartCarre<meilleurEcart && enFace
                && vueLibre(salle,persoX,persoY,chose.x,chose.y)) {
                meilleurEcart=ecartCarre
                meilleur=i
            }
        }
        return meilleur
    }
    function utiliser() {
        if(casierCache>=0) {
            casierCache=-1;faireDuBruit(4,persoX,persoY,salle);demanderSon(3,2)
            if(etat==Etat.Entrainement && etape==5 && progres>0)passerEtapeSuivante()
            return
        }
        choisi=trouverChose()
        if(choisi<0)return
        // À partir de l'étape 07 de l'entraînement, A ne ramasse que la batterie de l'étape 12.
        if(etat==Etat.Entrainement && etape>=6 && !(etape==11 && choses[choisi].genre==GenreChose.Batterie))return
        let chose=choses[choisi]
        if(etat==Etat.Entrainement && (etape<3 || etape==3 && chose.genre!=GenreChose.Fusible
            || etape==4 && chose.genre!=GenreChose.Generateur || etape==5 && chose.genre!=GenreChose.Casier))return
        if(chose.genre==GenreChose.Fusible) {
            if(transportes>=3) {afficherMessage("SAC PLEIN  3/3");return}
            chose.prise=true;transportes++;sac.push(choisi);demanderSon(2,2)
            if(brummi.comportement==Comportement.Borne && brummi.reveilRestantMs==0) {
                brummi.reveilRestantMs=REVEIL_MS;afficherMessage("BIP ! BRUMMI SE RÉVEILLE.");demanderSon(7,3)
            }
            if(etat==Etat.Entrainement && etape==3)passerEtapeSuivante()
        } else if(chose.genre==GenreChose.Batterie) {
            if(charge>=100) {afficherMessage("BATTERIE PLEINE");return}
            charge=Math.min(100,charge+GAIN_BATTERIE);alertesDonnees=0
            chose.prise=true;demanderSon(2,2);afficherMessage("BATTERIE RÉCUPÉRÉE")
            if(etat==Etat.Entrainement && etape==11)passerEtapeSuivante()
        } else if(chose.genre==GenreChose.Casier) {
            let observe=voitPerso()
            casierCache=choisi;persoX=chose.x;persoY=chose.y;lampe=false
            // Le cache-cache ne marche qu'avec un fusible ; sans fusible, Brummi jette seulement un coup d'œil (« ? »)
            // et ne compte rien.
            if(observe && veutFusible()) {
                suivre()
                brummi.casierObserve=casierCache
                brummi.ageRouteMs=1000
            }
            else if(observe) {
                brummi.attenteMs=0;brummi.comportement=Comportement.Curieux;brummi.salleCible=salle
                brummi.cibleX=persoX;brummi.cibleY=persoY;brummi.minuteurMs=0;brummi.ageRouteMs=1000
            }
            faireDuBruit(4,persoX,persoY,salle);demanderSon(3,2)
            if(etat==Etat.Entrainement && etape==5)progres=1
        } else if(chose.genre==GenreChose.Generateur) {
            if(transportes<=0)afficherMessage("TROUVE LES FUSIBLES")
            else {enInsertion=true;insertionMs=0;horlogeBruitInsertionMs=500;if(!messageAttend)tempsMessageMs=0}
        } else afficherMessage(installes<5?"SANS COURANT. 5 FUSIBLES.":"ASCENSEUR PRÊT")
    }
    function passerEtapeSuivante() {
        etape++;ageEtapeMs=0;progres=0;demanderSon(2,2)
        if(etape>=6 && etape<=9) {
            // Préparer chaque démonstration sans danger une seule fois, à l'entrée de l'étape.
            persoX=92;persoY=76;regardX=1;regardY=0;casierCache=-1;lampe=true
            brummi.salle=0;brummi.x=124;brummi.y=76;brummi.dx=-1;brummi.dy=0
            brummi.comportement=Comportement.Ronde;brummi.vuMs=0;brummi.casierObserve=-1
            charge=100;pauseSiffletMs=0;bMaintenuMs=0;bDeclenche=false
            transportes=1 // fusible d'entraînement : Brummi veut des fusibles (l'entraînement ne le prend jamais)
        }
        if(etape==8)lampe=false
        if(etape==11) {
            // Leçon de la lampe : la batterie d'entraînement n'apparaît que maintenant, là où Brummi se tenait ; il se
            // range sur le côté.
            transportes=0;charge=CHARGE_ENTRAINEMENT;pauseSiffletMs=0
            choses.push(new Chose(0,124,76,GenreChose.Batterie))
            brummi.comportement=Comportement.Ronde;brummi.x=144;brummi.y=92;brummi.dx=-1;brummi.dy=0
        }
    }
    function siffler() {
        if(casierCache>=0) {afficherMessage("IMPOSSIBLE DANS LE CASIER");return}
        if(pauseSiffletMs>0) {afficherMessage("REPRENDS TON SOUFFLE !");return}
        // Brummi rapporte un fusible et n'entend rien : le sifflet ne servirait à rien, donc il ne coûte rien ; un
        // court son le dit.
        if(brummi.comportement==Comportement.Rapporter) {demanderSon(26,3);return}
        // Le sifflet ne coûte pas d'énergie, n'a pas besoin de viser et passe les coins.
        sifflets++;effetSiffletMs=300;pauseSiffletMs=PAUSE_SIFFLET_MS;enInsertion=false;insertionMs=0
        demanderSon(4,3)
        let ecartX=brummi.x-persoX,ecartY=brummi.y-persoY
        if(brummi.comportement==Comportement.Borne || brummi.salle!=salle
            || ecartX*ecartX+ecartY*ecartY>PORTEE_SIFFLET*PORTEE_SIFFLET)
            faireDuBruit(6,persoX,persoY,salle)
        else {
            brummi.comportement=Comportement.Ecouter
            brummi.minuteurMs=ARRET_SIFFLET_MS;brummi.casierObserve=-1
            brummi.salleCible=salle;brummi.cibleX=persoX
            brummi.cibleY=persoY;brummi.vuMs=0;demanderSon(8,4)
            if(etat==Etat.Entrainement && etape==9)passerEtapeSuivante()
        }
    }
    function peutRester(numeroSalle: number,x: number,y: number): boolean {
        return !estMur(numeroSalle,Math.floor((x-2)/8),Math.floor((y-2)/8))
            && !estMur(numeroSalle,Math.floor((x+2)/8),Math.floor((y-2)/8))
            && !estMur(numeroSalle,Math.floor((x-2)/8),Math.floor((y+2)/8))
            && !estMur(numeroSalle,Math.floor((x+2)/8),Math.floor((y+2)/8))
    }
    function deplacerPerso(dx: number,dy: number) {
        let nouveauX=persoX+dx,nouveauY=persoY+dy,direction=-1
        if(nouveauX<3 && salles[salle].portes[2]>=0 && persoY>=58 && persoY<=70)direction=2
        if(nouveauX>157 && salles[salle].portes[0]>=0 && persoY>=58 && persoY<=70)direction=0
        if(nouveauY<3 && salles[salle].portes[3]>=0 && persoX>=74 && persoX<=86)direction=3
        if(nouveauY>117 && salles[salle].portes[1]>=0 && persoX>=74 && persoX<=86)direction=1
        if(direction>=0) {
            let salleDestination=salles[salle].portes[direction], destinationX=direction==0?4:direction==2?156:persoX,
                destinationY=direction==1?4:direction==3?116:persoY
            salle=salleDestination;persoX=destinationX;persoY=destinationY
            salles[salle].visitee=true;transitionMs=600;horlogeRadarMs=200
            if(salle==0 && installes==5)finir(true,"")
            return
        }
        if(peutRester(salle,nouveauX,persoY))persoX=nouveauX
        if(peutRester(salle,persoX,nouveauY))persoY=nouveauY
    }
    export function finir(victoire: boolean,raison: string) {
        gagne=victoire;raisonFin=raison;entrerEtat(Etat.Bilan);demanderSon(victoire?9:6,5)
    }
    // Bouton menu : ouvre la pause et la referme. Depuis l'entraînement,
    // le curseur commence sur « PASSER L'EXERCICE » (un appui sur A suffit).
    export function basculerPause() {
        if(etat==Etat.Pause) {entrerEtat(etatPrecedent);return}
        if(etat==Etat.Jeu || etat==Etat.Entrainement) {
            etatPrecedent=etat;entrerEtat(Etat.Pause);if(etatPrecedent==Etat.Entrainement)menu=1
        }
    }
    export function actualiser(dt: number,touches: number) {
        dt=Math.min(50,Math.max(0,dt));ageMs+=dt;ecouleMs+=dt
        let appuyees=touches & ~dernieresTouches,relachees=dernieresTouches & ~touches;dernieresTouches=touches
        if(appuyees&16)aAppuyeMs=ecouleMs
        if(appuyees&32)bAppuyeMs=ecouleMs
        effetRestantMs-=dt;if(effetRestantMs<=0)prioriteEffet=0
        if(etat==Etat.Intro) {
            // A ou B : d'abord vers la carte, puis de la carte (après 1,5 s) vers le menu du titre.
            if(ageMs>=dureeIntroMs)entrerEtat(Etat.Titre)
            else if(ageMs>500 && (appuyees&48)!=0) {
                if(ageMs<DEBUT_CARTE_MS)ageMs=DEBUT_CARTE_MS
                else if(ageMs>=DEBUT_CARTE_MS+BLOCAGE_CARTE_MS)entrerEtat(Etat.Titre)
            }
            return
        }
        // Les menus ignorent les appuis pendant 500 ms après leur ouverture : si tu tapes très vite sur A, tu n'arrives
        // pas ailleurs par hasard.
        if((etat==Etat.Titre || etat==Etat.ChoixEntrainement) && ageMs<500)return
        if(etat==Etat.Titre) {
            if(appuyees&1 || appuyees&4) {menu=(menu+3)%4;demanderSon(1,1)}
            if(appuyees&2 || appuyees&8) {menu=(menu+1)%4;demanderSon(1,1)}
            if(appuyees&16) {
                if(menu==0)entrerEtat(Etat.ChoixEntrainement)
                if(menu==1)commencer(numeroMine,true)
                if(menu==2)reduit=!reduit
                if(menu==3)muet=!muet
            }
            return
        }
        if(etat==Etat.ChoixEntrainement) {
            if(appuyees&16)commencer(numeroMine,true)
            else if(appuyees&32)commencer(numeroMine,false)
            return
        }
        if(etat==Etat.Pause) {
            if(appuyees&1 || appuyees&4)menu=(menu+3)%4
            if(appuyees&2 || appuyees&8)menu=(menu+1)%4
            if(appuyees&16) {
                if(menu==0)entrerEtat(etatPrecedent)
                else if(menu==1) {if(etatPrecedent==Etat.Entrainement)commencer(numeroMine,false);else reduit=!reduit}
                else if(menu==2)muet=!muet
                else entrerEtat(Etat.Titre)
            }
            return
        }
        if(etat==Etat.Bilan) {
            if(ageMs>600 && appuyees&16)commencer(numeroMine,false)
            else if(ageMs>600 && appuyees&32)commencer((numeroMine+7919)%99999+1,false)
            return
        }
        // La pause A+B ne compte que si les deux touches sont pressées ensemble ; sinon B siffle et A court.
        let comboPause=(touches&48)==48 && Math.abs(aAppuyeMs-bAppuyeMs)<=PAUSE_COMBO_MS
        if(comboPause) {
            comboMs+=dt;enInsertion=false;insertionMs=0;bMaintenuMs=0;bDeclenche=true;aVerrouille=true
            if(comboMs>=900) {basculerPause();return}
        } else comboMs=0
        // Pendant l'entraînement, la lampe reste pleine : tu peux réessayer autant que tu veux. Seule la leçon de la
        // lampe (étape 12) montre une lampe faible.
        if(etat==Etat.Entrainement && etape<11)charge=100
        if(!(touches&16))aVerrouille=false
        tempsMs+=dt;effetSiffletMs=Math.max(0,effetSiffletMs-dt);pauseSiffletMs=Math.max(0,pauseSiffletMs-dt)
        graceMs=Math.max(0,graceMs-dt);contentMs=Math.max(0,contentMs-dt)
        // Pendant la pose d'un fusible, la ligne du bas montre la barre de progression ; une alerte de la lampe attend.
        if(!enInsertion || !messageAttend)tempsMessageMs=Math.max(0,tempsMessageMs-dt)
        dernierBruitMs=Math.max(0,dernierBruitMs-dt);transitionMs=Math.max(0,transitionMs-dt)
        let dx=(touches&2?1:0)-(touches&1?1:0),dy=(touches&8?1:0)-(touches&4?1:0)
        let enMouvement=dx!=0 || dy!=0, enCourse=enMouvement && (touches&16)!=0
        if(enMouvement && casierCache<0) {
            let longueur=Math.sqrt(dx*dx+dy*dy);regardX=dx/longueur;regardY=dy/longueur
            let trajet=(enCourse?92:45)*dt/1000
            let precedentX=persoX,precedentY=persoY,sallePrecedente=salle
            deplacerPerso(regardX*trajet,regardY*trajet)
            let aBouge=precedentX!=persoX || precedentY!=persoY || sallePrecedente!=salle
            horlogeBruitMs=aBouge?horlogeBruitMs+dt:0
            if(horlogeBruitMs>=400) {
                horlogeBruitMs=0
                faireDuBruit(carreau(salle,Math.floor(persoX/8),Math.floor(persoY/8))==2?8:enCourse?10:3,
                    persoX,persoY,salle)
                if(aBouge)demanderSon(enCourse?11:20,1)
            }
            if(etat==Etat.Entrainement && (etape==2 || etape==8) && enCourse && aBouge)progres+=dt
        }
        if((etat as number)==Etat.Bilan)return
        if(!comboPause && appuyees&16 && !enMouvement && !aVerrouille) {aVerrouille=true;utiliser()}
        if(enInsertion) {
            if(!(touches&16) || enMouvement || casierCache>=0) {enInsertion=false;insertionMs=0}
            else {
                insertionMs+=dt;horlogeBruitInsertionMs+=dt
                if(horlogeBruitInsertionMs>=500) {
                    horlogeBruitInsertionMs=0
                    faireDuBruit(12,persoX,persoY,salle)
                    demanderSon(3,1)
                }
                if(insertionMs>=3000) {
                    installes++;transportes--;sac.shift();insertionMs=0;enInsertion=false;demanderSon(12,3)
                    if(etat==Etat.Entrainement && etape==4)passerEtapeSuivante()
                    else if(installes==5) {
                        afficherMessage("BRAVO ! VA À L'ASCENSEUR !")
                        if(brummi.comportement!=Comportement.Suivre
                            && brummi.comportement!=Comportement.Ecouter) {
                            brummi.comportement=Comportement.Curieux;brummi.salleCible=4;brummi.cibleX=76
                            brummi.cibleY=52;brummi.minuteurMs=0;brummi.ageRouteMs=1000
                        }
                    }
                }
            }
        }
        if(!comboPause && touches&32) {bMaintenuMs+=dt;if(bMaintenuMs>=350 && !bDeclenche) {bDeclenche=true;siffler()}}
        if(relachees&32) {
            if(!bDeclenche && bMaintenuMs>0 && casierCache<0) {lampe=!lampe;demanderSon(1,1)}
            bMaintenuMs=0;bDeclenche=false
        }
        if(!(touches&32) && !(relachees&32)) {bMaintenuMs=0;bDeclenche=false}
        // La lampe est l'horloge de la nuit : lampe vide = nuit finie.
        // Quand les cinq fusibles sont dans le générateur, la lampe ne consomme plus rien : c'est le
        // générateur qui éclaire.
        if(etat==Etat.Jeu) {
            if(installes<5)charge=Math.max(0,charge-(lampe?CONSO_FAISCEAU:CONSO_REPOS)*dt/1000)
            if(charge<=ALERTE_LAMPE_1 && alertesDonnees<1) {
                alertesDonnees=1;afficherMessage("LA LAMPE FAIBLIT.");messageAttend=true;demanderSon(27,2)
            }
            if(charge<=ALERTE_LAMPE_2 && alertesDonnees<2) {
                alertesDonnees=2;afficherMessage("PRESQUE VIDE ! BATTERIE ?");messageAttend=true;demanderSon(27,3)
            }
            if(charge<=0) {lampe=false;finir(false,"LA LAMPE EST VIDE.");return}
        }
        choisi=trouverChose()
        if(etat==Etat.Entrainement) {
            ageEtapeMs+=dt
            if(brummi.comportement==Comportement.Ecouter) {
                brummi.minuteurMs=Math.max(0,brummi.minuteurMs-dt)
                if(brummi.minuteurMs==0)brummi.comportement=Comportement.Ronde
            }
            // Étape 07 : Brummi bipe depuis une distance fixe de 4 carreaux et l'antenne du tableau clignote.
            alerteMs=Math.max(0,alerteMs-dt)
            if(etape==6) {
                distanceBip=4;bipRestantMs-=dt
                if(bipRestantMs<=0) {
                    bipRestantMs=BIP_PROCHE_MS+2*BIP_PAR_CARREAU_MS
                    alerteMs=160
                    demanderSon(13,2)
                }
            }
            else distanceBip=999
            if(etape==0 && Math.abs(persoX-116)+Math.abs(persoY-76)<10)passerEtapeSuivante()
            else if(etape==1 && lampe)passerEtapeSuivante()
            else if(etape==2 && progres>=2000)passerEtapeSuivante()
            else if(etape==6 && ageEtapeMs>700 && appuyees&16)passerEtapeSuivante()
            else if(etape==7) {
                brummi.vuMs=lampe?Math.min(600,ageEtapeMs):0
                if(!lampe && ageEtapeMs>300)passerEtapeSuivante()
            } else if(etape==8) {
                if(dernierBruitMs>0)brummi.comportement=Comportement.Curieux
                if(progres>=1000)passerEtapeSuivante()
            } else if(etape==10) {
                if(persoX<48 && persoY>60 && persoY<90)passerEtapeSuivante()
            } else if(etape==12 && ageEtapeMs>700 && appuyees&16)commencer(numeroMine,false)
            return
        }
        actualiserBrummi(dt)
        horlogeRadarMs+=dt
        if(horlogeRadarMs>=200) {
            horlogeRadarMs=0
            distanceBip=brummi.comportement==Comportement.Borne?999
                :cheminSonore(salle,persoX,persoY,brummi.salle,brummi.x,brummi.y,12)
        }
        alerteMs=Math.max(0,alerteMs-dt);bipRestantMs-=dt
        if(distanceBip<=12 && bipRestantMs<=0) {
            bipRestantMs=BIP_PROCHE_MS+Math.max(0,distanceBip-2)*BIP_PAR_CARREAU_MS
            alerteMs=160;demanderSon(13,2)
        }
        ambianceMs+=dt
        if(ambianceMs>=14000) {ambianceMs=0;demanderSon(14,1)}
    }
}
