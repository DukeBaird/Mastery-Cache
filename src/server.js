
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();

app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(app.get('port'), () => {
    console.log('Server running on localhost:' + app.get('port') + '/');
});