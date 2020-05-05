/*
  Reading multiple RFID tags, simultaneously!
  By: Nathan Seidle @ SparkFun Electronics
  Date: October 3rd, 2016
  https://github.com/sparkfun/Simultaneous_RFID_Tag_Reader

  Constantly reads and outputs any tags heard

  If using the Simultaneous RFID Tag Reader (SRTR) shield, make sure the serial slide
  switch is in the 'SW-UART' position
*/

#include <SoftwareSerial.h> //Used for transmitting to the device
#include <ArduinoJson.h>

SoftwareSerial softSerial(2, 3); //RX, TX

#include "SparkFun_UHF_RFID_Reader.h" //Library for controlling the M6E Nano module
RFID nano;                            //Create instance

char rx_byte = 0;
String name_str = "";
String klasse_str = "";
String nummer = "";
bool name_filled = false;
bool klasse_filled = false;
bool nummer_filled = false;


char epc_str[15];
char outputBuffer[3];
int addToString = 1;
int scannedTags = 0;
void byte2HexStr(byte val, char *outputBuffer)
{
  const char HEX_DIGITS[16] = "0123456789ABCDEF";

  byte upper_nibble_index = (val & 0xf0) >> 4;
  byte lower_nibble_index = val & 0xf;

  outputBuffer[0] = HEX_DIGITS[upper_nibble_index];
  outputBuffer[1] = HEX_DIGITS[lower_nibble_index];
  outputBuffer[2] = '\0';
}

void setup()
{

  Serial.begin(115200);
  while (!Serial)
    ; //Wait for the serial port to come online

  if (setupNano(38400) == false) //Configure nano to run at 38400bps
  {
    //Serial.println(F("Module failed to respond. Please check wiring."));
    while (1)
      ; //Freeze!
  }

  nano.setRegion(REGION_NORTHAMERICA); //Set to North America
  nano.setReadPower(500);              //5.00 dBm. Higher values may caues USB port to brown out
  //Max Read TX Power is 27.00 dBm and may cause temperature-limit throttling

  //Serial.println(F("Press a key to begin scanning for tags."));
  //while (!Serial.available()); //Wait for user to send a character
  //Serial.read(); //Throw away the user's character

  nano.startReading(); //Begin scanning for tags
}

void loop()
{

  Serial.print(epc_str);

  if (nano.check() == true) //Check to see if any new data has come in from module
  {
    byte responseType = nano.parseResponse(); //Break response into tag ID, RSSI, frequency, and timestamp

    if (responseType == RESPONSE_IS_KEEPALIVE)
    {
      //Serial.println(F("Scanning"));
    }
    else if (responseType == RESPONSE_IS_TAGFOUND)
    {
      //If we have a full record we can pull out the fun bits
      int rssi = nano.getTagRSSI(); //Get the RSSI for this tag read

      long freq = nano.getTagFreq(); //Get the frequency this tag was detected at

      long timeStamp = nano.getTagTimestamp(); //Get the time this was read, (ms) since last keep-alive message

      byte tagEPCBytes = nano.getTagEPCBytes(); //Get the number of bytes of EPC from response

      //Serial.print(F(" rssi["));
      //Serial.print(rssi);
      //Serial.print(F("]"));

      //Serial.print(F(" freq["));
      //      Serial.print(freq);
      //      Serial.print(F("]"));
      //
      //      Serial.print(F(" time["));
      //      Serial.print(timeStamp);
      //      Serial.print(F("]"));

      //Print EPC bytes, this is a subsection of bytes from the response/msg array
      //Serial.print(F(" epc["));
      String myStrObject = "";
      for (byte x = 0; x < tagEPCBytes; x++)
      {
        byte2HexStr(nano.msg[31 + x], outputBuffer);
        myStrObject += outputBuffer;
      }
      //Serial.print("Got tag: ");
      scannedTags++;
      //Serial.print(myStrObject);
     
  while(!Serial.available()) {
    
  } 
    
    if (Serial.available() > 0) {    // is a character available?
    rx_byte = Serial.read();       // get the character
    
    if (rx_byte != '\n') {
      // a character of the string was received
      name_str += rx_byte;
    } else { 
       
    
      DynamicJsonDocument doc(256);
      //Creating json document for node.js
      doc["epc"] = myStrObject;
      doc["scannedTags"] = scannedTags;
      doc["name"] = name_str;
      serializeJson(doc, Serial);
      Serial.println();
      name_str = "";
    }}}
    else if (responseType == ERROR_CORRUPT_RESPONSE)
    {
      //Serial.println("Bad CRC");
    }
    else
teams
      //Unknown response
      //Serial.print("Unknown error");
    }
  }
  
  
  
}

//Gracefully handles a reader that is already configured and already reading continuously
//Because Stream does not have a .begin() we have to do this outside the library
boolean setupNano(long baudRate)
{
  nano.begin(softSerial); //Tell the library to communicate over software serial port

  //Test to see if we are already connected to a module
  //This would be the case if the Arduino has been reprogrammed and the module has stayed powered
  softSerial.begin(baudRate); //For this test, assume module is already at our desired baud rate
  while (softSerial.isListening() == false)
    ; //Wait for port to open

  //About 200ms from power on the module will send its firmware version at 115200. We need to ignore this.
  while (softSerial.available())
    softSerial.read();

  nano.getVersion();

  if (nano.msg[0] == ERROR_WRONG_OPCODE_RESPONSE)
  {
    //This happens if the baud rate is correct but the module is doing a ccontinuous read
    nano.stopReading();

    //Serial.println(F("Module continuously reading. Asking it to stop..."));

    delay(1500);
  }
  else
  {
    //The module did not respond so assume it's just been powered on and communicating at 115200bps
    softSerial.begin(115200); //Start software serial at 115200

    nano.setBaud(baudRate); //Tell the module to go to the chosen baud rate. Ignore the response msg

    softSerial.begin(baudRate); //Start the software serial port, this time at user's chosen baud rate

    delay(250);
  }

  //Test the connection
  nano.getVersion();
  if (nano.msg[0] != ALL_GOOD)
    return (false); //Something is not right

  //The M6E has these settings no matter what
  nano.setTagProtocol(); //Set protocol to GEN2

  nano.setAntennaPort(); //Set TX/RX antenna ports to 1

  return (true); //We are ready to rock
}
