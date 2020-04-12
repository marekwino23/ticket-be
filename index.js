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
app.get('/miejsca', authenticateToken, function(req, res) {
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

let refreshTokens = []

app.post('/token', (req, res) => {
const refresh_token = req.body.token
if (refreshToken == null) return res.sendStatus(401)
if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403) 
jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
if (err) return res.sendStatus(403)
const tokens = generateTokens(req.body);
res.json({...tokens});
 })
})


app.post('/login', (req, res)  =>{
    const crypto = req.body.password;
    db.query(`SELECT * FROM users where email="${req.body.email}" AND password="${crypto}"`, function (error, results, fields) {
        console.log('db login :', error, results.length, fields);
        if(error || !results.length) res.status(401).json({ error: 'user does not exist '});
        else {
            const tokens = generateTokens(req.body);
    console.log('tokens: ', tokens);
        res.setHeader('Set-Cookie', ['HttpOnly']);
        res.json({...tokens});
        }
    });
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", 'Content-Type');
    next();
})

app.post('/verify', (req, res)  =>{
    jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err,user) => { 
        if (err) return res.status(401).json({ error: 'invalid token' });
        return res.status(200).json({ error: '' });
    })
});

app.post('/refreshToken', (req, res)  =>{
    //req.json(posts.filter(post => post.req.body === req.user.name))
    const tokens = generateTokens(req.body);
    console.log("success: ", process.env);
    console.log('accessToken: ', accessToken);
    res.setHeader('Set-Cookie', ['HttpOnly']);
    res.json({accessToken, refreshToken })
});


function generateTokens(data) {
    const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);
    const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refresh_token)
    return { access_token, refresh_token };
}

function authenticateToken(req, res, nex){
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => { 
    if (err) return res.sendStatus(401)
    req.user = user
    next()
})
}

function generateAccessToken(user){
    return jwt.sign(req.body, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s'})  
}

app.listen(8000, function() {
    console.log('listen to port 8000: ');
});

// db.end();

module.exports = app;