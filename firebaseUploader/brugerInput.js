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
  
  const parser = port.pipe(new Readline({ delimiter: "\r\n" }));
  
  parser.on("data", doSomethingWithData);
  
  // Callback function for processing the received data
  function doSomethingWithData(data) {
    console.log("--- Line received on serial port ------------");
    console.log('Raw data: ', data);
  
    // parse json data
    const obj = JSON.parse(data);
  }