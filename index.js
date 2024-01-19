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
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query('SELECT personnages.*, equipes.nom AS equipe_nom FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id', function (error, results, fields) {
        connection.release();

        if (error) {
          console.error(error);
          res.status(500).send("Erreur interne du serveur");
          return;
        }

        res.render('personnages', {
          pageTitle: "Tes héros",
          personnages: results,
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});


app.get('/create', (req, res) => {
  res.render('create', {
    pageTitle: "Créer un personnage et une équipe"
  });
});


app.post('/create', async (req, res) => {
  try {
    const { characterName, characterDescription } = req.body;

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query(
        'INSERT INTO personnages (nom, description) VALUES (?, ?)',
        [characterName, characterDescription],
        function (error, results, fields) {
          connection.release();

          if (error) {
            console.error(error);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

          res.redirect('/personnages');
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});


app.get('/personnages/:id', async (req, res) => {
  try {
    const personnageId = req.params.id;

    pool.getConnection(function(err, connection) {
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query(
        'SELECT personnages.*, equipes.nom AS equipe_nom FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id WHERE personnages.id = ?',
        [personnageId],
        function (error, results, fields) {
          connection.release();

          if (error) {
            console.error(error);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

          if (results.length === 0) {
           
            res.status(404).send("Personnage non trouvé");
            return;
          }

          const personnage = results[0];

          res.render('personnage_detail', {
            pageTitle: `Détail de ${personnage.nom}`,
            personnage: personnage,
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.get('/personnages/:id/delete', async (req, res) => {
  try {
    const personnageId = req.params.id;

    pool.getConnection(function(err, connection) {
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query(
        'DELETE FROM personnages WHERE id = ?',
        [personnageId],
        function (error, results, fields) {
          connection.release();

          if (error) {
            console.error(error);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

          res.redirect('/personnages');
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.get('/personnages/:id/edit', async (req, res) => {
  try {
    const personnageId = req.params.id;

    pool.getConnection(function(err, connection) {
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query(
        'SELECT personnages.*, equipes.nom AS equipe_nom FROM personnages JOIN equipes ON personnages.equipe_id = equipes.id WHERE personnages.id = ?',
        [personnageId],
        function (error, results, fields) {
          connection.release();

          if (error) {
            console.error(error);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

          if (results.length === 0) {
            res.status(404).send("Personnage non trouvé");
            return;
          }

          const personnage = results[0];

          res.render('edit_personnage', {
            pageTitle: `Modifier ${personnage.nom}`,
            personnage: personnage,
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.post('/personnages/:id/edit', async (req, res) => {
  try {
    const personnageId = req.params.id;
    const { characterName, teamName, characterDescription } = req.body;

    pool.getConnection(function (err, connection) {
      connection.beginTransaction(function (err) {
        if (err) {
          console.error(err);
          res.status(500).send("Erreur interne du serveur");
          return;
        }

        connection.query(
          'UPDATE personnages SET nom = ?, description = ? WHERE id = ?',
          [characterName, characterDescription, personnageId],
          function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                console.error(error);
                res.status(500).send("Erreur interne du serveur");
              });
            }

            connection.commit(function (err) {
              if (err) {
                return connection.rollback(function () {
                  console.error(err);
                  res.status(500).send("Erreur interne du serveur");
                });
              }

              res.redirect('/personnages/' + personnageId);

              connection.release();
            });
          }
        );
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.get('/equipes', async (req, res) => {
  try {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query('SELECT * FROM equipes', function (error, results, fields) {
        connection.release();

        if (error) {
          console.error(error);
          res.status(500).send("Erreur interne du serveur");
          return;
        }

        res.render('equipes', {
          pageTitle: "Liste des équipes",
          equipes: results,
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});


app.get('/create_equipe', (req, res) => {
  res.render('create_equipe', {
    pageTitle: "Créer une équipe"
  });
});


app.post('/create_equipe', async (req, res) => {
  try {
    const { teamName } = req.body;

    pool.getConnection(function (err, connection) {
      connection.beginTransaction(function (err) {
        if (err) {
          console.error(err);
          res.status(500).send("Erreur interne du serveur");
          return;
        }

        connection.query(
          'INSERT INTO equipes (nom) VALUES (?)',
          [teamName],
          function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                console.error(error);
                res.status(500).send("Erreur interne du serveur");
              });
            }

            connection.commit(function (err) {
              if (err) {
                return connection.rollback(function () {
                  console.error(err);
                  res.status(500).send("Erreur interne du serveur");
                });
              }

              res.redirect('/equipes');

              connection.release();
            });
          }
        );
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});


app.get('/assignation', async (req, res) => {
  try {
    pool.getConnection(function(err, connection) {
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query('SELECT * FROM personnages', function (errorPersonnages, resultsPersonnages, fieldsPersonnages) {
        if (errorPersonnages) {
          connection.release();
          console.error(errorPersonnages);
          res.status(500).send("Erreur interne du serveur");
          return;
        }

        connection.query('SELECT * FROM equipes', function (errorEquipes, resultsEquipes, fieldsEquipes) {
          connection.release(); 

          if (errorEquipes) {
            console.error(errorEquipes);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

         
          res.render('assignation', {
            pageTitle: "Assigner un personnage à une équipe",
            personnages: resultsPersonnages,
            equipes: resultsEquipes,
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.post('/assignation_equipe', async (req, res) => {
  try {
    const { personnageId, equipeId } = req.body;

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
        return;
      }

      connection.query(
        'UPDATE personnages SET equipe_id = ? WHERE id = ?',
        [equipeId, personnageId],
        function (error, results, fields) {
          connection.release();

          if (error) {
            console.error(error);
            res.status(500).send("Erreur interne du serveur");
            return;
          }

          res.redirect('/assignation');
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
