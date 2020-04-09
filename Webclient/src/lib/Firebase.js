import firebase from "firebase";

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

export default firebase;

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

// export default docRef;