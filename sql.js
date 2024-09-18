const mysql = require('mysql2');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '12345',
    database : 'dealsdray',
    charset:'utf8mb4',

  });
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);

      return;
    }
   
    console.log('database connected successfully');
  });
  module.exports.connection=connection;
