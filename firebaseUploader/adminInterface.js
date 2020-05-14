let scannerID = process.argv.slice(1);
console.log("Scanner id: " + scannerID);



const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// Change the serial port to fit your serup
// on linux the device could look like this: "/dev/tty-usbserial1"
//const serialPortName = "/dev/tty.usbmodem14101";
//const serialPortName = "/dev/tty.usbserial-D306EO60";
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const serialPortName = "/dev/tty.usbserial-D306E0KB";
const portOptions = {
    baudRate: 115200
};
const port = new SerialPort(serialPortName, portOptions);

// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message)
});


//Configure firebase setup
let admin = require("firebase-admin");
let serviceAccount = require("./serviceAccountKey.json");

let app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cykellob-37438.firebaseio.com"
});


let db = admin.firestore();





rl.question('Hvad er dit navn? ', (navn) => {
    rl.question('Hvilken klasse går du i? ', (klasse) => {
        rl.question('Hvad er dit nummer? ', (løbenummer) => {


            rl.close();
            console.log();
            console.log();
            console.log();
            console.log();
            console.log();

            console.log("Navn:\t\t" + navn);
            console.log("Klasse:\t\t" + klasse);
            console.log("Nummer:\t" + løbenummer);


            const stamOplysninger = {
                navn,
                klasse,
                løbenummer,
            }
            scanTagAndUpload(stamOplysninger);

        })
    })
});


function scanTagAndUpload(stamOplysninger) {


    const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

    parser.on("data", doSomethingWithData);

    function doSomethingWithData(data) {
        // parse json data
        console.log(data);
        const obj = JSON.parse(data);
        const oplysninger = {
            Name: stamOplysninger.navn,
            Klasse: stamOplysninger.klasse,
            Nummer: stamOplysninger.løbenummer,
            tagEpc: obj.epc,
            OmgangeTotal: 0,
            Omgange: [],
            scannerID,
        }
        port.close();
        uploadToFirebase(oplysninger);
    }
}




function uploadToFirebase(obj) {
    console.log(obj);


    //Update firebase
    db.collection("Cykelløb")
        .doc(obj.tagEpc)
        .set(obj, { merge: true })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}



/*
//Configure firebase setup
let admin = require("firebase-admin");
let serviceAccount = require("./serviceAccountKey.json");

let app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cykellob-37438.firebaseio.com"
  });


  let db = admin.firestore();

  FieldValue = admin.firestore.FieldValue;
  Timestamp = admin.firestore.Timestamp;


//Configure serial port setup
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

// Change the serial port to fit your serup
// on linux the device could look like this: "/dev/tty-usbserial1"
//const serialPortName = "/dev/tty.usbmodem14101";
//const serialPortName = "/dev/tty.usbserial-D306EO60";
const serialPortName = "/dev/tty.usbserial-D306E0KB";
const portOptions = {
  baudRate: 115200
};
const port = new SerialPort(serialPortName, portOptions);

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
});

const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

parser.on("data", doSomethingWithData);

// Callback function for processing the received data
function doSomethingWithData(data) {

  // parse json data
  const obj = JSON.parse(data);

  // print object
  console.log("Parsed object:");
  console.log(obj);

  console.log("Contents of object property:");

  console.log("--- data processing done -------------------");
  const updateTime = Timestamp.now();
  var tagEpc = obj.epc;
  var scannedTags = obj.scannedTags;
  var elapsed_time = obj.elapsed_time;
  var Name = "test";
  var Klasse = "1";
  var Nummer = "99";

  const timeStamp2 = {
    elapsed_time,
    timeStamp: updateTime,
  }

  //Update firebase
  db.collection("Cykelløb").doc(tagEpc).set({
    Name,
    Klasse,
    Nummer,
    tagEpc,
    scannedTags,
    OmgangeTotal: FieldValue.increment(1),
    Omgange: FieldValue.arrayUnion(timeStamp2),
},{ merge: true })
.catch(function(error) {
    console.error("Error adding document: ", error);
});
}

*/