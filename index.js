const express = require("express");
const mustacheExpress = require("mustache-express");
const app = express();
const pool = require("./database");

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get('/personnages', async (req, res) => {
  try {
    pool.getConnection(function(err, connection) {
      connection.query(
        'SELECT * FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id',
        function (error, results, fields) {
          if (error) {
            console.error(error);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

          res.render('personnages', {
            pageTitle: "Tes héros ",
            personnages: results[0],
          });

          connection.release();
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
    console.log("erreur de connexion", error);
  }
});

app.get('/personnages/:id', async (req, res) => {
  const personnageId = req.params.id;

  try {
    pool.getConnection(function(err, connection) {
      connection.query(
        'SELECT * FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id WHERE personnages.id = ?',
        [personnageId],
        function (error, results, fields) {
          if (error) {
            console.error(error);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

          if (results.length === 0) {
           
            res.status(404).send("Personnage non trouvé");
            return;
          }

          res.render('personnage_detail', {
            pageTitle: "Détail du personnage",
            personnages: results[0],
          });

          connection.release();
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
    console.log("erreur de connexion", error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
