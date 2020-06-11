let processArgList = process.argv.slice(2);
let scannerID = processArgList[0];
console.log("Scanner id: " + scannerID);


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
//const serialPortName = "/dev/tty.usbserial-D306EKB";usbserial-D306EO60
const serialPortName = "/dev/cu.usbserial-D306EO60";
const portOptions = {
    baudRate: 115200
};
const port = new SerialPort(serialPortName, portOptions);

// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message)
});

const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

parser.on("data", uploadToFirebase);



// Callback function for processing the received data
async function uploadToFirebase(data) {
    // parse json data
    const obj = JSON.parse(data);



    let shouldNotUpload = await isScannerIDSame(obj.epc);

    // TURN THIS ON AT REAL RACE WITH 2 SENSORS
    if (shouldNotUpload) {
        console.log("Discarding data");
        return;
    }


    // print object
    console.log("Parsed object:");
    console.log(obj);

    console.log("Contents of object property:");

    console.log("--- data processing done -------------------");
    const updateTime = Timestamp.now();
    var tagEpc = obj.epc;
    var scannedTags = obj.scannedTags;
    var elapsed_time = obj.elapsed_time;


    const timeStamp2 = {
        elapsed_time,
        timeStamp: updateTime,
    }

    //Update firebase
    db.collection("Cykelløb").doc(tagEpc).set({
            tagEpc,
            scannedTags,
            OmgangeTotal: FieldValue.increment(1),
            Omgange: FieldValue.arrayUnion(timeStamp2),
            lastScannerID: scannerID,
        }, { merge: true })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}


async function isScannerIDSame(epc) {
    console.log(epc)
    try {
        const doc = await db.collection("Cykelløb").doc(epc).get();
        if (!doc.exists) {
            console.log('No such document!');
            return false;
        }
        console.log('Document data:', doc.data());
        let data = doc.data();
        console.log(scannerID);
        console.log(data.lastScannerID);

        return (data.lastScannerID == scannerID);


    } catch (error) {
        console.log('Error getting document', error);
    }
}

/*
async function compareScannerID(epc) {
  db.collection("Cykelløb").doc(epc).get()
      .then(doc => {
          if (!doc.exists) {
              console.log('No such document!');
          } else {
              console.log('Document data:', doc.data());
              return !(doc.lastScannerID == scannerID);

          }
      })
      .catch(err => {
          console.log('Error getting document', err);
      });

}
*/