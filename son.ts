// Une musique amicale et une ambiance douce de mine ; chaque voix finit par s'éteindre.
// Instructions du mixeur Arcade : 1 = triangle, 3 = sinus, 18 = bruit (WaveShape.Noise, un bruit à cycle du
// synthétiseur ; le bruit blanc serait 5). Les amplitudes vont de 0 à 1023.
// Règle du son (pas de sursaut) : un pic au-dessus de 400 demande une attaque d'au moins 100 ms ; les percussions
// restent à 400 ou moins.
namespace NuitSon {
    let sons: Buffer[] = []
    let dureesMs: number[] = []
    let occupeJusquaMs = 0
    let priorite = 0
    let etatPrecedent = -1
    let agePrecedentMs = -1
    let estCoupe = false
    let numeroSonIntro = 0
    // Les coupes, les temps forts de l'histoire et la carte du studio partagent une seule ligne de temps (le temps du
    // film). Vent, loquet, cabine, étincelles, extinction douce, bip, bips montants, écran qui s'allume, houle du
    // studio, petite cloche, signature, titre.
    const momentsSonsMs = [700, 5300, 7200, 10800, 15500, 19000, 21300, 23400, 25600, 26950, 28500, 34600]
    const numerosSons = [15, 3, 16, 17, 19, 13, 30, 22, 23, 29, 24, 18]
    let numeroMusique = 0
    // Seule la prochaine partie de la musique reste en mémoire.
    let musique: Buffer[] = []
    let partiePrete = -1
    // 180 battements par minute : 36 croches par partie de six secondes. Le rythme des images, lui, ne change pas.
    const crocheMs = 1000 / 6
    // Cinq voix laissent trois canaux libres pour la signature du studio.
    const momentsMusiqueMs = [500,6500,12500,18500,24500,30500,36500,42500,48500,54500,60500]
    const dureesMusiqueMs = [6000,6000,6000,6000,6000,6000,6000,6000,6000,6000,3000]
    let ambiances: Buffer[] = []
    let bourdon: Buffer[] = []
    let prochaineAmbianceMs = 0
    let prochainBourdonMs = 0
    let numeroAmbiance = 0
    let pasEau: Buffer
    let pasMetal: Buffer
    let pasEauCourse: Buffer
    let pasMetalCourse: Buffer
    let accordGrave: Buffer
    let accordAigu: Buffer

