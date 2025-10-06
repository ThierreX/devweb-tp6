/// LIEN RENDER : https://devweb-tp6-1.onrender.com/api-docs ///

Question 1 :

La commande httpie équivalente est :

http POST :3000/links url=https://perdu.com

Question 2 :

Les principales différences sont :

Journalisation (Logging) : Plus détaillée en mode développement pour le débug

Gestion des erreurs : Les messages d'erreur en développement incluent la pile d'appels (stack trace), tandis qu'en production, ils sont génériques pour des raisons de sécurité

Mise en cache : Généralement désactivée en développement pour refléter les changements en direct, mais activée en production pour optimiser les temps de chargement

Question 3 :

Le script à ajouter dans le package.json est :

"scripts": {
  "format": "prettier --write '**/*.mjs'"
}

Question 4 :

Pour supprimer cet en-tête, il faut utiliser la méthode app.disable()

app.disable('x-powered-by');

Question 5 :

Le code du middleware est :

import { version } from './package.json';

app.use((req, res, next) => {
  res.setHeader('X-API-version', version);
  next();
});

Question 6 :

Le middleware serve-favicon :

import favicon from 'serve-favicon';
import path from 'path';

app.use(favicon(path.join('static', 'logo_univ_16.png')));

Question 7 :

La documentation du driver sqlite3 se trouve sur le wiki de son dépôt GitHub : https://github.com/TryGhost/node-sqlite3/wiki.

Question 8 :

La connexion à la base de données est ouverte au démarrage du serveur et n'est fermée que lorsque le processus du serveur est arrêté.

Question 9 :

Le rechargement de la page en navigation privée force le retéléchargement de toutes les ressources. Cela démontre que, par défaut, Express ne met en place aucune politique de mise en cache côté client. Le navigateur doit donc redemander les fichiers à chaque fois.

Question 10 :

Les liens sont visibles sur toutes les instances car elles partagent la même source de données persistante : le fichier de la base de données SQLite.