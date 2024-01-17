const express = require("express");
const mustacheExpress = require("mustache-express");
const app = express();

/**
 * Configuration de mustache
 * comme moteur de template
 * pour l'extension .mustache
 */
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

/**
 * Configuration de express
 * pour récupérer les données d'un formulaire
 * et pour servir les fichiers statiques
 * (css, js, images, etc.)
 */
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get('/personnages', async (req, res) => {
  pool.getConnection(function(err, connection) {
      if (err) throw err; 


      connection.query('SELECT * FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id', function (error, results, fields) {
          res.render ('personnages',
          {
            pageTitle: "Tes héros préférés",
            heros: results
          });


        connection.release();


        if (error) throw error;


      });
    });

});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});