    function ecrireSegment(tampon: Buffer, decalage: number, onde: number, dureeMs: number,
        deHz: number, versHz: number, deVolume: number, versVolume: number) {
        tampon.setUint8(decalage, onde)
        tampon.setNumber(NumberFormat.UInt16LE, decalage + 2, deHz)
        tampon.setNumber(NumberFormat.UInt16LE, decalage + 4, dureeMs)
        tampon.setNumber(NumberFormat.UInt16LE, decalage + 6, deVolume)
        tampon.setNumber(NumberFormat.UInt16LE, decalage + 8, versVolume)
        tampon.setNumber(NumberFormat.UInt16LE, decalage + 10, versHz)
    }
    function construireEnveloppe(onde: number, deHz: number, versHz: number,
        sommet: number, attaqueMs: number, dureeMs: number): Buffer {
        let donnees = control.createBuffer(36)
        let milieu = Math.round(deHz + (versHz - deHz) * attaqueMs / dureeMs)
        ecrireSegment(donnees, 0, onde, attaqueMs, deHz, milieu, 0, sommet)
        ecrireSegment(donnees, 12, onde, dureeMs - attaqueMs, milieu, versHz, sommet, 0)
        // Une dernière instruction à zéro termine le tampon. Ainsi, aucun son ne continue après sa fin prévue.
        return donnees
    }
    function ajouterSon(onde: number, deHz: number,
        versHz: number, sommet: number, attaqueMs: number, dureeMs: number) {
        sons.push(construireEnveloppe(onde, deHz, versHz, sommet, attaqueMs, dureeMs))
        dureesMs.push(dureeMs)
    }
    // Un court air sur un canal : des triplets (hauteur de départ, hauteur d'arrivée, durée), un sommet par note.
    // Une hauteur de départ à 0 est un silence. Chaque note monte depuis zéro et retombe à zéro.
    function ajouterMelodie(onde: number, notes: number[], sommets: number[], attaqueMs: number) {
        let nombre = notes.length / 3
        let donnees = control.createBuffer((nombre * 2 + 1) * 12)
        let totalMs = 0
        for (let i = 0; i < nombre; i++) {
            let deHz = notes[i * 3], versHz = notes[i * 3 + 1], noteMs = notes[i * 3 + 2], decalage = i * 24
            totalMs += noteMs
            if (deHz == 0) {
                ecrireSegment(donnees, decalage, onde, noteMs - 1, 1, 1, 0, 0)
                ecrireSegment(donnees, decalage + 12, onde, 1, 1, 1, 0, 0)
                continue
            }
            let milieu = Math.round(deHz + (versHz - deHz) * attaqueMs / noteMs)
            ecrireSegment(donnees, decalage, onde, attaqueMs, deHz, milieu, 0, sommets[i])
            ecrireSegment(donnees, decalage + 12, onde, noteMs - attaqueMs, milieu, versHz, sommets[i], 0)
        }
        sons.push(donnees)
        dureesMs.push(totalMs)
    }
    function ajouterAir(onde: number, notes: number[], sommet: number, attaqueMs: number) {
        let sommets: number[] = []
        for (let i = 0; i < notes.length / 3; i++) sommets.push(sommet)
        ajouterMelodie(onde, notes, sommets, attaqueMs)
    }
    // La signature du studio : trois accords de ré majeur qui montent, chacun dans une position différente
    // (ré fa# la, fa# la ré, la ré fa#). Chaque tampon est une voix qui passe d'un accord à l'autre en jouant une note
    // de chacun ; trois voix sonnent ensemble.
    function construireAccordStudio(debutHz: number,milieuHz: number,finHz: number,sommet: number): Buffer {
        let donnees=control.createBuffer(84)
        ecrireSegment(donnees,0,3,120,debutHz,debutHz,0,sommet)
        ecrireSegment(donnees,12,3,530,debutHz,debutHz,sommet,0)
        ecrireSegment(donnees,24,3,120,milieuHz,milieuHz,0,sommet)
        ecrireSegment(donnees,36,3,530,milieuHz,milieuHz,sommet,0)
        ecrireSegment(donnees,48,3,220,finHz,finHz,0,sommet)
        ecrireSegment(donnees,60,3,1580,finHz,finHz,sommet,0)
        return donnees
    }
    // Chaque événement porte sa propre durée : des notes tenues au-dessus de motifs légers et répétés.
    // Une petite dérive lente de la hauteur garde les sons longs vivants.
    // monteeMs rallonge l'attaque de la première note (la musique commence après un silence).
    function construireVoix(notes: number[], croches: number[], onde: number,
        volume: number, notesDetachees: boolean, monteeMs: number): Buffer {
        let donnees=control.createBuffer((notes.length*4+1)*12)
        let sommeCroches=0
        for(let i=0;i<notes.length;i++) {
            // On arrondit des limites cumulées, pas des notes isolées : le tempo ne dérive pas.
            let fin=Math.round((sommeCroches+croches[i])*crocheMs)
            let hz=Math.max(1,notes[i]), dureeMs=fin-Math.round(sommeCroches*crocheMs), decalage=i*48
            sommeCroches+=croches[i]
            let sommet=notes[i]==0 ? 0 : Math.floor(volume*(i%3==0 ? 1 : 0.84))
            let attaqueMs=notesDetachees ? 12 : 32
            let chuteMs=notesDetachees ? 62 : Math.min(120,Math.floor(dureeMs/3))
            let silenceMs=notesDetachees ? 28 : 24
            if(i==0 && monteeMs>attaqueMs) attaqueMs=Math.min(monteeMs,dureeMs-chuteMs-silenceMs-1)
            let tenueMs=dureeMs-attaqueMs-chuteMs-silenceMs
            ecrireSegment(donnees,decalage,onde,attaqueMs,hz,hz,0,sommet)
            ecrireSegment(donnees,decalage+12,onde,tenueMs,hz,hz+1,sommet,Math.floor(sommet*0.72))
            ecrireSegment(donnees,decalage+24,onde,chuteMs,hz+1,hz,Math.floor(sommet*0.72),0)
            ecrireSegment(donnees,decalage+36,onde,silenceMs,hz,hz,0,0)
        }
        return donnees
    }
    function construirePercussion(partie: number, nombreCroches: number): Buffer {
        let donnees=control.createBuffer((nombreCroches*3+1)*12)
        for(let i=0;i<nombreCroches;i++) {
            // Une grosse caisse légère, un contretemps doux et des tics discrets ; pas de roulement avant les coupes.
            // La partie 5 ne fait que des tics.
            let seulementTics=partie==5
            // Dans la partie 0, les quatre premières croches n'ont pas de grosse caisse : la musique entre en fondu.
            let grosseCaisse=!seulementTics && !(partie==0 && i<4) && (i%8==0 || i%8==3 || i%8==6)
            let caisseClaire=!seulementTics && (i%8==2 || i%8==7)
            let volume=grosseCaisse ? 378 : caisseClaire ? 189 : seulementTics ? 45 : 59
            if(partie==0) volume=Math.floor(volume*(i%2!=0 ? 0.4 : 0.6))
            if(partie==4) volume=Math.floor(volume*0.75)
            if(partie==7 || partie==8) volume=Math.floor(volume*0.65)
            let onde=grosseCaisse ? 3 : 18, hz=grosseCaisse ? 160 : caisseClaire ? 900 : 1800
            let finHz=grosseCaisse ? 48 : 200, decalage=i*36
            ecrireSegment(donnees,decalage,onde,8,hz,hz,0,volume)
            let decroissanceMs=grosseCaisse ? 118 : caisseClaire ? 88 : 42
            let dureeMs=Math.round((i+1)*crocheMs)-Math.round(i*crocheMs)
            ecrireSegment(donnees,decalage+12,onde,decroissanceMs,hz,finHz,volume,0)
            ecrireSegment(donnees,decalage+24,onde,dureeMs-8-decroissanceMs,finHz,finHz,0,0)
        }
        return donnees
    }
    // Construit les cinq voix d'UNE partie dans musique (environ 5 Ko). Toute la musique d'un coup prenait 55 Ko,
    // plus que ce que le Calliope mini 3 a de libre à côté de l'écran et de la mine (l'écran restait alors noir).
    function composer(partie: number) {
        musique=[]
        partiePrete=partie
        // Tonalité de ré majeur. Fondamentales des accords, partie par partie : ré ré sol la ré si sol la ré la ré.
        const fondamentales=[147,147,196,220,147,247,196,220,147,220,147]
        const tierces=[185,185,247,277,185,294,247,277,185,277,185]
        const quintes=[220,220,294,330,220,370,294,330,220,330,220]
        if(partie>=0 && partie<momentsMusiqueMs.length) {
            let fondamentale=fondamentales[partie], tierce=tierces[partie], quinte=quintes[partie]
            let nombreCroches=Math.round(dureesMusiqueMs[partie]/crocheMs)
            let basse: number[]=[], dureesBasse: number[]=[], arpege: number[]=[], tics: number[]=[]
            for(let i=0;i<nombreCroches;i++) {
                // Arpège sur la fondamentale, la tierce et la quinte (pour ré, c'est le motif de Brummi).
                arpege.push(partie==0 && i%2!=0 ? 0 : [fondamentale*2,tierce*2,quinte*2,tierce*2][i%4])
                tics.push(1)
            }
            // Une basse sautillante sur la fondamentale et la quinte garde la pulsation légère.
            for(let i=0;i<nombreCroches/6;i++) {
                basse.push(fondamentale); basse.push(fondamentale); basse.push(quinte); basse.push(fondamentale)
                dureesBasse.push(2); dureesBasse.push(1); dureesBasse.push(1); dureesBasse.push(2)
            }
            // De petits arcs vers le haut et vers le bas ; la partie 5 reprend le motif de Brummi : ré, fa#, la, fa#.
            let voixSolo=[294,370,440,370,494,440,370,330]
            let dureesNotes=[3,1,2,3,1,2,3,3]
            if(partie==0) { voixSolo=[294,0,370,0,440,0]; dureesNotes=[3,3,3,3,3,3] }
            if(partie==2) voixSolo=[494,587,494,440,370,440,494,440]
            if(partie==3) voixSolo=[440,494,440,330,370,330,440,494]
            if(partie==4) { voixSolo=[370,330,294,0,330,294]; dureesNotes=[3,3,3,3,3,3] }
            if(partie==5) { voixSolo=[294,370,440,370,294,370,440,370]; dureesNotes=[2,2,2,3,2,2,2,3] }
            if(partie==6) voixSolo=[494,587,659,587,494,440,494,587]
            if(partie==7) voixSolo=[440,494,659,494,440,370,330,440]
            if(partie==8) voixSolo=[587,494,440,370,440,494,587,440]
            if(partie==9) voixSolo=[659,587,494,440,494,587,659,740]
            if(partie==10) { voixSolo=[370,440,587]; dureesNotes=[2,2,14] }
            if(partie!=10) {
                let nombre=voixSolo.length
                for(let i=0;i<nombre;i++) { voixSolo.push(voixSolo[i]); dureesNotes.push(dureesNotes[i]) }
            }
            let partieStudio=partie==7 || partie==8, premier=partie==0,
                partieBrummi=partie==5, monteeMs=premier ? 400 : 0
            musique.push(construireVoix(basse,dureesBasse,3,
                premier ? 200 : partieStudio ? 290 : 380,true,monteeMs))
            musique.push(construireVoix([tierce,quinte,tierce],
                [nombreCroches/3,nombreCroches/3,nombreCroches/3],1,
                partieBrummi ? 0 : premier ? 200 : partieStudio ? 180 : 260,false,monteeMs))
            musique.push(construireVoix(voixSolo,dureesNotes,1,
                premier ? 240 : partieStudio ? 300 : partie>=9 ? 400 : 360,false,monteeMs))
            musique.push(construireVoix(arpege,tics,1,
                partieBrummi ? 0 : premier ? 110 : partieStudio ? 140 : 210,true,monteeMs))
            musique.push(construirePercussion(partie,nombreCroches))
        }
    }
    // Une phrase de notes sinus égales (0 = silence) : le bourdonnement de Brummi (son motif ré, fa#, la, fa#) et les
    // gouttes de l'ambiance de la mine. Les silences sont des segments explicites de volume zéro ; aucun minuteur ni
    // aucune note en attente ne survit à un saut.
    function construireMotif(notes: number[], dureeMs: number, volume: number): Buffer {
        let donnees = control.createBuffer((notes.length * 3 + 1) * 12)
        let dureeNoteMs = Math.floor(dureeMs / notes.length)
        for (let i = 0; i < notes.length; i++) {
            let decalage = i * 36, note = notes[i]
            let sommet = note == 0 ? 0 : volume
            ecrireSegment(donnees, decalage, 3, 110, Math.max(1,note), Math.max(1,note), 0, sommet)
            ecrireSegment(donnees, decalage + 12, 3, dureeNoteMs - 210,
                Math.max(1,note), Math.max(1,note), sommet, 0)
            ecrireSegment(donnees, decalage + 24, 3, 100, 1, 1, 0, 0)
        }
        return donnees
    }
    function jouerAmbiance(instantMs: number) {
        // L'entraînement garde ses sons d'action clairs et isolés, sans ambiance. Dans l'ascenseur : silence calme.
        if (Nuit.etat != Nuit.Etat.Jeu || Nuit.salle == 0 || Nuit.casierCache >= 0) return
        if (instantMs < occupeJusquaMs && priorite >= 2) return
        if (instantMs >= prochaineAmbianceMs) {
            let genreSalle = Nuit.salles[Nuit.salle].genre
            let numero = (genreSalle + numeroAmbiance++) % ambiances.length
            music.playInstructions(0, ambiances[numero])
            prochaineAmbianceMs = instantMs + 7200 + (genreSalle % 3) * 900
        }
        // Brummi fredonne son motif quand il est près ; plus vite quand il suit le personnage.
        if (Nuit.distanceBip <= 12 && Nuit.brummi.comportement != Nuit.Comportement.Borne
            && instantMs >= prochainBourdonMs) {
            let empresse = Nuit.brummi.comportement == Nuit.Comportement.Suivre
            music.playInstructions(0, bourdon[empresse ? 1 : 0])
            prochainBourdonMs = instantMs + (empresse ? 2100 : 4200)
        }
    }
    export function preparer() {
        sons = []; dureesMs = []
        ajouterSon(18, 90, 60, 0, 8, 24)           // 0 : inutilisé
        ajouterSon(18, 700, 240, 260, 15, 100)     // 1 : interrupteur doux
        ajouterAir(1, [988,988,60, 1319,1319,90], 240, 8) // 2 : ramassage, un « ploc » clair
        ajouterSon(18, 600, 160, 280, 20, 190)     // 3 : loquet / travail du générateur
        ajouterAir(3, [1400,1900,180, 1700,1700,120], 300, 20) // 4 : sifflet, deux sons, sans bruit
        // 5 : Brummi se met à suivre (trois sons qui montent)
        ajouterAir(1, [587,587,80, 740,740,80, 880,880,140], 260, 10)
        ajouterAir(1, [392,392,240, 330,330,240, 262,262,420], 300, 50) // 6 : fin de la nuit, doux et descendant
        ajouterAir(1, [880,880,70, 0,0,60, 1175,1175,90], 220, 8) // 7 : Brummi se réveille (bip bip)
        // 8 : un sifflet qui atteint Brummi : les deux mêmes sons que le 4, puis son trille
        // (regles.ts envoie 8 à la place de 4 dans la même image, pour que le sifflet reste audible).
        ajouterMelodie(3, [1400,1900,180, 1700,1700,120, 0,0,80,
            1175,1175,50, 1319,1319,50, 1175,1175,50, 1319,1319,50, 1175,1175,50, 1480,1480,90],
            [300,300,0,200,200,200,200,200,200], 20)
        // 9 : nuit réussie, ré majeur qui monte
        ajouterAir(1, [587,587,130, 740,740,130, 880,880,130, 1175,1175,700], 300, 15)
        // 10 : libre (jamais envoyé ; le numéro reste pour que les autres gardent le leur)
        sons.push(sons[0]); dureesMs.push(0)
        ajouterSon(18, 360, 100, 150, 12, 100)     // 11 : pas étouffé
        ajouterSon(18, 800, 180, 340, 20, 220)     // 12 : le fusible se met en place avec un clic
        ajouterSon(1, 880, 1175, 170, 10, 90)      // 13 : bip (Brummi est près)
        ajouterAir(3, [1320,880,70, 0,0,120, 990,660,70], 110, 6) // 14 : gouttes d'eau
        ajouterSon(18, 320, 180, 110, 350, 1500)   // 15 : vent dehors
        ajouterSon(18, 240, 120, 160, 250, 1400)   // 16 : mouvement de la cabine
        ajouterSon(18, 440, 110, 200, 20, 260)     // 17 : étincelles éparses
        ajouterSon(1, 294, 440, 260, 500, 1600)    // 18 : houle du titre, puis silence
        ajouterSon(1, 523, 262, 200, 80, 650)      // 19 : extinction douce dans l'intro
        ajouterSon(18, 300, 120, 95, 12, 90)       // 20 : marche, plus douce que la course
        ajouterAir(1, [659,659,90, 880,880,130], 240, 10) // 21 : entraînement prêt
        ajouterSon(3, 523, 1047, 300, 140, 520)    // 22 : l'écran s'allume, doucement
        ajouterSon(1, 294, 587, 240, 600, 1050)    // 23 : houle du studio
        sons.push(construireAccordStudio(294,370,440,480));dureesMs.push(3100) // 24 : signature
        ajouterAir(1, [880,880,80, 1175,1175,80, 880,880,160], 260, 10) // 25 : Brummi prend un fusible
        ajouterAir(1, [784,659,140], 160, 10)      // 26 : Brummi ne trouve rien
        ajouterAir(1, [784,784,90, 0,0,70, 784,784,110], 220, 10) // 27 : la lampe faiblit (double son)
        ajouterAir(1, [1175,1175,80, 880,880,140], 200, 10) // 28 : Brummi repose le fusible
        ajouterAir(3, [1760,1760,450, 2637,2637,650], 220, 5) // 29 : petite cloche (intro)
        // 30 : bips qui montent (intro)
        ajouterAir(1, [880,880,80, 0,0,60, 1175,1175,80, 0,0,60, 1480,1480,140], 200, 8)
        accordGrave=construireAccordStudio(370,440,587,400)
        accordAigu=construireAccordStudio(440,587,740,340)
        occupeJusquaMs = 0; priorite = 0; etatPrecedent = -1; agePrecedentMs = -1
        numeroSonIntro = 0; numeroMusique = 0; estCoupe = false; musique=[]; partiePrete=-1
        prochaineAmbianceMs=0; prochainBourdonMs=0; numeroAmbiance=0
        // Un bourdonnement doux, des gouttes aiguës, un air léger, un deuxième motif de gouttes ; rien sous 100 Hz.
        ambiances = [construireEnveloppe(3,220,220,80,900,2600),
            construireMotif([1175,0,880,0],2400,100),
            construireEnveloppe(18,420,260,90,1000,3000),
            construireMotif([988,0,0,740],2800,90)]
        bourdon = [construireMotif([587,740,880,740],1600,120),
            construireMotif([587,740,880,740],1200,150)]
        pasEau=construireEnveloppe(18,820,170,130,18,160)
        pasMetal=construireEnveloppe(18,1200,220,155,12,130)
        pasEauCourse=construireEnveloppe(18,980,140,190,18,190)
        pasMetalCourse=construireEnveloppe(18,1400,180,220,12,160)
        // La musique est construite partie par partie pendant l'intro.
    }

