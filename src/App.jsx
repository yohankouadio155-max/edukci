import { useState, useEffect, useRef } from "react";

const C = {
  green: "#1B6B3A", greenLight: "#2E9B57", greenPale: "#EAF4EE",
  gold: "#D4A017", night: "#0D1B12", ivory: "#FAF6EE",
  coral: "#E8634A", chalk: "#F0EDE6", purple: "#7B3FA0", orange: "#C45E0A",
};
const F = { display: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif" };

const DB = {
  getUsers: () => { try { return JSON.parse(localStorage.getItem("edukci_users") || "[]"); } catch { return []; } },
  saveUsers: (u) => localStorage.setItem("edukci_users", JSON.stringify(u)),
  getSession: () => { try { return JSON.parse(localStorage.getItem("edukci_session") || "null"); } catch { return null; } },
  saveSession: (s) => localStorage.setItem("edukci_session", JSON.stringify(s)),
  clearSession: () => localStorage.removeItem("edukci_session"),
  getProgress: (uid) => { try { return JSON.parse(localStorage.getItem("edukci_progress_" + uid) || "{}"); } catch { return {}; } },
  saveProgress: (uid, p) => localStorage.setItem("edukci_progress_" + uid, JSON.stringify(p)),
};

const MODULES = {
  orthographe: {
    icon: "\u270D\uFE0F", label: "Orthographe", color: C.green,
    lessons: [
      {
        id: "o1", title: "Le genre des noms",
        theory: [
          { type: "rule", text: "En fran\u00E7ais, chaque nom est masculin ou f\u00E9minin. On forme g\u00E9n\u00E9ralement le f\u00E9minin en ajoutant un << e >> au masculin." },
          { type: "example", text: "un ami -> une amie | un \u00E9tudiant -> une \u00E9tudiante" },
          { type: "title", text: "F\u00E9minins irr\u00E9guliers courants" },
          { type: "example", text: "-eur -> -euse : un chanteur -> une chanteuse" },
          { type: "example", text: "-er -> -\u00E8re : un boulanger -> une boulang\u00E8re" },
          { type: "example", text: "-f -> -ve : un veuf -> une veuve" },
          { type: "example", text: "-x -> -se : un \u00E9poux -> une \u00E9pouse" },
          { type: "example", text: "-teur -> -trice : un acteur -> une actrice" },
          { type: "title", text: "Noms \u00E9pic\u00E8nes (m\u00EAme forme)" },
          { type: "example", text: "un/une \u00E9l\u00E8ve | un/une enfant | un/une ministre" },
          { type: "tip", text: "Les mots en -tion, -sion, -aison, -eur (abstraits) sont f\u00E9minins : la situation, la maison, la chaleur." },
        ],
        quiz: [
          { q: "Quel est le f\u00E9minin de << acteur >> ?", choices: ["acteure", "acteuse", "actrice", "acteure"], answer: 2, explanation: "Les noms en -teur font -trice au f\u00E9minin : acteur -> actrice." },
          { q: "Quel est le f\u00E9minin de << \u00E9poux >> ?", choices: ["\u00E9pouse", "\u00E9peuse", "\u00E9poux", "\u00E9pouxe"], answer: 0, explanation: "Les noms en -x font -se au f\u00E9minin : \u00E9poux -> \u00E9pouse." },
          { q: "Lequel de ces noms est f\u00E9minin ?", choices: ["le probl\u00E8me", "le syst\u00E8me", "la chaleur", "le bonheur"], answer: 2, explanation: "Les noms abstraits en -eur comme la chaleur, la peur, la douleur sont f\u00E9minins." },
        ],
      },
      {
        id: "o2", title: "Le pluriel des noms",
        theory: [
          { type: "rule", text: "En r\u00E8gle g\u00E9n\u00E9rale, on ajoute un << s >> au singulier pour former le pluriel." },
          { type: "example", text: "un caramel -> des caramels | un album -> des albums" },
          { type: "title", text: "Cas particuliers" },
          { type: "example", text: "Noms en -s, -x, -z : invariables -> un bras / des bras" },
          { type: "example", text: "Noms en -eau -> -eaux : un g\u00E2teau / des g\u00E2teaux" },
          { type: "example", text: "Noms en -al -> -aux : un cheval / des chevaux" },
          { type: "example", text: "Exceptions en -al -> -als : des bals, des carnavals, des festivals" },
          { type: "title", text: "Les 7 noms en -ou -> -oux" },
          { type: "example", text: "bijoux, cailloux, choux, genoux, hiboux, joujoux, poux" },
          { type: "tip", text: "Tous les autres noms en -ou prennent -ous : des clous, des trous, des sous." },
        ],
        quiz: [
          { q: "Quel est le pluriel correct de << cheval >> ?", choices: ["chevals", "chevaux", "chevales", "cheval"], answer: 1, explanation: "Les noms en -al font leur pluriel en -aux : cheval -> chevaux." },
          { q: "Lequel de ces pluriels est CORRECT ?", choices: ["des festivaux", "des bals", "des animauxs", "des travails"], answer: 1, explanation: "<< Bal >> est une exception : des bals. Festival -> festivals, animal -> animaux, travail -> travaux." },
          { q: "Quel est le pluriel de << bijou >> ?", choices: ["bijous", "bijoux", "bijouxs", "bijou"], answer: 1, explanation: "Bijou fait partie des 7 noms en -ou qui prennent -x au pluriel : bijoux." },
        ],
      },
      {
        id: "o3", title: "L'accord de l'adjectif de couleur",
        theory: [
          { type: "rule", text: "Les adjectifs de couleur simples s'accordent en genre et en nombre." },
          { type: "example", text: "des robes bleues | des pantalons noirs | une veste blanche" },
          { type: "title", text: "Adjectifs d\u00E9riv\u00E9s d'un nom -> INVARIABLES" },
          { type: "example", text: "des chaussures marron | des yeux noisette | des robes orange" },
          { type: "example", text: "Exception : rose, mauve, \u00E9carlate s'accordent -> des joues roses" },
          { type: "title", text: "Adjectifs compos\u00E9s -> INVARIABLES" },
          { type: "example", text: "des ceintures bleu fonc\u00E9 | des pulls vert clair | des yeux bleu-vert" },
          { type: "tip", text: "Astuce : si la couleur vient d'un fruit ou d'un objet (orange, marron, cr\u00E8me), elle est invariable." },
        ],
        quiz: [
          { q: "Quelle phrase est correctement \u00E9crite ?", choices: ["des robes oranges", "des robes orange", "des robe orange", "des robes oranger"], answer: 1, explanation: "Orange est un nom de fruit utilis\u00E9 comme adjectif de couleur : il est invariable." },
          { q: "Choisissez la forme correcte pour << des ceintures >> (bleu + fonc\u00E9) :", choices: ["bleues fonc\u00E9es", "bleu fonc\u00E9es", "bleu fonc\u00E9", "bleue fonc\u00E9"], answer: 2, explanation: "Un adjectif de couleur compos\u00E9 est toujours invariable : bleu fonc\u00E9." },
          { q: "Laquelle est correcte ?", choices: ["ses yeux marrons", "ses yeux marron", "son oeil marrons", "ses yeux marroner"], answer: 1, explanation: "Marron est un nom de fruit employ\u00E9 comme adjectif de couleur : invariable -> ses yeux marron." },
        ],
      },
      {
        id: "o4", title: "Les homophones a/\u00E0, et/est, son/sont",
        theory: [
          { type: "title", text: "a / \u00E0" },
          { type: "rule", text: "<< a >> = verbe avoir (rempla\u00E7able par << avait >>). << \u00E0 >> = pr\u00E9position." },
          { type: "example", text: "Il a mang\u00E9. (il avait mang\u00E9 \u2713) | Elle va \u00E0 l'\u00E9cole." },
          { type: "title", text: "et / est" },
          { type: "rule", text: "<< et >> = conjonction. << est >> = verbe \u00EAtre (rempla\u00E7able par << \u00E9tait >>)." },
          { type: "example", text: "Le chat et le chien jouent. | Il est gentil. (il \u00E9tait gentil \u2713)" },
          { type: "title", text: "son / sont" },
          { type: "rule", text: "<< son >> = adjectif possessif. << sont >> = verbe \u00EAtre 3e pers. pluriel." },
          { type: "example", text: "Son livre est beau. | Ils sont partis. (ils \u00E9taient partis \u2713)" },
          { type: "tip", text: "Astuce universelle : remplace le mot douteux par sa forme \u00E0 l'imparfait. Si \u00E7a marche -> verbe. Sinon -> mot grammatical." },
        ],
        quiz: [
          { q: "Compl\u00E9tez : << Elle ___ all\u00E9e au march\u00E9. >>", choices: ["a", "\u00E0", "as", "\u00E2"], answer: 0, explanation: "<< a >> est le verbe avoir (elle avait all\u00E9e \u2713). Ici c'est le pass\u00E9 compos\u00E9 avec l'auxiliaire avoir." },
          { q: "Quelle phrase est correcte ?", choices: ["Les enfants son fatigu\u00E9s.", "Les enfants sont fatigu\u00E9s.", "Les enfant sont fatigu\u00E9s.", "Les enfants sons fatigu\u00E9s."], answer: 1, explanation: "<< sont >> = verbe \u00EAtre (les enfants \u00E9taient fatigu\u00E9s \u2713). << son >> serait un possessif." },
          { q: "<< J'aime ___ livres mais pas ___ cahiers. >>", choices: ["ces / ses", "ses / ces", "c'est / ses", "ces / c'est"], answer: 0, explanation: "<< ces livres >> = d\u00E9monstratif ; << ses cahiers >> = possessif (les siens)." },
        ],
      },
    ],
  },
  grammaire: {
    icon: "\u1F4DA", label: "Grammaire", color: C.purple,
    lessons: [
      {
        id: "g1", title: "L'accord du verbe avec son sujet",
        theory: [
          { type: "rule", text: "Le verbe s'accorde toujours avec son sujet en personne et en nombre." },
          { type: "example", text: "Edith Piaf vous aurait \u00E9mus. | Nous leur chanterons son r\u00E9pertoire." },
          { type: "title", text: "Cas particuliers" },
          { type: "example", text: "Aucun, pas un, nul -> singulier : Aucun de ses admirateurs ne manquait." },
          { type: "example", text: "Un tas, une foule + compl\u00E9ment -> accord avec le sujet : Un tas d'id\u00E9es traversait la t\u00EAte." },
          { type: "example", text: "La plupart -> pluriel : La plupart l'ont oubli\u00E9." },
          { type: "example", text: "Tout le monde, chacun -> singulier : Tout le monde \u00E9tait sous le charme." },
          { type: "tip", text: "Pour trouver le sujet, posez la question : Qui est-ce qui... ? ou Qu'est-ce qui... ? avant le verbe." },
        ],
        quiz: [
          { q: "<< Aucun de ses amis ne ___ venu. >>", choices: ["sont", "est", "ont", "\u00EAtes"], answer: 1, explanation: "Aucun est singulier -> le verbe est au singulier : n'est venu." },
          { q: "<< C'est toi qui ___ raison. >>", choices: ["a", "ont", "as", "avez"], answer: 2, explanation: "<< Qui >> reprend << toi >> (2e pers. sing.) -> qui as raison." },
          { q: "<< Un tas de probl\u00E8mes ___ apparu. >>", choices: ["sont", "est", "ont", "avaient"], answer: 1, explanation: "Le sujet est << un tas >> (singulier), pas << de probl\u00E8mes >> -> est apparu." },
        ],
      },
      {
        id: "g2", title: "Les types et formes de phrases",
        theory: [
          { type: "title", text: "Les 4 types de phrases" },
          { type: "example", text: "D\u00E9clarative : Il fait beau aujourd'hui." },
          { type: "example", text: "Interrogative : Fait-il beau ? Est-ce qu'il fait beau ?" },
          { type: "example", text: "Imp\u00E9rative : Viens ici ! Faites attention." },
          { type: "example", text: "Exclamative : Comme il fait beau ! Quel beau temps !" },
          { type: "title", text: "Les 2 formes de phrases" },
          { type: "example", text: "Affirmative : Elle parle." },
          { type: "example", text: "N\u00E9gative : Elle ne parle pas." },
          { type: "rule", text: "Apr\u00E8s la n\u00E9gation, l'article ind\u00E9fini (un, une, des) devient << de/d' >>." },
          { type: "example", text: "J'ai des amis. -> Je n'ai pas d'amis. \u2713" },
          { type: "tip", text: "Exception avec \u00EAtre : Ce n'est pas un probl\u00E8me. (l'article ne change pas)" },
        ],
        quiz: [
          { q: "<< Ne mange pas si vite ! >> est une phrase :", choices: ["d\u00E9clarative affirmative", "imp\u00E9rative n\u00E9gative", "interrogative", "exclamative"], answer: 1, explanation: "C'est un ordre (type imp\u00E9ratif) exprim\u00E9 \u00E0 la forme n\u00E9gative (ne\u2026pas)." },
          { q: "Transformez << J'ai des amis >> \u00E0 la forme n\u00E9gative :", choices: ["Je n'ai pas des amis.", "Je n'ai pas d'amis.", "Je n'ai pas les amis.", "Je pas ai amis."], answer: 1, explanation: "Apr\u00E8s la n\u00E9gation, << des >> devient << de/d' >> -> Je n'ai pas d'amis." },
          { q: "Quel type de phrase est << Quelle belle journ\u00E9e ! >> ?", choices: ["interrogative", "imp\u00E9rative", "d\u00E9clarative", "exclamative"], answer: 3, explanation: "La structure en << quel/quelle + nom >> avec point d'exclamation -> phrase exclamative." },
        ],
      },
      {
        id: "g3", title: "La coordination des sujets",
        theory: [
          { type: "rule", text: "Deux sujets au singulier coordonn\u00E9s par << et >> -> le verbe se met au pluriel." },
          { type: "example", text: "Pierre et Marie \u00E9tudient ensemble." },
          { type: "title", text: "Avec << ou >> et << ni >>" },
          { type: "example", text: "Lui ou elle viendra. (l'un ou l'autre -> singulier)" },
          { type: "example", text: "Ni lui ni elle ne sont venus. (les deux absents -> pluriel)" },
          { type: "title", text: "Si << vous >> est inclus" },
          { type: "example", text: "Vous et votre mari avez obtenu le prix. -> 2e pers. pluriel" },
          { type: "tip", text: "Si une liste de sujets est r\u00E9sum\u00E9e par << tout >>, le verbe se met au singulier : La gloire, les honneurs, tout le laissait indiff\u00E9rent." },
        ],
        quiz: [
          { q: "<< Le chien et le chat ___ dans le jardin. >>", choices: ["joue", "jouent", "jouons", "jouez"], answer: 1, explanation: "Deux sujets coordonn\u00E9s par << et >> -> verbe au pluriel : jouent." },
          { q: "<< Vous et votre s\u0153ur ___ invit\u00E9s. >>", choices: ["est", "sommes", "\u00EAtes", "sont"], answer: 2, explanation: "Quand << vous >> est inclus dans les sujets coordonn\u00E9s -> 2e pers. du pluriel : \u00EAtes." },
          { q: "<< La gloire, les honneurs, tout le ___ laissait indiff\u00E9rent. >>", choices: ["laissaient", "laissait", "laissiez", "laissions"], answer: 1, explanation: "Une liste r\u00E9sum\u00E9e par << tout >> -> verbe au singulier : laissait." },
        ],
      },
    ],
  },
  conjugaison: {
    icon: "\u1F504", label: "Conjugaison", color: C.orange,
    lessons: [
      {
        id: "c1", title: "Le pr\u00E9sent de l'indicatif",
        theory: [
          { type: "title", text: "Groupe 1 (-er)" },
          { type: "example", text: "je chante, tu chantes, il chante, nous chantons, vous chantez, ils chantent" },
          { type: "title", text: "Groupe 2 (-ir avec -iss-)" },
          { type: "example", text: "je finis, tu finis, il finit, nous finissons, vous finissez, ils finissent" },
          { type: "title", text: "Verbes irr\u00E9guliers essentiels" },
          { type: "example", text: "\u00CATRE : je suis, tu es, il est, nous sommes, vous \u00EAtes, ils sont" },
          { type: "example", text: "AVOIR : j'ai, tu as, il a, nous avons, vous avez, ils ont" },
          { type: "example", text: "ALLER : je vais, tu vas, il va, nous allons, vous allez, ils vont" },
          { type: "example", text: "FAIRE : je fais, tu fais, il fait, nous faisons, vous faites, ils font" },
          { type: "tip", text: "Verbes en -cer : nous pla\u00E7ons (c\u00E9dille devant o). Verbes en -ger : nous mangeons (e maintenu devant o)." },
        ],
        quiz: [
          { q: "Conjuguez << finir >> \u00E0 la 1re pers. du pluriel :", choices: ["nous finons", "nous finissons", "nous finissez", "nous finions"], answer: 1, explanation: "Finir est du 2e groupe -> nous finissons (avec -iss-)." },
          { q: "Quelle forme est correcte pour << dire >> \u00E0 la 2e pers. pluriel ?", choices: ["vous disez", "vous dites", "vous disaient", "vous diront"], answer: 1, explanation: "Dire est irr\u00E9gulier : vous dites (et non vous disez)." },
          { q: "Quelle forme est correcte pour << manger >> \u00E0 << nous >> ?", choices: ["nous mangons", "nous mangeons", "nous mangions", "nous mangeont"], answer: 1, explanation: "Verbe en -ger : on garde le e devant o -> nous mangeons." },
        ],
      },
      {
        id: "c2", title: "L'imparfait de l'indicatif",
        theory: [
          { type: "rule", text: "L'imparfait exprime une habitude pass\u00E9e, une description ou une action en cours interrompue." },
          { type: "example", text: "Chaque soir, il lisait. | La maison \u00E9tait grande." },
          { type: "title", text: "Formation" },
          { type: "rule", text: "Radical de << nous >> au pr\u00E9sent + terminaisons : -ais, -ais, -ait, -ions, -iez, -aient" },
          { type: "example", text: "nous finissons -> je finissais, tu finissais, il finissait..." },
          { type: "example", text: "nous allons -> j'allais, tu allais, il allait..." },
          { type: "example", text: "Exception \u00CATRE : j'\u00E9tais, tu \u00E9tais, il \u00E9tait, nous \u00E9tions, vous \u00E9tiez, ils \u00E9taient" },
          { type: "tip", text: "Verbes en -ger : cela ne me d\u00E9rangeait pas. Verbes en -cer : ses visites s'espa\u00E7aient." },
        ],
        quiz: [
          { q: "Conjuguez << manger >> \u00E0 l'imparfait, 1re pers. sing. :", choices: ["je mangeais", "je mangais", "je mangeait", "je mangait"], answer: 0, explanation: "Verbe en -ger -> radical << mange >> + ais = je mangeais." },
          { q: "Conjuguez << placer >> \u00E0 l'imparfait, 3e pers. plur. :", choices: ["ils placaient", "ils pla\u00E7aient", "ils placeaient", "ils placeait"], answer: 1, explanation: "Verbe en -cer -> c devient \u00E7 devant a : ils pla\u00E7aient." },
          { q: "Conjuguez << partager >> \u00E0 l'imparfait, 1re pers. plur. :", choices: ["nous partagions", "nous partageions", "nous partageons", "nous partagiions"], answer: 0, explanation: "La terminaison commence par i -> pas besoin du e apr\u00E8s le g : nous partagions." },
        ],
      },
      {
        id: "c3", title: "Le futur simple",
        theory: [
          { type: "rule", text: "Le futur simple exprime une action \u00E0 venir. Formation : infinitif + -ai, -as, -a, -ons, -ez, -ont" },
          { type: "example", text: "chanter -> je chanterai, tu chanteras, il chantera..." },
          { type: "title", text: "Futurs irr\u00E9guliers \u00E0 conna\u00EEtre" },
          { type: "example", text: "\u00EAtre -> je serai | avoir -> j'aurai | aller -> j'irai" },
          { type: "example", text: "faire -> je ferai | pouvoir -> je pourrai | vouloir -> je voudrai" },
          { type: "example", text: "venir -> je viendrai | voir -> je verrai | savoir -> je saurai" },
          { type: "tip", text: "Distinguer futur et conditionnel : futur -> je chanterai (-ai). Conditionnel -> je chanterais (-ais)." },
        ],
        quiz: [
          { q: "Quel est le futur de << avoir >> pour << ils >> ?", choices: ["ils avront", "ils ont", "ils auront", "ils avreront"], answer: 2, explanation: "Avoir est irr\u00E9gulier au futur : radical << aur- >> + ont = ils auront." },
          { q: "<< Demain, tu ___ \u00E0 l'heure. >> (\u00EAtre)", choices: ["seras", "es", "\u00E9tais", "serais"], answer: 0, explanation: "\u00CAtre au futur : radical << ser- >> + as = tu seras." },
          { q: "Comment distingue-t-on futur et conditionnel \u00E0 la 1re pers. sing. ?", choices: ["Pas de diff\u00E9rence", "Futur : -ai | Conditionnel : -ais", "Futur : -ais | Conditionnel : -ai", "Le futur prend un e final"], answer: 1, explanation: "Futur : je chanterai (-ai). Conditionnel : je chanterais (-ais)." },
        ],
      },
      {
        id: "c4", title: "Le pass\u00E9 compos\u00E9",
        theory: [
          { type: "rule", text: "Le pass\u00E9 compos\u00E9 exprime une action termin\u00E9e dans le pass\u00E9. Formation : auxiliaire au pr\u00E9sent + participe pass\u00E9." },
          { type: "title", text: "Avec AVOIR" },
          { type: "example", text: "j'ai mang\u00E9, tu as fini, il a pris, nous avons vu, vous avez dit, ils ont fait" },
          { type: "title", text: "Avec \u00CATRE (DR MRS VANDERTRAMPP)" },
          { type: "example", text: "Devenir, Revenir, Monter, Retourner, Sortir, Venir, Aller, Na\u00EEtre, Descendre, Ent
