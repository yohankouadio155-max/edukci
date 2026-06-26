import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════
// PALETTE & TYPOGRAPHIE
// ═══════════════════════════════════════════════════
const C = {
  green: "#1B6B3A", greenLight: "#2E9B57", greenPale: "#EAF4EE",
  gold: "#D4A017", night: "#0D1B12", ivory: "#FAF6EE",
  coral: "#E8634A", chalk: "#F0EDE6", purple: "#7B3FA0", orange: "#C45E0A",
};
const F = { display: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif" };

// ═══════════════════════════════════════════════════
// STORAGE HELPERS (localStorage)
// ═══════════════════════════════════════════════════
const DB = {
  getUsers: () => { try { return JSON.parse(localStorage.getItem("edukci_users") || "[]"); } catch { return []; } },
  saveUsers: (u) => localStorage.setItem("edukci_users", JSON.stringify(u)),
  getSession: () => { try { return JSON.parse(localStorage.getItem("edukci_session") || "null"); } catch { return null; } },
  saveSession: (s) => localStorage.setItem("edukci_session", JSON.stringify(s)),
  clearSession: () => localStorage.removeItem("edukci_session"),
  getProgress: (uid) => { try { return JSON.parse(localStorage.getItem(`edukci_progress_${uid}`) || "{}"); } catch { return {}; } },
  saveProgress: (uid, p) => localStorage.setItem(`edukci_progress_${uid}`, JSON.stringify(p)),
};

// ═══════════════════════════════════════════════════
// DONNÉES — 100 JOURS POUR NE PLUS FAIRE DE FAUTES
// ═══════════════════════════════════════════════════
const MODULES = {
  orthographe: {
    icon: "✍️", label: "Orthographe", color: C.green,
    lessons: [
      {
        id: "o1", title: "Le genre des noms",
        theory: `**CE QU'IL FAUT SAVOIR**

En français, chaque nom est masculin ou féminin. En règle générale, on forme le féminin en ajoutant un « e » au masculin.

→ un ami → une amie | un étudiant → une étudiante

**Féminins irréguliers courants :**
→ -eur → -euse : un chanteur → une chanteuse
→ -er → -ère : un boulanger → une boulangère
→ -f → -ve : un veuf → une veuve
→ -x → -se : un époux → une épouse
→ -teur → -trice : un acteur → une actrice

**Noms dont le féminin est très différent :**
→ un homme → une femme | un garçon → une fille
→ un coq → une poule | un bœuf → une vache

**Noms épicènes** (même forme au masculin et au féminin) :
→ un/une élève | un/une enfant | un/une ministre

**PENSEZ-Y !**
Les mots terminés par « -tion », « -sion », « -aison », « -eur » (abstraits) sont féminins.
→ la situation, la maison, la chaleur, la couleur`,
        quiz: [
          { q: "Quel est le féminin de « acteur » ?", choices: ["acteure", "acteuse", "actrice", "acteure"], answer: 2, explanation: "Les noms en -teur font -trice au féminin : acteur → actrice." },
          { q: "Quel est le féminin de « époux » ?", choices: ["épouse", "épouse", "épeuse", "époux"], answer: 0, explanation: "Les noms en -x font -se au féminin : époux → épouse." },
          { q: "Lequel de ces noms est féminin ?", choices: ["le problème", "le système", "la chaleur", "le bonheur"], answer: 2, explanation: "Les noms abstraits en -eur comme la chaleur, la peur, la douleur sont féminins. Attention : le bonheur, le malheur sont masculins !" },
        ],
      },
      {
        id: "o2", title: "Le pluriel des noms et adjectifs",
        theory: `**CE QU'IL FAUT SAVOIR**

En règle générale, on ajoute un « s » au singulier pour former le pluriel.
→ un caramel → des caramels | un album → des albums

**Les noms en -s, -x, -z ne changent pas :**
→ un bras → des bras | un choix → des choix | un nez → des nez

**Les noms en -eau prennent -eaux :**
→ un gâteau → des gâteaux | un oiseau → des oiseaux

**Les noms en -al font -aux :**
→ un cheval → des chevaux | un animal → des animaux

**Exceptions en -al → -als :**
→ des bals, des carnavals, des festivals, des récitals, des régals

**Les 7 noms en -ou → -oux :**
→ bijoux, cailloux, choux, genoux, hiboux, joujoux, poux
→ Tous les autres -ou → -ous : des clous, des trous

**PENSEZ-Y !**
Les mots empruntés à des langues étrangères suivent la règle générale.
→ un anorak → des anoraks | un agenda → des agendas`,
        quiz: [
          { q: "Quel est le pluriel correct de « cheval » ?", choices: ["chevals", "chevaux", "chevales", "cheval"], answer: 1, explanation: "Les noms en -al font leur pluriel en -aux : cheval → chevaux." },
          { q: "Lequel de ces pluriels est CORRECT ?", choices: ["des festivaux", "des bals", "des journaux", "des recitaux"], answer: 1, explanation: "« Bal » est une exception : des bals (pas des baux). « Festival » fait des festivals, « journal » des journaux, « récital » des récitals." },
          { q: "Quel est le pluriel de « bijou » ?", choices: ["bijous", "bijoux", "bijouxs", "bijou"], answer: 1, explanation: "Bijou fait partie des 7 noms en -ou qui prennent -x au pluriel : bijoux." },
        ],
      },
      {
        id: "o3", title: "L'accord de l'adjectif de couleur",
        theory: `**CE QU'IL FAUT SAVOIR**

**Les adjectifs de couleur simples** s'accordent normalement en genre et en nombre.
→ des robes bleues | des pantalons noirs | une veste blanche

**Les adjectifs de couleur dérivés d'un nom** sont INVARIABLES.
→ des chaussures marron (nom de fruit)
→ des yeux noisette | des robes orange | des pulls crème

**Exception :** rose, fauve, mauve, écarlate, incarnat → s'accordent !
→ des joues roses | des teintes mauves

**Les adjectifs de couleur composés** (deux mots) sont INVARIABLES.
→ des ceintures bleu foncé | des pulls vert clair | des yeux bleu-vert

**Exemples tirés du livre :**
→ Cléopâtre avait les cheveux noirs et les yeux marron. ✓
(noirs s'accorde, marron est invariable)
→ des ceintures bleu foncé ✓ (composé = invariable)
→ ses bijoux vert émeraude ✓ (composé = invariable)

**PENSEZ-Y !**
Quand deux adjectifs de couleur sont coordonnés, ils restent invariables s'ils décrivent ensemble une couleur unique.
→ une robe à carreaux bleus et blancs ✓ (deux couleurs distinctes → accord)`,
        quiz: [
          { q: "Quelle phrase est correctement écrite ?", choices: ["des robes oranges", "des robes orange", "des robe orange", "des robes oranger"], answer: 1, explanation: "Orange est un nom de fruit utilisé comme adjectif de couleur : il est invariable → des robes orange." },
          { q: "Choisissez la forme correcte : « des ceintures ___ » (bleu + foncé)", choices: ["bleues foncées", "bleu foncées", "bleu foncé", "bleue foncé"], answer: 2, explanation: "Un adjectif de couleur composé (bleu foncé) est toujours invariable." },
          { q: "Laquelle est correcte ?", choices: ["ses yeux marrons", "ses yeux marron", "son œil marrons", "ses yeux marrones"], answer: 1, explanation: "Marron est un nom de fruit employé comme adjectif de couleur : invariable → ses yeux marron." },
        ],
      },
      {
        id: "o4", title: "Les homophones a/à, et/est, son/sont",
        theory: `**CE QU'IL FAUT SAVOIR**

**a / à**
→ « a » = verbe avoir (on peut le remplacer par « avait »)
→ « à » = préposition (lieu, temps, manière…)
✓ Il a mangé. (il avait mangé ✓) | Elle va à l'école.

**et / est**
→ « et » = conjonction de coordination (= « et puis »)
→ « est » = verbe être (on peut le remplacer par « était »)
✓ Le chat et le chien jouent. | Il est gentil. (il était gentil ✓)

**son / sont**
→ « son » = adjectif possessif (= « le sien »)
→ « sont » = verbe être 3e pers. pluriel (= « étaient »)
✓ Son livre est beau. | Ils sont partis. (ils étaient partis ✓)

**ou / où**
→ « ou » = conjonction (= « ou bien »)
→ « où » = lieu ou question (= « dans lequel »)
✓ Café ou thé ? | Je ne sais pas où il est.

**ces / ses / c'est / s'est**
→ « ces » = démonstratif pluriel (ces choses-là)
→ « ses » = possessif pluriel (les siens)
→ « c'est » = ce + est | « s'est » = se + est (pronominal)

**PENSEZ-Y !**
Astuce universelle : essayez de remplacer le mot douteux par sa forme à l'imparfait. Si ça marche → verbe. Sinon → mot grammatical.`,
        quiz: [
          { q: "Complétez : « Elle ___ allée au marché et ___ rentrée tard. »", choices: ["a / est", "est / a", "à / est", "a / a"], answer: 0, explanation: "« a allée » : verbe avoir (elle avait allée ✓). « est rentrée » : verbe être (elle était rentrée ✓)." },
          { q: "Quelle phrase est correcte ?", choices: ["Les enfants son fatigués.", "Les enfants sont fatigués.", "Les enfant sont fatigués.", "Les enfants sons fatigués."], answer: 1, explanation: "« sont » = verbe être (les enfants étaient fatigués ✓). « son » serait un possessif (son livre)." },
          { q: "« J'aime ___ livres mais pas ___ cahiers. »", choices: ["ces / ses", "ses / ces", "c'est / ses", "ces / c'est"], answer: 0, explanation: "« ces livres » = démonstratif (ceux-là) ; « ses cahiers » = possessif (les siens)." },
        ],
      },
    ],
  },
  grammaire: {
    icon: "📚", label: "Grammaire", color: C.purple,
    lessons: [
      {
        id: "g1", title: "L'accord du verbe avec son sujet",
        theory: `**CE QU'IL FAUT SAVOIR**

Le verbe s'accorde toujours avec son sujet en personne et en nombre.

**Règle générale :**
→ Édith Piaf vous aurait certainement émus. (sujet singulier → aurait)
→ Nous leur chanterons tout son répertoire. (sujet 1ʳᵉ pers. plur.)

**Aucun, pas un, nul :**
→ Aucun de ses admirateurs ne manquait un concert. (singulier)

**Sujet collectif + complément :**
→ Un tas d'idées traversait la tête. (sujet = « un tas » → singulier)
→ La plupart l'ont oublié. (plupart → pluriel)
→ L'ensemble des élèves a appris. (ensemble → singulier)

**Tout le monde, chacun :**
→ Tout le monde était sous le charme. (singulier)

**Qui relatif :**
→ C'est toi qui apprendras. (qui reprend « toi » → 2ᵉ pers.)
→ Moi qui aurais tant aimé la voir ! (qui reprend « moi » → 1ʳᵉ pers.)

**PENSEZ-Y !**
Pour trouver le sujet, posez la question « Qui est-ce qui... ? » ou « Qu'est-ce qui... ? » avant le verbe.`,
        quiz: [
          { q: "« Aucun de ses amis ne ___ venu. »", choices: ["sont", "est", "ont", "êtes"], answer: 1, explanation: "« Aucun » est singulier → le verbe est au singulier : n'est venu." },
          { q: "« C'est toi qui ___ raison. »", choices: ["a", "ont", "as", "avez"], answer: 2, explanation: "« Qui » reprend « toi » (2ᵉ pers. sing.) → « qui as raison »." },
          { q: "« Un tas de problèmes ___ apparu. »", choices: ["sont", "est", "ont", "avaient"], answer: 1, explanation: "Le sujet est « un tas » (singulier), pas « de problèmes » → est apparu." },
        ],
      },
      {
        id: "g2", title: "Les types et formes de phrases",
        theory: `**CE QU'IL FAUT SAVOIR**

**Les 4 types de phrases :**

→ **Déclarative** : affirme ou infirme quelque chose.
  Il fait beau aujourd'hui.

→ **Interrogative** : pose une question. Se termine par « ? »
  Fait-il beau ? | Est-ce qu'il fait beau ?

→ **Impérative** : exprime un ordre, conseil, prière.
  Viens ici ! | Faites attention.

→ **Exclamative** : exprime une émotion forte.
  Comme il fait beau ! | Quel beau temps !

**Les 2 formes de phrases :**

→ **Affirmative** : Elle parle.
→ **Négative** : Elle ne parle pas.

**Marqueurs de négation :**
ne… pas | ne… plus | ne… jamais | ne… rien | ne… personne | ne… que (restriction)

**Règle importante :**
Après la négation, l'article indéfini (un, une, des) devient « de/d' ».
→ J'ai des amis. → Je n'ai pas d'amis. ✓
→ J'ai un chien. → Je n'ai pas de chien. ✓
Exception : verbe être → l'article ne change pas.
→ C'est un problème. → Ce n'est pas un problème. ✓`,
        quiz: [
          { q: "« Ne mange pas si vite ! » est une phrase :", choices: ["déclarative affirmative", "impérative négative", "interrogative", "exclamative"], answer: 1, explanation: "C'est un ordre (type impératif) exprimé à la forme négative (ne…pas)." },
          { q: "Transformez « J'ai des amis » à la forme négative :", choices: ["Je n'ai pas des amis.", "Je n'ai pas d'amis.", "Je n'ai pas les amis.", "Je pas ai amis."], answer: 1, explanation: "Après la négation, « des » devient « de/d' » → Je n'ai pas d'amis." },
          { q: "Quel type de phrase est « Quelle belle journée nous avons ! » ?", choices: ["interrogative", "impérative", "déclarative", "exclamative"], answer: 3, explanation: "La structure en « quel/quelle + nom » avec point d'exclamation → phrase exclamative." },
        ],
      },
      {
        id: "g3", title: "Lorsque le sujet contient une coordination",
        theory: `**CE QU'IL FAUT SAVOIR**

Quand deux sujets au singulier sont coordonnés par « et », le verbe se met au pluriel.
→ Pierre et Marie étudient ensemble. ✓
→ Pierre Curie et sa femme Marie étudient la radioactivité. ✓

**Avec « ou » et « ni » :**
Si les sujets sont coordonnés par « ou » ou « ni », le verbe peut être singulier ou pluriel selon le sens.
→ Lui ou elle viendra (l'un ou l'autre, pas les deux → sing.)
→ Ni lui ni elle ne sont venus. (les deux absents → plur.)

**Sujet collectif :**
Si un seul des sujets coordonnés inclut « vous », le verbe se met à la 2ᵉ pers. du pluriel.
→ Vous et votre mari avez obtenu le prix Nobel. ✓

**Infinitifs coordonnés :**
Deux infinitifs sujets coordonnés par « et » → le verbe peut rester au singulier s'ils forment une seule idée.
→ Permettre de nouveaux progrès et faire avancer la science restaient leur motivation. ✓

**PENSEZ-Y !**
Si les deux sujets résument par « tout » → singulier.
→ La radioactivité, le radium, le polonium, tout les intéresse. ✓`,
        quiz: [
          { q: "« Le chien et le chat ___ dans le jardin. »", choices: ["joue", "jouent", "jouons", "jouez"], answer: 1, explanation: "Deux sujets coordonnés par « et » → verbe au pluriel : jouent." },
          { q: "« Vous et votre sœur ___ invités. »", choices: ["est", "sommes", "êtes", "sont"], answer: 2, explanation: "Quand « vous » est inclus dans les sujets coordonnés → 2ᵉ pers. du pluriel : êtes." },
          { q: "« La gloire, les honneurs, le prestige, tout le ___ laissait indifférent. »", choices: ["laissaient", "laissait", "laissiez", "laissions"], answer: 1, explanation: "Quand une liste de sujets est résumée par « tout », le verbe se met au singulier : laissait." },
        ],
      },
    ],
  },
  conjugaison: {
    icon: "🔄", label: "Conjugaison", color: C.orange,
    lessons: [
      {
        id: "c1", title: "Le présent de l'indicatif",
        theory: `**CE QU'IL FAUT SAVOIR**

**Groupe 1 (-er)** : je chant**e**, tu chant**es**, il chant**e**, nous chant**ons**, vous chant**ez**, ils chant**ent**

**Groupe 2 (-ir, avec -iss-)** : je fin**is**, tu fin**is**, il fin**it**, nous fin**issons**, vous fin**issez**, ils fin**issent**

**Verbes irréguliers essentiels :**

| Pronom | ÊTRE | AVOIR | ALLER | FAIRE | DIRE | VOULOIR |
|--------|------|-------|-------|-------|------|---------|
| je     | suis | ai    | vais  | fais  | dis  | veux    |
| tu     | es   | as    | vas   | fais  | dis  | veux    |
| il     | est  | a     | va    | fait  | dit  | veut    |
| nous   | sommes| avons| allons| faisons| disons| voulons|
| vous   | êtes | avez  | allez | faites| dites| voulez  |
| ils    | sont | ont   | vont  | font  | disent| veulent|

**Verbes en -cer et -ger :**
→ placer → nous plaçons (cédille devant o pour garder [s])
→ manger → nous mangeons (e maintenu devant o pour garder [ʒ])

**PENSEZ-Y !**
« Si vous dites à quelqu'un… » et non « disez » : dites est la 2ᵉ pers. plur. de « dire » (irrégulier, comme faites, êtes).`,
        quiz: [
          { q: "Conjuguez « finir » à la 1ʳᵉ pers. du pluriel :", choices: ["nous finons", "nous finissons", "nous finissez", "nous finions"], answer: 1, explanation: "Finir est du 2ᵉ groupe → nous finissons (avec -iss-)." },
          { q: "Complétez : « Si vous ___ la vérité, cela ira mieux. » (dire)", choices: ["disez", "dites", "dites", "direz"], answer: 1, explanation: "« Dire » est irrégulier : vous dites (et non vous disez)." },
          { q: "Quelle forme est correcte pour « manger » à « nous » ?", choices: ["nous mangons", "nous mangeons", "nous mangions", "nous mangeont"], answer: 1, explanation: "Verbe en -ger : on garde le e devant o pour conserver le son [ʒ] → nous mangeons." },
        ],
      },
      {
        id: "c2", title: "L'imparfait de l'indicatif",
        theory: `**CE QU'IL FAUT SAVOIR**

L'imparfait exprime :
→ Une action habituelle dans le passé : Chaque soir, il lisait.
→ Une description dans le passé : La maison était grande.
→ Une action en cours interrompue : Je dormais quand il est arrivé.

**Formation :**
Radical de la 1ʳᵉ pers. du pluriel au présent + terminaisons :
**-ais, -ais, -ait, -ions, -iez, -aient**

→ nous finissons → je finiss**ais**, tu finiss**ais**, il finiss**ait**, nous finiss**ions**…
→ nous allons → j'all**ais**, tu all**ais**, il all**ait**…

**Verbes en -cer à l'imparfait :**
→ ses visites s'espaçaient (c + aient → ç devant a) ✓

**Verbes en -ger à l'imparfait :**
→ cela ne me dérangeait pas ✓
→ nous partagions (terminaison en -ions → pas de e après g) ✓

**Exception :** ÊTRE → j'étais, tu étais, il était, nous étions, vous étiez, ils étaient

**PENSEZ-Y !**
Les 1ʳᵉ et 2ᵉ pers. du pluriel de l'imparfait (-ions, -iez) ressemblent au subjonctif présent mais c'est bien l'imparfait si l'action est passée.`,
        quiz: [
          { q: "Conjuguez « manger » à l'imparfait, 1ʳᵉ pers. sing. :", choices: ["je mangeais", "je mangais", "je mangeait", "je mangait"], answer: 0, explanation: "Verbe en -ger → radical « mange » + ais = je mangeais (e conservé devant a)." },
          { q: "Conjuguez « placer » à l'imparfait, 3ᵉ pers. plur. :", choices: ["ils placaient", "ils plaçaient", "ils placeaient", "ils placeait"], answer: 1, explanation: "Verbe en -cer → c devient ç devant a : ils plaçaient." },
          { q: "Conjuguez « partager » à l'imparfait, 1ʳᵉ pers. plur. :", choices: ["nous partagions", "nous partageions", "nous partageons", "nous partagiions"], answer: 0, explanation: "La terminaison commence par i → pas besoin du e après le g : nous partagions." },
        ],
      },
      {
        id: "c3", title: "Le futur simple de l'indicatif",
        theory: `**CE QU'IL FAUT SAVOIR**

Le futur simple exprime une action à venir ou une vérité générale future.

**Formation :**
Infinitif (entier pour -er et -ir) + terminaisons :
**-ai, -as, -a, -ons, -ez, -ont**

→ chanter → je chanter**ai**, tu chanter**as**, il chanter**a**, nous chanter**ons**…
→ finir → je finir**ai**, tu finir**as**…

**Futurs irréguliers à connaître absolument :**
→ être → je **ser**ai
→ avoir → j'**aur**ai
→ aller → j'**ir**ai
→ faire → je **fer**ai
→ pouvoir → je **pourr**ai
→ vouloir → je **voudr**ai
→ venir → je **viendr**ai
→ voir → je **verr**ai
→ savoir → je **saur**ai
→ tenir → je **tiendr**ai

**PENSEZ-Y !**
Le futur se distingue du conditionnel par la 1ʳᵉ pers. sing. :
→ Futur : je chanter**ai** (= je chanterai demain)
→ Conditionnel : je chanter**ais** (= je chanterais si…)`,
        quiz: [
          { q: "Quel est le futur de « avoir » pour « ils » ?", choices: ["ils avront", "ils ont", "ils auront", "ils avreront"], answer: 2, explanation: "Avoir est irrégulier au futur : radical « aur- » + ont = ils auront." },
          { q: "« Demain, tu ___ à l'heure. » (être)", choices: ["seras", "es", "étais", "serais"], answer: 0, explanation: "Être au futur : radical « ser- » + as = tu seras." },
          { q: "Comment distingue-t-on futur et conditionnel à la 1ʳᵉ pers. sing. ?", choices: ["Pas de différence", "Futur : -ai | Conditionnel : -ais", "Futur : -ais | Conditionnel : -ai", "Le futur prend toujours un e final"], answer: 1, explanation: "Futur : je chanterai (terminaison -ai). Conditionnel : je chanterais (terminaison -ais)." },
        ],
      },
      {
        id: "c4", title: "Le passé composé",
        theory: `**CE QU'IL FAUT SAVOIR**

Le passé composé exprime une action terminée dans le passé.

**Formation :** auxiliaire (avoir ou être) au présent + participe passé

**Avec AVOIR** (majorité des verbes) :
→ J'ai mangé, tu as fini, il a pr
