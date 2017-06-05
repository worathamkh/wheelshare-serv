'use strict'

const _ = require('lodash')

const firebase = require('firebase-admin')
// let Promise = require('promise');
// let escape = require('escape-html');
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
let smap// = new Graph()

let app = express()

app.set('port', (process.env.PORT || 5000))
app.set('json spaces', 2)

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
  .on('value', (snapshot) => {
    console.log('data loaded')
    data = snapshot.val()
    data.paths = data.paths.map(p => {
      if (_.isEmpty(p.safety)) {
        p.safety = 3
      } else {
        let n = _.size(p.safety)
        let sum = _.reduce(p.safety, (acc, each, key) => {
          acc += each.value
          return acc
        }, 0)
        let avg = sum / n
        p.safety = avg
      }
      return p
    })
    dmap = new Graph()
    smap = new Graph()
    data.vertices.forEach((v) => {
      let dadj = {}
      let sadj = {}
      if (!v.adjPaths) {
        return
      }
      v.adjPaths.forEach((pid) => {
        for (let i = 0; i < data.paths.length; i++) {
          let q = data.paths[i];
          if (pid == q.id) {
            if (q.run[0].id == v.id) {
              dadj[encId(q.run[1].id)] = q.distance
              sadj[encId(q.run[1].id)] = 4 - q.safety
            } else {
              dadj[encId(q.run[0].id)] = q.distance
              sadj[encId(q.run[0].id)] = 4 - q.safety
            }
            break
          }
        }
      })
      let id = encId(v.id)
      console.log('adding node ', id);
      console.log('dadj: ', JSON.stringify(dadj, null, 2))
      dmap.addNode(id, dadj)
      smap.addNode(id, sadj)
    })
    console.log('data processed')
  })

app.get('/', (req, res) => {
  res.send('Hi')
})

app.get('/api/all', (req, res) => {
  res.json(data)
})

app.get('/api/path/:id', (req, res) => {
  firebase.database().ref('/paths').once('value')
    .then(snapshot => {
      res.json(_.find(snapshot.val(), p => {
        return p.id == req.params.id
      }))
    })
    .catch(error => {
      res.sendStatus(400)
    })
})

app.get('/api/shortest/:prop', (req, res) => {
  let map
  if (req.params.prop == 'safety') {
    map = smap
  } else {
    map = dmap
  }
  let s = map.path(encId(req.query.from),
                   encId(req.query.to),
                   { cost: true })
  let paths = []
  if (s.path) {
    for (let i = 0; i < s.path.length-1; i++) {
      // s.path[i] is a vertex
      paths.push(hashCode((s.path[i] * s.path[i+1]).toString()))
    }
  }
  res.json({
    prop: req.params.prop,
    paths: paths,
    cost: s.cost
  })
})

/*
 * req.params.prop = prop to add value
 * req.query = {
 *   pathId: path id
 *   userId: user id
 *   value: value to be added
 * }
 */
app.get('/api/add/:prop', (req, res) => {
  let hit = false;
  if (req.query.pass == 'hello' &&
      (req.params.prop == 'safety' || req.params.prop == 'slope')) {
    for (let i = 0; i < data.paths.length; i++) {
      if (data.paths[i].id == req.query.pathId) {
        firebase.database().ref()
          .child('paths').child(i).child(req.params.prop).child(req.query.userId)
          .set({ 
            //userId: req.query.userId,
            value: parseInt(req.query.value)
          })
          .then(() => {
            res.sendStatus(200)
          })
          .catch((error) => {
            res.sendStatus(400)
          })
        hit = true
        break
      }
    }
  }
  if (!hit) {
    res.sendStatus(400)
  }
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
