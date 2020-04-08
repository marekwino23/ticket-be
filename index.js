const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const handlers = require('./handlers');
const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
// router.use('*',handlers);
app.get('/miejsca', function(req, res) {
    console.error(req);
    let records;
    db.query('SELECT * FROM miejsca', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        records = [...results];
        console.log('records: ', records);
       res.json(records);
      });
    //   db.end();
});

app.listen(3000, function() {
    console.log('listen to port 3000: ');
});

// db.end();

module.exports = app;