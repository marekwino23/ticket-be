require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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



app.post('/login', authenticateToken, (req, res)  =>{
    req.json(posts.filter(post => post.req.body === req.user.name))
    console.log("success: ", process.env);
    const accessToken = jwt.sign(req.body, process.env.ACCESS_TOKEN_SECRET);
    console.log('accessToken: ', accessToken);
    res.setHeader('Set-Cookie', ['HttpOnly']);
    res.json({accessToken: accessToken})
});

function authenticateToken(req, res, nex){
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(' ')[1]
    if(token == nulll) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => { 
    if (err) return res.sendStatus(401)
    req.user = user
    next()
})
}

app.listen(4000, function() {
    console.log('listen to port 4000: ');
});

// db.end();

module.exports = app;