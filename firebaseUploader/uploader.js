//Configure firebase setup
let admin = require("firebase-admin");
let serviceAccount = require("./serviceAccountKey.json");

let app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cykellob-37438.firebaseio.com"
  });


  let db = admin.firestore();


    

//Configure serial port setup
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

// Change the serial port to fit your serup
// on linux the device could look like this: "/dev/tty-usbserial1"
//const serialPortName = "/dev/tty.usbmodem14101";
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
  console.log("--- Line received on serial port ------------");
  console.log('Raw data: ', data);

  // parse json data
  const obj = JSON.parse(data);

  // print object
  console.log("Parsed object:");
  console.log(obj);

  console.log("Contents of object property:");
  console.log(obj.tagId);
  console.log("--- data processing done -------------------");
  var tagNummer = obj.tagId;



  //Update firebase
  db.collection("Cykelløb").doc(tagNummer).set({
    obj 
},{ merge: true })
.then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
})
.catch(function(error) {
    console.error("Error adding document: ", error);
});
}













//Wait function

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }