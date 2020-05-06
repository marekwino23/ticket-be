require('dotenv').config();

const express = require('express');
const bcrypt = require("bcrypt");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const db = require('./config/database');
const handlers = require('./handlers');
const app = express();
const router = express.Router();

app.use(cors({
    //origin: 'http://localhost:3000',
    origin: 'https://cinema-tickets.netlify.app',
    //methods: ['GET','PUT','POST','DELETE'],
    credentials: true
}));

app.use(cookieParser());

app.get('/movies', function(req, res) {
    let records;
    console.log('req: ', req, req.cookies);
    db.query('SELECT * FROM filmy', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        records = [...results];
        console.log('records: ', records);
       res.json(records);
      });
});

app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        console.log('cheers: ', req.body);
        const { name, email, password } = req.body;
        await db.query(`SELECT * FROM users where email="${email}"`, async function (error, results, fields) {
        if(error || results.length) return res.status(400).json({ status: 'email already used in registration'});
        const hash = await bcrypt.hash(password, 10);
        // await db('users').insert({email: email, hash: hash});
        await db.query(`INSERT INTO users(name, email, password) VALUES("${name}","${email}", "${hash}")`, function (error, results, fields) {
            console.log('db login :', error, results, fields);
            if(error) return res.status(400).json({ status: `user could not be created due to sql errors: ${error}`});
           res.status(200).json({ status: 'success' });  
        }); 
    });
    } catch(error) {
        res.status(500).json({ error: `something went wrong: ${error.message}`});
    }
});

app.post('/login', async (req, res)=> {

    try {
        const { email, password } = req.body;
        //const user = await db('users').first('*').where({ email });
        await db.query(`SELECT password FROM users where email="${email}"`, async function (error, results, fields) {
        if(error || !results.length) return res.status(401).json({ status: 'email already used in registration'});
        if(results.length) {
            const validPass = await bcrypt.compare(password, results[0].password);
            console.log('valid: ', validPass);
            if(validPass) {
                const signOptions = {
                    expiresIn: '1d',
                  };
                const { access_token, refresh_token } = generateTokens(req.body, signOptions);
            const week = 7 * 24 * 3600 * 1000; //1 weeks  
            const cookieOptions = {
                httpOnly: true,
                secure: true,
                expires: new Date(Date.now() + week),
                //domain: '.app.localhost',
                domain: '.netlify.app',
                sameSite: 'None'
            };
            res.cookie('access_token', access_token, {...cookieOptions})
            res.cookie('refresh_token', refresh_token, { ...cookieOptions, expires: new Date(Date.now() + (week * 4)) }); 
            res.status(200).json({ ok: true });
            } else {
                res.send(400).json({ status: 'fail' });
            }
        }
    });
    } catch(error) {
        res.status(500).json({ error: `something went wrong: ${error.message}`});
    }
});

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

app.listen(process.env.PORT || 8000, function() {
    console.log('listen to port 8000: ');
});

module.exports = app;
