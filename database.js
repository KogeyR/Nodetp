// Importer le module MySQL
// Créer une connexion à la base de données en utilisant les paramètres de connexion
// https://www.npmjs.com/package/mysql#introduction

// Établir la connexion à la base de données

// Exporter la connexion pour pouvoir l'utiliser dans d'autres modules
const mysql = require("mysql");

let pool  = mysql.createPool({
  connectionLimit : 10,
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'marvel'
});



 module.exports = pool;


