'use strict'

const firebase = require('firebase-admin')
// let Promise = require('promise');
// let escape = require('escape-html');
// let serviceAccount = require('./secrets.json');
const serviceAccount = require('./config/serviceAccount.js')
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://forward-vial-168614.firebaseio.com'
})

const express = require('express')
const Graph = require('node-dijkstra')

const map = new Graph()

// route.addNode('A', { B: 1 })
// route.addNode('B', { A: 1, C: 2, D: 4 })
// route.addNode('C', { B: 2, D: 1 })
// route.addNode('D', { C: 1, B: 4 })
//
// route.path('A', 'D') // => [ 'A', 'B', 'C', 'D' ]

let app = express()

app.set('port', (process.env.PORT || 5000))
app.set('json spaces', 2)

app.get('/', (req, res) => {
  res.json({ foo: 'bar' })
})

let data = {}
firebase.database().ref('/')
  .on('value',
    (snapshot) => {
      data = snapshot.val()
      // data.vertices.forEach((v) => {
      //   let adj = {}
      //   v.adjPaths
      //   map.addNode(v.id.toString(), v.adjPaths.map((p) => {
      //     let e = data.paths.find(q => return p.id == q.id)
      //   }))
      // })
    })

app.get('/api/all', (req, res) => {
  res.json(data)
})

app.get('/api/shortest', (req, res) => {
  console.log(JSON.stringify(res.query, null, 2))
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
