require('dotenv').config();

const express = require('express');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const db = require('./config/database');
const handlers = require('./handlers');
const app = express();
const router = express.Router();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','PUT','POST','DELETE'],
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());


app.post('/register', (req, res) => {
    db.query(`SELECT * FROM users where email="${req.body.email}"`, function (error, results, fields) {
        if(error) return res.status(400).json({ status: 'email already used in registration'});
        console.log("hi");
        let saltRounds = 10
        let myString = 'req.body.password'
        db.query(`INSERT INTO users(name, email, password) VALUES("${req.body.name}","${req.body.email}", MD5("${myString}"))`, function (error, results, fields) {
            console.log('db login :', error, results, fields);
            if(error) return res.status(400).json({ status: `user could not be created due to sql errors: ${error}`});
            res.status(200).json({ status: 'user was successfully created' });  
        
                }); 
            });
         });

app.post('/login', (req, res)  =>{
    const crypto = req.body.password;
    db.query(`SELECT * FROM users where email="${req.body.email}" AND password="${crypto}"`, function (error, results, fields) {
        console.log('db login :', error, results.length, fields);
        if(error || !results.length) res.status(401).json({ error: 'user does not exist '});
        else {
            const signOptions = {
                expiresIn: '1d',
              };
            const { access_token, refresh_token } = generateTokens(req.body, signOptions);
            console.log('cheers: '. access_token);
            const cookieOptions = {
                httpOnly: true,
                expires: new Date(Date.now() + 900000),
                domain: '.app.localhost',
                sameSite: 'none'
            };
            res.cookie('access_token', access_token, {...cookieOptions})
            res.cookie('refresh_token', refresh_token, { ...cookieOptions, expires: new Date(Date.now() + 900000) });
            res.status(200).json({ ok: true });
        }
    });
});

// router.use('*',handlers);

let refreshTokens = []




// app.post('/token', (req, res) => {
//     const refresh_token = req.body.token
//     if (refresh_token == null) return res.status(401)
//     if (!refreshTokens.includes(refresh_token)) return res.status(403) 
//     jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//         if (err) return res.status(403)
//         const tokens = generateTokens(req.body);
//         res.json({...tokens});
//     });
// });

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//     res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
//     res.header("Access-Control-Allow-Headers", 'Content-Type');
//     next();
// });

app.post('/verify', (req, res)  =>{
    console.log('req headers: ', req.cookies);
    jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err,user) => { 
        if (err) return res.status(401).json({ error: 'invalid token' });
        return res.status(200).json({ error: '' });
    })
});

app.post('/refresh', (req, res)  =>{
    req.json(posts.filter(post => post.req.body === req.user.name))
    const tokens = generateTokens(req.body);
    console.log("success: ", process.env);
    console.log('accessToken: ', accessToken);
    res.setHeader('Set-Cookie', ['HttpOnly']);
    res.json({accessToken, refreshToken })
});

app.get('/miejsca', authenticateToken, function(req, res) {
    let records;
    console.log('req: ', req, req.signedCookies, req.cookies);
    db.query('SELECT * FROM miejsca', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        records = [...results];
        console.log('records: ', records);
       res.json(records);
      });
    //   db.end();
});

function generateTokens(data, options= {}) {
    const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, options);
    const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d'});
    refreshTokens.push(refresh_token);
    return { access_token, refresh_token };
}

function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => { 
    if (err) return res.sendStatus(401)
    req.user = user
    next()
})
}

app.listen(8000, function() {
    console.log('listen to port 8000: ');
});

// db.end();

module.exports = app;