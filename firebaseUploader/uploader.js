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
    elapsed_time,
    OmgangeTotal: FieldValue.increment(1),
    Omgange: FieldValue.arrayUnion(timeStamp2),
},{ merge: true })
.catch(function(error) {
    console.error("Error adding document: ", error);
});
}

