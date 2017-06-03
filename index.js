'use strict';

const firebase = require('firebase-admin');
// let Promise = require('promise');
// let escape = require('escape-html');
// let serviceAccount = require('./secrets.json');
const serviceAccount = require('./config/serviceAccount.js');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://forward-vial-168614.firebaseio.com'
});

const express = require('express');
let app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', (req, res) => {
  res.json({ foo: 'bar' });
});

let data = {};
firebase.database().ref('/')
  .on('value',
    (snapshot) => {
      data = snapshot.val();
    });

app.get('/api/all', (req, res) => {
  res.json(data);
});

app.get('/api/shortest', (req, res) => {
  console.log(JSON.stringify(res.query, null, 2));
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
