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
    icon: "✍️", label: "Orthographe", color: C.green,
    lessons: [
      {
        id: "o1", title: "Le genre des noms",
        theory: [
          { type: "rule", text: "En français, chaque nom est masculin ou féminin. On forme généralement le féminin en ajoutant un « e » au masculin." },
          { type: "example", text: "un ami → une amie | un étudiant → une étudiante" },
          { type: "title", text: "Féminins irréguliers courants" },
          { type: "example", text: "-eur → -euse : un chanteur → une chanteuse" },
          { type: "example", text: "-er → -ère : un boulanger → une boulangère" },
          { type: "example", text: "-f → -ve : un veuf → une veuve" },
          { type: "example", text: "-x → -se : un époux → une épouse" },
          { type: "example", text: "-teur → -trice : un acteur → une actrice" },
          { type: "title", text: "Noms épicènes (même forme)" },
          { type: "example", text: "un/une élève | un/une enfant | un/une ministre" },
          { type: "tip", text: "Les mots en -tion, -sion, -aison, -eur (abstraits) sont féminins : la situation, la maison, la chaleur." },
        ],
        quiz: [
          { q: "Quel est le féminin de « acteur » ?", choices: ["acteure", "acteuse", "actrice", "acteure"], answer: 2, explanation: "Les noms en -teur font -trice au féminin : acteur → actrice." },
          { q: "Quel est le féminin de « époux » ?", choices: ["épouse", "épeuse", "époux", "épouxe"], answer: 0, explanation: "Les noms en -x font -se au féminin : époux → épouse." },
          { q: "Lequel de ces noms est féminin ?", choices: ["le problème", "le système", "la chaleur", "le bonheur"], answer: 2, explanation: "Les noms abstraits en -eur comme la chaleur, la peur, la douleur sont féminins." },
        ],
      },
      {
        id: "o2", title: "Le pluriel des noms",
        theory: [
          { type: "rule", text: "En règle générale, on ajoute un « s » au singulier pour former le pluriel." },
          { type: "example", text: "un caramel → des caramels | un album → des albums" },
          { type: "title", text: "Cas particuliers" },
          { type: "example", text: "Noms en -s, -x, -z : invariables → un bras / des bras" },
          { type: "example", text: "Noms en -eau → -eaux : un gâteau / des gâteaux" },
          { type: "example", text: "Noms en -al → -aux : un cheval / des chevaux" },
          { type: "example", text: "Exceptions en -al → -als : des bals, des carnavals, des festivals" },
          { type: "title", text: "Les 7 noms en -ou → -oux" },
          { type: "example", text: "bijoux, cailloux, choux, genoux, hiboux, joujoux, poux" },
          { type: "tip", text: "Tous les autres noms en -ou prennent -ous : des clous, des trous, des sous." },
        ],
        quiz: [
          { q: "Quel est le pluriel correct de « cheval » ?", choices: ["chevals", "chevaux", "chevales", "cheval"], answer: 1, explanation: "Les noms en -al font leur pluriel en -aux : cheval → chevaux." },
          { q: "Lequel de ces pluriels est CORRECT ?", choices: ["des festivaux", "des bals", "des animauxs", "des travails"], answer: 1, explanation: "« Bal » est une exception : des bals. Festival → festivals, animal → animaux, travail → travaux." },
          { q: "Quel est le pluriel de « bijou » ?", choices: ["bijous", "bijoux", "bijouxs", "bijou"], answer: 1, explanation: "Bijou fait partie des 7 noms en -ou qui prennent -x au pluriel : bijoux." },
        ],
      },
      {
        id: "o3", title: "L'accord de l'adjectif de couleur",
        theory: [
          { type: "rule", text: "Les adjectifs de couleur simples s'accordent en genre et en nombre." },
          { type: "example", text: "des robes bleues | des pantalons noirs | une veste blanche" },
          { type: "title", text: "Adjectifs dérivés d'un nom → INVARIABLES" },
          { type: "example", text: "des chaussures marron | des yeux noisette | des robes orange" },
          { type: "example", text: "Exception : rose, mauve, écarlate s'accordent → des joues roses" },
          { type: "title", text: "Adjectifs composés → INVARIABLES" },
          { type: "example", text: "des ceintures bleu foncé | des pulls vert clair | des yeux bleu-vert" },
          { type: "tip", text: "Astuce : si la couleur vient d'un fruit ou d'un objet (orange, marron, crème), elle est invariable." },
        ],
        quiz: [
          { q: "Quelle phrase est correctement écrite ?", choices: ["des robes oranges", "des robes orange", "des robe orange", "des robes oranger"], answer: 1, explanation: "Orange est un nom de fruit utilisé comme adjectif de couleur : il est invariable." },
          { q: "Choisissez la forme correcte pour « des ceintures » (bleu + foncé) :", choices: ["bleues foncées", "bleu foncées", "bleu foncé", "bleue foncé"], answer: 2, explanation: "Un adjectif de couleur composé est toujours invariable : bleu foncé." },
          { q: "Laquelle est correcte ?", choices: ["ses yeux marrons", "ses yeux marron", "son oeil marrons", "ses yeux marroner"], answer: 1, explanation: "Marron est un nom de fruit employé comme adjectif de couleur : invariable → ses yeux marron." },
        ],
      },
      {
        id: "o4", title: "Les homophones a/à, et/est, son/sont",
        theory: [
          { type: "title", text: "a / à" },
          { type: "rule", text: "« a » = verbe avoir (remplaçable par « avait »). « à » = préposition." },
          { type: "example", text: "Il a mangé. (il avait mangé ✓) | Elle va à l'école." },
          { type: "title", text: "et / est" },
          { type: "rule", text: "« et » = conjonction. « est » = verbe être (remplaçable par « était »)." },
          { type: "example", text: "Le chat et le chien jouent. | Il est gentil. (il était gentil ✓)" },
          { type: "title", text: "son / sont" },
          { type: "rule", text: "« son » = adjectif possessif. « sont » = verbe être 3e pers. pluriel." },
          { type: "example", text: "Son livre est beau. | Ils sont partis. (ils étaient partis ✓)" },
          { type: "tip", text: "Astuce universelle : remplace le mot douteux par sa forme à l'imparfait. Si ça marche → verbe. Sinon → mot grammatical." },
        ],
        quiz: [
          { q: "Complétez : « Elle ___ allée au marché. »", choices: ["a", "à", "as", "â"], answer: 0, explanation: "« a » est le verbe avoir (elle avait allée ✓). Ici c'est le passé composé avec l'auxiliaire avoir." },
          { q: "Quelle phrase est correcte ?", choices: ["Les enfants son fatigués.", "Les enfants sont fatigués.", "Les enfant sont fatigués.", "Les enfants sons fatigués."], answer: 1, explanation: "« sont » = verbe être (les enfants étaient fatigués ✓). « son » serait un possessif." },
          { q: "« J'aime ___ livres mais pas ___ cahiers. »", choices: ["ces / ses", "ses / ces", "c'est / ses", "ces / c'est"], answer: 0, explanation: "« ces livres » = démonstratif ; « ses cahiers » = possessif (les siens)." },
        ],
      },
    ],
  },
  grammaire: {
    icon: "📚", label: "Grammaire", color: C.purple,
    lessons: [
      {
        id: "g1", title: "L'accord du verbe avec son sujet",
        theory: [
          { type: "rule", text: "Le verbe s'accorde toujours avec son sujet en personne et en nombre." },
          { type: "example", text: "Edith Piaf vous aurait émus. | Nous leur chanterons son répertoire." },
          { type: "title", text: "Cas particuliers" },
          { type: "example", text: "Aucun, pas un, nul → singulier : Aucun de ses admirateurs ne manquait." },
          { type: "example", text: "Un tas, une foule + complément → accord avec le sujet : Un tas d'idées traversait la tête." },
          { type: "example", text: "La plupart → pluriel : La plupart l'ont oublié." },
          { type: "example", text: "Tout le monde, chacun → singulier : Tout le monde était sous le charme." },
          { type: "tip", text: "Pour trouver le sujet, posez la question : Qui est-ce qui... ? ou Qu'est-ce qui... ? avant le verbe." },
        ],
        quiz: [
          { q: "« Aucun de ses amis ne ___ venu. »", choices: ["sont", "est", "ont", "êtes"], answer: 1, explanation: "Aucun est singulier → le verbe est au singulier : n'est venu." },
          { q: "« C'est toi qui ___ raison. »", choices: ["a", "ont", "as", "avez"], answer: 2, explanation: "« Qui » reprend « toi » (2e pers. sing.) → qui as raison." },
          { q: "« Un tas de problèmes ___ apparu. »", choices: ["sont", "est", "ont", "avaient"], answer: 1, explanation: "Le sujet est « un tas » (singulier), pas « de problèmes » → est apparu." },
        ],
      },
      {
        id: "g2", title: "Les types et formes de phrases",
        theory: [
          { type: "title", text: "Les 4 types de phrases" },
          { type: "example", text: "Déclarative : Il fait beau aujourd'hui." },
          { type: "example", text: "Interrogative : Fait-il beau ? Est-ce qu'il fait beau ?" },
          { type: "example", text: "Impérative : Viens ici ! Faites attention." },
          { type: "example", text: "Exclamative : Comme il fait beau ! Quel beau temps !" },
          { type: "title", text: "Les 2 formes de phrases" },
          { type: "example", text: "Affirmative : Elle parle." },
          { type: "example", text: "Négative : Elle ne parle pas." },
          { type: "rule", text: "Après la négation, l'article indéfini (un, une, des) devient « de/d' »." },
          { type: "example", text: "J'ai des amis. → Je n'ai pas d'amis. ✓" },
          { type: "tip", text: "Exception avec être : Ce n'est pas un problème. (l'article ne change pas)" },
        ],
        quiz: [
          { q: "« Ne mange pas si vite ! » est une phrase :", choices: ["déclarative affirmative", "impérative négative", "interrogative", "exclamative"], answer: 1, explanation: "C'est un ordre (type impératif) exprimé à la forme négative (ne…pas)." },
          { q: "Transformez « J'ai des amis » à la forme négative :", choices: ["Je n'ai pas des amis.", "Je n'ai pas d'amis.", "Je n'ai pas les amis.", "Je pas ai amis."], answer: 1, explanation: "Après la négation, « des » devient « de/d' » → Je n'ai pas d'amis." },
          { q: "Quel type de phrase est « Quelle belle journée ! » ?", choices: ["interrogative", "impérative", "déclarative", "exclamative"], answer: 3, explanation: "La structure en « quel/quelle + nom » avec point d'exclamation → phrase exclamative." },
        ],
      },
      {
        id: "g3", title: "La coordination des sujets",
        theory: [
          { type: "rule", text: "Deux sujets au singulier coordonnés par « et » → le verbe se met au pluriel." },
          { type: "example", text: "Pierre et Marie étudient ensemble." },
          { type: "title", text: "Avec « ou » et « ni »" },
          { type: "example", text: "Lui ou elle viendra. (l'un ou l'autre → singulier)" },
          { type: "example", text: "Ni lui ni elle ne sont venus. (les deux absents → pluriel)" },
          { type: "title", text: "Si « vous » est inclus" },
          { type: "example", text: "Vous et votre mari avez obtenu le prix. → 2e pers. pluriel" },
          { type: "tip", text: "Si une liste de sujets est résumée par « tout », le verbe se met au singulier : La gloire, les honneurs, tout le laissait indifférent." },
        ],
        quiz: [
          { q: "« Le chien et le chat ___ dans le jardin. »", choices: ["joue", "jouent", "jouons", "jouez"], answer: 1, explanation: "Deux sujets coordonnés par « et » → verbe au pluriel : jouent." },
          { q: "« Vous et votre sœur ___ invités. »", choices: ["est", "sommes", "êtes", "sont"], answer: 2, explanation: "Quand « vous » est inclus dans les sujets coordonnés → 2e pers. du pluriel : êtes." },
          { q: "« La gloire, les honneurs, tout le ___ laissait indifférent. »", choices: ["laissaient", "laissait", "laissiez", "laissions"], answer: 1, explanation: "Une liste résumée par « tout » → verbe au singulier : laissait." },
        ],
      },
    ],
  },
  conjugaison: {
    icon: "🔄", label: "Conjugaison", color: C.orange,
    lessons: [
      {
        id: "c1", title: "Le présent de l'indicatif",
        theory: [
          { type: "title", text: "Groupe 1 (-er)" },
          { type: "example", text: "je chante, tu chantes, il chante, nous chantons, vous chantez, ils chantent" },
          { type: "title", text: "Groupe 2 (-ir avec -iss-)" },
          { type: "example", text: "je finis, tu finis, il finit, nous finissons, vous finissez, ils finissent" },
          { type: "title", text: "Verbes irréguliers essentiels" },
          { type: "example", text: "ÊTRE : je suis, tu es, il est, nous sommes, vous êtes, ils sont" },
          { type: "example", text: "AVOIR : j'ai, tu as, il a, nous avons, vous avez, ils ont" },
          { type: "example", text: "ALLER : je vais, tu vas, il va, nous allons, vous allez, ils vont" },
          { type: "example", text: "FAIRE : je fais, tu fais, il fait, nous faisons, vous faites, ils font" },
          { type: "tip", text: "Verbes en -cer : nous plaçons (cédille devant o). Verbes en -ger : nous mangeons (e maintenu devant o)." },
        ],
        quiz: [
          { q: "Conjuguez « finir » à la 1re pers. du pluriel :", choices: ["nous finons", "nous finissons", "nous finissez", "nous finions"], answer: 1, explanation: "Finir est du 2e groupe → nous finissons (avec -iss-)." },
          { q: "Quelle forme est correcte pour « dire » à la 2e pers. pluriel ?", choices: ["vous disez", "vous dites", "vous disaient", "vous diront"], answer: 1, explanation: "Dire est irrégulier : vous dites (et non vous disez)." },
          { q: "Quelle forme est correcte pour « manger » à « nous » ?", choices: ["nous mangons", "nous mangeons", "nous mangions", "nous mangeont"], answer: 1, explanation: "Verbe en -ger : on garde le e devant o → nous mangeons." },
        ],
      },
      {
        id: "c2", title: "L'imparfait de l'indicatif",
        theory: [
          { type: "rule", text: "L'imparfait exprime une habitude passée, une description ou une action en cours interrompue." },
          { type: "example", text: "Chaque soir, il lisait. | La maison était grande." },
          { type: "title", text: "Formation" },
          { type: "rule", text: "Radical de « nous » au présent + terminaisons : -ais, -ais, -ait, -ions, -iez, -aient" },
          { type: "example", text: "nous finissons → je finissais, tu finissais, il finissait..." },
          { type: "example", text: "nous allons → j'allais, tu allais, il allait..." },
          { type: "example", text: "Exception ÊTRE : j'étais, tu étais, il était, nous étions, vous étiez, ils étaient" },
          { type: "tip", text: "Verbes en -ger : cela ne me dérangeait pas. Verbes en -cer : ses visites s'espaçaient." },
        ],
        quiz: [
          { q: "Conjuguez « manger » à l'imparfait, 1re pers. sing. :", choices: ["je mangeais", "je mangais", "je mangeait", "je mangait"], answer: 0, explanation: "Verbe en -ger → radical « mange » + ais = je mangeais." },
          { q: "Conjuguez « placer » à l'imparfait, 3e pers. plur. :", choices: ["ils placaient", "ils plaçaient", "ils placeaient", "ils placeait"], answer: 1, explanation: "Verbe en -cer → c devient ç devant a : ils plaçaient." },
          { q: "Conjuguez « partager » à l'imparfait, 1re pers. plur. :", choices: ["nous partagions", "nous partageions", "nous partageons", "nous partagiions"], answer: 0, explanation: "La terminaison commence par i → pas besoin du e après le g : nous partagions." },
        ],
      },
      {
        id: "c3", title: "Le futur simple",
        theory: [
          { type: "rule", text: "Le futur simple exprime une action à venir. Formation : infinitif + -ai, -as, -a, -ons, -ez, -ont" },
          { type: "example", text: "chanter → je chanterai, tu chanteras, il chantera..." },
          { type: "title", text: "Futurs irréguliers à connaître" },
          { type: "example", text: "être → je serai | avoir → j'aurai | aller → j'irai" },
          { type: "example", text: "faire → je ferai | pouvoir → je pourrai | vouloir → je voudrai" },
          { type: "example", text: "venir → je viendrai | voir → je verrai | savoir → je saurai" },
          { type: "tip", text: "Distinguer futur et conditionnel : futur → je chanterai (-ai). Conditionnel → je chanterais (-ais)." },
        ],
        quiz: [
          { q: "Quel est le futur de « avoir » pour « ils » ?", choices: ["ils avront", "ils ont", "ils auront", "ils avreront"], answer: 2, explanation: "Avoir est irrégulier au futur : radical « aur- » + ont = ils auront." },
          { q: "« Demain, tu ___ à l'heure. » (être)", choices: ["seras", "es", "étais", "serais"], answer: 0, explanation: "Être au futur : radical « ser- » + as = tu seras." },
          { q: "Comment distingue-t-on futur et conditionnel à la 1re pers. sing. ?", choices: ["Pas de différence", "Futur : -ai | Conditionnel : -ais", "Futur : -ais | Conditionnel : -ai", "Le futur prend un e final"], answer: 1, explanation: "Futur : je chanterai (-ai). Conditionnel : je chanterais (-ais)." },
        ],
      },
      {
        id: "c4", title: "Le passé composé",
        theory: [
          { type: "rule", text: "Le passé composé exprime une action terminée dans le passé. Formation : auxiliaire au présent + participe passé." },
          { type: "title", text: "Avec AVOIR" },
          { type: "example", text: "j'ai mangé, tu as fini, il a pris, nous avons vu, vous avez dit, ils ont fait" },
          { type: "title", text: "Avec ÊTRE (DR MRS VANDERTRAMPP)" },
          { type: "example", text: "Devenir, Revenir, Monter, Retourner, Sortir, Venir, Aller, Naître, Descendre, Entrer, Rentrer, Tomber, Rester, Arriver, Mourir, Partir, Passer" },
          { type: "example", text: "Il est allé, elle est venue, ils sont partis" },
          { type: "title", text: "Accord du participe passé" },
          { type: "example", text: "Avec ÊTRE → accord avec le sujet : Elles sont arrivées." },
          { type: "example", text: "Avec AVOIR → accord avec le COD placé AVANT : La robe que j'ai achetée." },
          { type: "tip", text: "Si le COD est après le verbe → pas d'accord : J'ai acheté une robe." },
        ],
        quiz: [
          { q: "« Elle ___ au cinéma hier. » (aller)", choices: ["a allé", "est allée", "a été", "est allé"], answer: 1, explanation: "Aller se conjugue avec ÊTRE. Elle (féminin) → est allée (accord avec le sujet)." },
          { q: "« Ils ___ leur travail. » (finir)", choices: ["ont fini", "sont finis", "ont finis", "sont fini"], answer: 0, explanation: "Finir se conjugue avec AVOIR. Pas d'accord (COD après le verbe) → ont fini." },
          { q: "« Les lettres qu'il a ___ étaient importantes. » (écrire)", choices: ["écrit", "écrits", "écrites", "écrite"], answer: 2, explanation: "COD « les lettres » (fém. plur.
