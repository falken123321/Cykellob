const firebase = require("firebase");
require("firebase/firestore");

var firebaseConfig = {
    apiKey: "AIzaSyBBxslBfendMHK7tGkq68adUArNCXpqNkQ",
    authDomain: "cykellob-37438.firebaseapp.com",
    databaseURL: "https://cykellob-37438.firebaseio.com",
    projectId: "cykellob-37438",
    storageBucket: "cykellob-37438.appspot.com",
    messagingSenderId: "888933838385",
    appId: "1:888933838385:web:5137ebe22ce491f6f16f10",
    measurementId: "G-PSH3JG1X9C"
};

  firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

/*

db.collection("users").add({
    first: "Ada",
    last: "Lovelace",
    born: 1815
})
.then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
})
.catch(function(error) {
    console.error("Error adding document: ", error);
});

*/


var docRef = db.collection("Cykelløb").doc("001");

docRef.get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data());
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
});