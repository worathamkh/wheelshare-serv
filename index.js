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

// distance map
let dmap// = new Graph()
// safety map
//const smap = new Graph()

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

function hashCode(str){
  let hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
function encId(id) {
  return id.toString()

  let str = ''
  if (id < 0) {
    str += 'b'
  } else {
    str += 'a'
  }
  let idstr = id.toString()
  for (let i = 0; i < idstr.length; i++) {
    if (idstr[i] == '-') {
      continue
    }
    str += String.fromCharCode('a'.charCodeAt(0) + parseInt(idstr[i]))
  }
  return str
}

function decId(str) {
  return parseInt(str)

  let idstr = ''
  if (str[0] == 'b') {
    idstr += '-'
  }
  for (let i = 1; i < str.length; i++) {
    idstr += String.fromCharCode(str[i].charCodeAt(0) - 'a'.charCodeAt(0))
  }
  let id = parseInt(idstr)
  return id
}

let data = {}
firebase.database().ref('/')
  .on('value',
    (snapshot) => {
      console.log('data loaded')
      data = snapshot.val()
      dmap = new Graph()
      data.vertices.forEach((v) => {
        let dadj = {}
        // let sadj = {}
        v.adjPaths.forEach((pid) => {
          for (let i = 0; i < data.paths.length; i++) {
            let q = data.paths[i];
            // console.log(pid, '==', q.id, pid == q.id)
            if (pid == q.id) {
              if (q.run[0].id == v.id) {
                // console.log('dadj[' + encId(q.run[1].id) + '] = ' + q.distance)
                dadj[encId(q.run[1].id)] = q.distance
                // sadj[encId(q.run[1].id)] = q.safety
              } else {
                // console.log('dadj[' + encId(q.run[0].id) + '] = ' + q.distance)
                dadj[encId(q.run[0].id)] = q.distance
                // sadj[encId(q.run[0].id)] = q.safety
              }
              break
            }
          }
        })
        let id = encId(v.id)
        console.log('adding node ', id);
        console.log('dadj: ', JSON.stringify(dadj, null, 2))
        dmap.addNode(id, dadj)
        // smap.addNode(id, sadj)
      })
    })

app.get('/api/all', (req, res) => {
  res.json(data)
})

app.get('/api/shortest', (req, res) => {
  let s = dmap.path(
    encId(req.query.from),
    encId(req.query.to),
    {
      cost: true
    })
  let paths = []
  if (s.path) {
      for (let i = 0; i < s.path.length-1; i++) {
        // s.path[i] is a vertex
        paths.push(hashCode((s.path[i] * s.path[i+1]).toString()))
      }
  }
  res.json({
    paths: paths,
    cost: s.cost
  })
})

app.get('/api/edit', (req, res) => {
  let success = false
  if (req.query.pass == 'hello') {
    for (let i = 0; i < data.paths.length; i++) {
      if (data.paths[i].id == req.query.id) {
        firebase.database().ref('/paths/' + i + '/safety').set(parseInt(req.query.safety))
        success = true
        break
      }
    }
  }
  res.json({success})
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
