/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START imports]
var firebase = require('firebase-admin');
// [END imports]
//var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var Promise = require('promise');
var escape = require('escape-html');

// TODO(DEVELOPER): Configure your email transport.
// Configure the email transport using the default SMTP transport and a GMail account.
// See: https://nodemailer.com/
// For other types of transports (Amazon SES, Sendgrid...) see https://nodemailer.com/2-0-0-beta/setup-transporter/
//var mailTransport = nodemailer.createTransport('smtps://<user>%40gmail.com:<password>@smtp.gmail.com');

// TODO(DEVELOPER): Change the two placeholders below.
// [START initialize]
// Initialize the app with a service account, granting admin privileges
var serviceAccount = require('./secrets.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://test-d7763.firebaseio.com'
});
// [END initialize]

/**
 * Send a new star notification email to the user with the given UID.
 */
// [START single_value_read]
//function sendNotificationToUser(uid, postId) {
  //// Fetch the user's email.
  //var userRef = firebase.database().ref('/users/' + uid);
  //userRef.once('value').then(function(snapshot) {
    //var email = snapshot.val().email;
    //// Send the email to the user.
    //// [START_EXCLUDE]
    //if (email) {
      //sendNotificationEmail(email).then(function() {
        //// Save the date at which we sent that notification.
        //// [START write_fan_out]
        //var update = {};
        //update['/posts/' + postId + '/lastNotificationTimestamp'] =
            //firebase.database.ServerValue.TIMESTAMP;
        //update['/user-posts/' + uid + '/' + postId + '/lastNotificationTimestamp'] =
            //firebase.database.ServerValue.TIMESTAMP;
        //firebase.database().ref().update(update);
        //// [END write_fan_out]
      //});
    //}
    //// [END_EXCLUDE]
  //}).catch(function(error) {
    //console.log('Failed to send notification to user:', error);
  //});
//}
// [END single_value_read]


/**
 * Send the new star notification email to the given email.
 */
//function sendNotificationEmail(email) {
  //var mailOptions = {
    //from: '"Firebase Database Quickstart" <noreply@firebase.com>',
    //to: email,
    //subject: 'New star!',
    //text: 'One of your posts has received a new star!'
  //};
  //return mailTransport.sendMail(mailOptions).then(function() {
    //console.log('New star email notification sent to: ' + email);
  //});
//}

/**
 * Update the star count.
 */
// [START post_stars_transaction]
//function updateStarCount(postRef) {
  //postRef.transaction(function(post) {
    //if (post) {
      //post.starCount = post.stars ? Object.keys(post.stars).length : 0;
    //}
    //return post;
  //});
//}
// [END post_stars_transaction]

/**
 * Keep the likes count updated and send email notifications for new likes.
 */
//function startListeners() {
  //firebase.database().ref('/posts').on('child_added', function(postSnapshot) {
    //var postReference = postSnapshot.ref;
    //var uid = postSnapshot.val().uid;
    //var postId = postSnapshot.key;
    //// Update the star count.
    //// [START post_value_event_listener]
    //postReference.child('stars').on('value', function(dataSnapshot) {
      //updateStarCount(postReference);
      //// [START_EXCLUDE]
      //updateStarCount(firebase.database().ref('user-posts/' + uid + '/' + postId));
      //// [END_EXCLUDE]
    //}, function(error) {
      //console.log('Failed to add "value" listener at /posts/' + postId + '/stars node:', error);
    //});
    //// [END post_value_event_listener]
    //// Send email to author when a new star is received.
    //// [START child_event_listener_recycler]
    //postReference.child('stars').on('child_added', function(dataSnapshot) {
      //sendNotificationToUser(uid, postId);
    //}, function(error) {
      //console.log('Failed to add "child_added" listener at /posts/' + postId + '/stars node:', error);
    //});
    //// [END child_event_listener_recycler]
  //});
  //console.log('New star notifier started...');
  //console.log('Likes count updater started...');
//}

/**
 * Send an email listing the top posts every Sunday.
 */
//function startWeeklyTopPostEmailer() {
  //// Run this job every Sunday at 2:30pm.
  //schedule.scheduleJob({hour: 14, minute: 30, dayOfWeek: 0}, function () {
    //// List the top 5 posts.
    //// [START top_posts_query]
    //var topPostsRef = firebase.database().ref('/posts').orderByChild('starCount').limitToLast(5);
    //// [END top_posts_query]
    //var allUserRef = firebase.database().ref('/users');
    //Promise.all([topPostsRef.once('value'), allUserRef.once('value')]).then(function(resp) {
      //var topPosts = resp[0].val();
      //var allUsers = resp[1].val();
      //var emailText = createWeeklyTopPostsEmailHtml(topPosts);
      //sendWeeklyTopPostEmail(allUsers, emailText);
    //}).catch(function(error) {
      //console.log('Failed to start weekly top posts emailer:', error);
    //});
  //});
  //console.log('Weekly top posts emailer started...');
//}

/**
 * Sends the weekly top post email to all users in the given `users` object.
 */
