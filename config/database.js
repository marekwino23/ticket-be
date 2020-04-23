var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'https://sheltered-oasis-25992.herokuapp.com',
  user     : 'root',
  password : '',
  database : 'mydb'
});
 
db.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

module.exports = db; 