'use strict';

let firebase = require('firebase-admin');
// let Promise = require('promise');
// let escape = require('escape-html');
// let serviceAccount = require('./secrets.json');
const serviceAccount = require('./config/serviceAccount.js');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://forward-vial-168614.firebaseio.com'
});

let express = require('express');
let app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', (request, response) => {
  response.json({ foo: 'bar' });
});

app.get('/api/all', (request, response) => {
  firebase.database().ref('/')
    .on('value',
      (snapshot) => {
        response.json(snapshot.val());
      },
      (error) => {
        response.json({ error: error.code });
      });
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
