var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'db4free.net:3306',
  user     : 'marek1996 ',
  password : 'marek-1996',
  database : 'mytickets'
});
 
db.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

module.exports = db; 