    function arreter() {
        music.stopAllSounds()
        occupeJusquaMs = 0; priorite = 0
    }
    function jouer(numero: number, nouvellePriorite: number, instantMs: number) {
        if (numero <= 0 || numero >= sons.length) return
        // Les sons de premier plan interrompent tout de suite les effets moins importants ; on ne les met
        // jamais en file.
        if (instantMs < occupeJusquaMs && nouvellePriorite <= priorite) return
        if (instantMs < occupeJusquaMs) arreter()
        let tampon=sons[numero]
        if ((numero==11 || numero==20) && Nuit.salles.length>0) {
            let sol=Nuit.carreau(Nuit.salle,Math.floor(Nuit.persoX/8),Math.floor(Nuit.persoY/8))
            if(sol==3) tampon=numero==11 ? pasEauCourse : pasEau
            if(sol==2) tampon=numero==11 ? pasMetalCourse : pasMetal
        }
        music.playInstructions(0, tampon)
        if(numero==24) {
            music.playInstructions(0,accordGrave)
            music.playInstructions(0,accordAigu)
        }
        occupeJusquaMs = instantMs + ((numero==11 || numero==20) ? 190 : dureesMs[numero]); priorite = nouvellePriorite
    }
    export function actualiser(instantMs: number) {
        let dernierAgeMs = agePrecedentMs
        let etatAChange = etatPrecedent != Nuit.etat || Nuit.ageMs < dernierAgeMs
        etatPrecedent = Nuit.etat; agePrecedentMs = Nuit.ageMs
        if (etatAChange) {
            arreter()
            numeroSonIntro = 0
            numeroMusique = 0
            musique = []; partiePrete = -1
            prochaineAmbianceMs=instantMs+1200
            prochainBourdonMs=instantMs+600
        }
        // Un saut dans l'intro (vers la carte) coupe une fois la musique en cours ; la carte joue ensuite
        // ses propres repères.
        else if (Nuit.etat == Nuit.Etat.Intro && Nuit.ageMs - dernierAgeMs > 1000) arreter()
        if (Nuit.muet || Nuit.etat == Nuit.Etat.Pause) {
            if (!estCoupe) arreter()
            estCoupe = true; Nuit.numeroEffet = 0
            return
        }
        if (estCoupe) { estCoupe = false; Nuit.numeroEffet = 0 }
        if (Nuit.etat == Nuit.Etat.Intro) {
            Nuit.numeroEffet = 0
            while(numeroMusique<momentsMusiqueMs.length && Nuit.ageMs>=momentsMusiqueMs[numeroMusique]) {
                let numeroRepere=numeroMusique++
                if(Nuit.ageMs-momentsMusiqueMs[numeroRepere]<150) {
                    if(partiePrete!=numeroRepere) composer(numeroRepere)
                    // Le mixeur garde chaque tampon pendant qu'il joue ; musique peut déjà passer à la partie suivante.
                    for(let voix=0;voix<5;voix++) music.playInstructions(0,musique[voix])
                    musique=[]; partiePrete=-1
                }
            }
            // Préparer la partie suivante juste après le départ de la précédente, quelques secondes avant son heure ;
            // son départ lance alors seulement le son.
            if(numeroMusique<momentsMusiqueMs.length && partiePrete!=numeroMusique) composer(numeroMusique)
            // Si le temps saute, on jette les anciens repères au lieu de les rejouer d'un coup.
            while (numeroSonIntro < momentsSonsMs.length
                && Nuit.ageMs >= Nuit.tempsReelIntroMs(momentsSonsMs[numeroSonIntro])) {
                let numeroRepere = numeroSonIntro++
                if (Nuit.ageMs - Nuit.tempsReelIntroMs(momentsSonsMs[numeroRepere]) < 150)
                    jouer(numerosSons[numeroRepere], 1, instantMs)
            }
            return
        }
        if (Nuit.numeroEffet > 0) {
            let numeroSon = Nuit.numeroEffet, nouvellePriorite = Nuit.prioriteEffet
            Nuit.numeroEffet = 0
            jouer(numeroSon, nouvellePriorite, instantMs)
        }
        jouerAmbiance(instantMs)
    }
}
