
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import api from './api.js';

const app = express();

app.set('port', (process.env.PORT || 8080));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());

app.use('/api/v1', api.router);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/setup', (req, res) => {
    res.render('setup');
});
app.get('/game', (req, res) => {
    res.render('game');
});
app.get('/gameOver', (req, res) => {
    res.render('gameOver');
});

app.listen(app.get('port'), () => {
    console.log('Server running on localhost:' + app.get('port') + '/');
});