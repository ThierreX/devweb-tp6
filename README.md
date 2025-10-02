///////////////////// devweb-TP5 /////////////////////


Question 1.1 :

I'l y'a une en-tête celle-ci : response.end("<html><h1>My first server!<h1></html>");
Dans l'en-tête de la page il y'a uniquement le style

Question 1.2 :

Une en-tête à changer celle-ci : response.setHeader("Content-Type","application/json")
Il y'a également une nouvelle celle-ci : Content-Type: application/json

Question 1.3 :

Je reçois l'erreur : "Error: ENOENT: no such file or directory, open 'C:\Users\gay\Cours\devweb-tp5\index.html'"

Question 1.4 :

Le code d'erreur affichée est : ENOENT (no such file or directory)

Pour vérifier l'erreur j'utilise error.code === "ENOENT"

Question 1.5 :

Voici ma nouvelle fonction en async :

async function requestListener(_request, response) {
  response.setHeader("Content-Type", "text/html");
  try {
    const contents = await fs.readFile("index.html", "utf8");
    response.writeHead(200);
    return response.end(contents);
  } catch (error) {
    console.error(error);
    if (error && error.code === "ENOENT") {
      response.writeHead(500);
      return response.end("<html><p>500: INTERNAL SERVER ERROR - index.html not found</p></html>");
    }
    response.writeHead(500);
    return response.end("<html><p>500: INTERNAL SERVER ERROR</p></html>");
  }
}

Question 1.6 :

La commande npm install cross-env --save a ajouté cross-env dans les dépendances de package.json, et npm install nodemon --save-dev a ajouté nodemon dans les dépendances de développement ainsi que mis à jour node_modules/ et package-lock.json

Question 1.7 :

http-dev lance le serveur avec nodemon en mode développement (redémarrage auto lors d'un changement), alors que http-prod l’exécute avec node en mode production (sans redémarrage auto)

Question 1.8 :

/index.html renvoient 200, /random.html renvoient 200, tandis que / et /dont-exist renvoient 404

Question 2.1:

Express : https://expressjs.com

http-errors : https://github.com/jshttp/http-errors

loglevel : https://www.npmjs.com/package/loglevel

morgan : https://www.npmjs.com/package/morgan

Question 2.2 :

Les routes /, /index.html et /random/:nb répondent correctement avec le contenu attendu

Question 2.3 :

Express ajoute de nouveaux en-têtes comme X-Powered-By, Last-Modified, ETag et Cache-Control

Question 2.4 :

Lorsque le serveur Express a fini de se lier au port/host et est prêt à recevoir des connexions (listening).

Question 2.5 :

L’option index (par défaut à index.html) redirige / vers /index.html dans express.static.

Question 2.6 :

style.css est renvoyé en 200 lors du premier chargement, en 304 lors d’un rafraîchissement normal, et en 200 lors d’un rafraîchissement forcé.

Question 2.7 :

la pile d’erreur (stack) est affichée dans error.ejs.
seule l’erreur et son code sont affichés (pas de stack).

///////////////////// devweb-TP6 /////////////////////