//function sendWeeklyTopPostEmail(users, emailHtml) {
  //Object.keys(users).forEach(function(uid) {
    //var user = users[uid];
    //if (user.email) {
      //var mailOptions = {
        //from: '"Firebase Database Quickstart" <noreply@firebase.com>',
        //to: user.email,
        //subject: 'This week\'s top posts!',
        //html: emailHtml
      //};
      //mailTransport.sendMail(mailOptions).then(function() {
        //console.log('Weekly top posts email sent to: ' + user.email);
        //// Save the date at which we sent the weekly email.
        //// [START basic_write]
        //return firebase.database().child('/users/' + uid + '/lastSentWeeklyTimestamp')
            //.set(firebase.database.ServerValue.TIMESTAMP);
        //// [END basic_write]
      //}).catch(function(error) {
        //console.log('Failed to send weekly top posts email:', error);
      //});
    //}
  //});
//}

/**
 * Creates the text for the weekly top posts email given an Object of top posts.
 */
//function createWeeklyTopPostsEmailHtml(topPosts) {
  //var emailHtml = '<h1>Here are this week\'s top posts:</h1>';
  //Object.keys(topPosts).forEach(function(postId) {
    //var post = topPosts[postId];
    //emailHtml += '<h2>' + escape(post.title) + '</h2><div>Author: ' + escape(post.author) +
        //'</div><div>Stars: ' + escape(post.starCount) + '</div><p>' + escape(post.body) + '</p>';
  //});
  //return emailHtml;
//}

// Start the server.
//startListeners();
//startWeeklyTopPostEmailer();

//function writeUserData(userId, name, email, imageUrl) {
  //firebase.database().ref('users/' + userId).set({
    //username: name,
    //email: email,
    //profile_picture : imageUrl
  //});
//}

//writeUserData('userA', 'nameA', 'emailA', 'imageA');

var rbush = require('rbush');

var W = 700;

function randBox(size) {
    var x = Math.random() * (W - size),
        y = Math.random() * (W - size);
    return {
        minX: x,
        minY: y,
        maxX: x + size * Math.random(),
        maxY: y + size * Math.random()
    };
}

function randClusterPoint(dist) {
    var x = dist + Math.random() * (W - dist * 2),
        y = dist + Math.random() * (W - dist * 2);
    return {x: x, y: y};
}

function randClusterBox(cluster, dist, size) {
    var x = cluster.x - dist + 2 * dist * (Math.random() + Math.random() + Math.random()) / 3,
        y = cluster.y - dist + 2 * dist * (Math.random() + Math.random() + Math.random()) / 3;

    return {
        minX: x,
        minY: y,
        maxX: x + size * Math.random(),
        maxY: y + size * Math.random(),
        item: true
    };
}

var colors = ['#f40', '#0b0', '#37f'],
    rects;

function drawTree(node, level) {
    if (!node) { return; }

    var rect = [];

    rect.push(level ? colors[(node.height - 1) % colors.length] : 'grey');
    rect.push(level ? 1 / Math.pow(level, 1.2) : 0.2);
    rect.push([
        Math.round(node.minX),
        Math.round(node.minY),
        Math.round(node.maxX - node.minX),
        Math.round(node.maxY - node.minY)
    ]);

    rects.push(rect);

    if (node.leaf) return;
    if (level === 6) { return; }

    for (var i = 0; i < node.children.length; i++) {
        drawTree(node.children[i], level + 1);
    }
}

function draw() {
    //rects = [];
    //drawTree(tree.data, 0);

    //ctx.clearRect(0, 0, W + 1, W + 1);

    //for (var i = rects.length - 1; i >= 0; i--) {
        //ctx.strokeStyle = rects[i][0];
        //ctx.globalAlpha = rects[i][1];
        //ctx.strokeRect.apply(ctx, rects[i][2]);
    //}
}

function search(e) {
    console.time('1 pixel search');
    tree.search({
        minX: e.clientX,
        minY: e.clientY,
        maxX: e.clientX + 1,
        maxY: e.clientY + 1
    });
    console.timeEnd('1 pixel search');
}

function remove() {
    data.sort(tree.compareMinX);
    console.time('remove 10000');
    for (var i = 0; i < 10000; i++) {
        tree.remove(data[i]);
    }
    console.timeEnd('remove 10000');

    data.splice(0, 10000);

    draw();
};

var N = 100000,
    M = 30,
    R = 100;

function genData(N, M, R) {
    var data = [];
    for (var i = 0; i < M; i++) {
        var cluster = randClusterPoint(R);
        var size = Math.min(Math.ceil(N / M), N - data.length);

        for (var j = 0; j < size; j++) {
            data.push(randClusterBox(cluster, R, 1));
        }
    }
    return data;
}

var tree = rbush(16);
var data = [];

genBulkInsert(N, M)();

function genInsertOneByOne(K, M) {
    return function () {
        var data2 = genData(K, M, R);

        console.time('insert ' + K + ' items');
        for (var i = 0; i < K; i++) {
            tree.insert(data2[i]);
        }
        console.timeEnd('insert ' + K + ' items');

        data = data.concat(data2);

        draw();
    };
}

function genBulkInsert(K, M) {
    return function () {
        var data2 = genData(K, M, R);

        console.time('bulk-insert ' + K + ' items');
        tree.load(data2);
        console.timeEnd('bulk-insert ' + K + ' items');

        data = data.concat(data2);

        draw();
    };
}

//console.log(tree.toJSON())

firebase.database().ref('tree').set(tree.toJSON());

