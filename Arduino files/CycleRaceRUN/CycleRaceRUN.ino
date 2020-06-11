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
#define pc_MAX  15       // 60 er max - med 50 tags vaelg 50 pladser!
#define TIMEOUT_MS 5000 // 5s
#define DEBUG_REDBOARD    0       // 0 false .  1 true
#define DEBUG1_REDBOARD   0       // skriv kun epc[40][41][42][tt tt tt tt] elapsed_time (7byte)
SoftwareSerial softSerial(2, 3); //RX, TX
#include <ArduinoJson.h>

#include "SparkFun_UHF_RFID_Reader.h" //Library for controlling the M6E Nano module
RFID nano; //Create instance
int rssi;
long freq;
long timeStamp;
byte tagEPCBytes;
byte tagDataBytes;
long starttime;
long readtime;

float elapsed_time_in_cyclerace_sec; // identifier

char epc_str[15];
char outputBuffer[3];
int addToString = 1;
int scannedTags = 0;
String myStrObject;
String myStrObject2;
char * outputBuffer_p;
byte * val_p;

long int counter;

struct passingEvent {
  bool occupied;
  byte epcLSByte[3];     // epc: xx xx xx xx xx xx xx xx xx 40 41 42 = 24 aktive bit 
  long elapsed_time_in_cyclerace_ms; // 2^31 = 2.1G = 2.1Ms 2.1Ms/3600 = 583 timer
};

passingEvent passingCyclist[pc_MAX]; // til debug formål

 
int pc_no; // [0..pc_MAX]
int pc_last; // den senest ankomne pc
bool unique;  // Is the new pc unique? If yes, insert in passingCyclist and send passingCyclist


void setup()
{
  pinMode(10,OUTPUT);
  Serial.begin(115200);
  myStrObject = "0123456789ABCDEF";   // Til Initialisering af String object
  byte init_epc[13] = "0123456789AB"; // Til initialisering af String object
  //tagEPCBytes = nano.getTagEPCBytes(); // Denne initialiserer til 252 byte!
  tagEPCBytes = 12;                      // Vi bruger tags med epc laengde 12 byte
  if (DEBUG_REDBOARD) {
    Serial.print("tagEPCBytes = ");
    Serial.println(tagEPCBytes);
  }  
  for (byte p = 0; p < tagEPCBytes; p++) {
    
    if (DEBUG_REDBOARD) {
      Serial.print("init_epc[");
      Serial.print(p);
      Serial.print("] = ");
      Serial.println(init_epc[p],HEX);
    } // if  DEBUG_REDBOARD 
      // void byte2HexStr(byte * val_p, char * outputBuffer_p)
      val_p = &init_epc[p];
      outputBuffer_p = &outputBuffer[0];          
      byte2HexStr(val_p, outputBuffer_p);
      myStrObject += outputBuffer;     
    } // for byte x . int p
    myStrObject = "";
    outputBuffer[0] = ' ';
    outputBuffer[1] = ' ';
    // outputBuffer[2] = " ";
    
  while (!Serial); //Wait for the serial port to come online

  if (setupNano(38400) == false) //Configure nano to run at 38400bps
  {
    if(DEBUG_REDBOARD) {
      Serial.println(F("Module failed to respond. Please check wiring."));
      while (1); //Freeze!
    } // if DEBUG_REDBOARD  
  }

  nano.setRegion(REGION_EUROPE); //Set to North America

  nano.setReadPower(500); //5.00 dBm. Higher values may caues USB port to brown out
  //Max Read TX Power is 27.00 dBm and may cause temperature-limit throttling
  if (DEBUG_REDBOARD) {
    Serial.println(F("Press a key to begin scanning for tags."));
    while (!Serial.available()); //Wait for user to send a character
    // send 'g' character fra fireBase så scanning starter
    Serial.read(); //Throw away the user's character
  }
  nano.startReading(); //Begin scanning for tags
  pc_last = 0;
  unique = true; // flaget falder hvis sammenligning i epcBase finder en identisk epc
  // mekanisme der bremser programmet indtil cyclerace start
  starttime = millis();
} // void setup()

void byte2HexStr(byte * val_p, char * outputBuffer_p)
{
  const char HEX_DIGITS[17] = "0123456789ABCDEF";

  byte upper_nibble_index = (*val_p & 0xf0) >> 4;
  byte lower_nibble_index = *val_p & 0xf;

  outputBuffer[0] = HEX_DIGITS[upper_nibble_index];
  outputBuffer[1] = HEX_DIGITS[lower_nibble_index];
  outputBuffer[2] = '\0';
}

void erase_passingCyclist(int pc_no) {
          passingCyclist[pc_no].occupied = false;
          passingCyclist[pc_no].epcLSByte[0] = 0;
          passingCyclist[pc_no].epcLSByte[1] = 0;
          passingCyclist[pc_no].epcLSByte[2] = 0;
          passingCyclist[pc_no].elapsed_time_in_cyclerace_ms = 0;
}

void print_passingCyclist() {
  Serial.println();
  Serial.println("print_passingCyclist():");
  for (pc_no = 0; pc_no < pc_MAX; pc_no++){
    Serial.print(passingCyclist[pc_no].occupied);
    Serial.print(" passingCyclist[");
    Serial.print(pc_no);
    Serial.print("].epcLSByte[0] = ");
    Serial.print(passingCyclist[pc_no].epcLSByte[0],HEX);
    Serial.print("  \t  ");
    Serial.print("passingCyclist[");
    Serial.print(pc_no);
    Serial.print("].epcLSByte[1] = ");
    Serial.print(passingCyclist[pc_no].epcLSByte[1],HEX);
    Serial.print("  \t  ");
    Serial.print("passingCyclist[");
    Serial.print(pc_no);
    Serial.print("].epcLSByte[2] = ");
    Serial.print(passingCyclist[pc_no].epcLSByte[2],HEX);
    Serial.print("  passingCyclist[");
    Serial.print(pc_no);
    Serial.print("].elapsed_time_in_cyclerace_ms = ");
    Serial.print(passingCyclist[pc_no].elapsed_time_in_cyclerace_ms);
    Serial.println();
  } // for pc_no
  Serial.println();  
}

void loop()
{
  readtime = millis(); // time = timestamp + readtime - starttime;
  // passingCyclist databasen loebes igennem. Hvis det er mere end TIMEOUT ms siden en tag er registreret
  // skal den slettes i passingCyclist databasen - dette medfoerer at den kan laeses igen.
  
  if (nano.check() == true) //Check to see if any new data has come in from module
  {
    byte responseType = nano.parseResponse(); //Break response into tag ID, RSSI, frequency, and timestamp

    if (responseType == RESPONSE_IS_KEEPALIVE)
    {
      if (DEBUG_REDBOARD) {
        Serial.println(F("Scanning"));
      }
    }
    else if (responseType == RESPONSE_IS_TAGFOUND)
    {
      pc_no = pc_last; // set pc_no lowest in passingCyclist
      while( passingCyclist[pc_no].occupied == true && unique == true /* && pc_no >= 0 */) {
        long present_time = millis();
        if (DEBUG_REDBOARD) {
          Serial.print("pc_last = ");
          Serial.print(pc_last);
          Serial.print(" pc_no = ");
          Serial.println(pc_no);
          Serial.println("present_time - starttime - passingCyclist[pc_no].elapsed_time_in_cyclerace_ms =");
          Serial.print(present_time);
          Serial.print(" - ");
          Serial.print(starttime);
          Serial.print(" - ");
          Serial.print(passingCyclist[pc_no].elapsed_time_in_cyclerace_ms);
          Serial.println(" = ");
          Serial.println(present_time - starttime - passingCyclist[pc_no].elapsed_time_in_cyclerace_ms);
        } // if DEBUG_REDBOARD  
        if ( present_time - starttime - passingCyclist[pc_no].elapsed_time_in_cyclerace_ms > TIMEOUT_MS ) {
          // slet passingCyclist hvis TIMEOUT:
          erase_passingCyclist(pc_no);
          if (pc_no == 0) {   // cirkulaer buffer - og man roterer opad!
            pc_no = pc_MAX;   // Hvis man er kommet overst i tabellen - saa fortsaetter man
          }                     // allernederst - og man fortsaetter med at rotere opad!
          pc_no--;
          
        } else
        if  (nano.msg[40] == passingCyclist[pc_no].epcLSByte[0]){        
          if  (nano.msg[41] == passingCyclist[pc_no].epcLSByte[1]){  // == betyder logisk sammenligning
            if  (nano.msg[42] == passingCyclist[pc_no].epcLSByte[2]){  // LSByte af epc mindst betydende byte
              unique = false;
            } // if 42  
          } // if 41    
        } // if 40
        pc_no--; // circular buffer going upwards!
        if (pc_no < 0 ) {
          pc_no = pc_no + pc_MAX;
        } // pc_no <0
      } // while (passingCyclist[pc_no].occupied == true ...)
      // unique == true: Der er tale om en ny epc unique == false: epc allerede i database
      

      if (unique == true ) {
        // Den nye epc indsaettes i passingCyclist[pc_last]
        pc_last++;
        if (pc_last == pc_MAX) { // Da vi kun har pc_MAX tags itv. kan passingCyclist genbruges
          pc_last = 0;     
        }
        while ( passingCyclist[pc_last].occupied == true ) {
          pc_last++;
          if (pc_last == pc_MAX) { // Da vi kun har 50 tags itv. kan passingCyclist genbruges
            pc_last = 0;     
          } // if pc_last
        } // while passingCyclist
        
        passingCyclist[pc_last].occupied = true;

        

            
        passingCyclist[pc_last].epcLSByte[0] = nano.msg[40]; 
        if (DEBUG1_REDBOARD) { 
          Serial.print(" epc byte 40 = ");
          Serial.print(nano.msg[40], HEX);
        }
        passingCyclist[pc_last].epcLSByte[1] = nano.msg[41]; 
        if (DEBUG1_REDBOARD) { 
          Serial.print(" epc byte 41 = ");
          Serial.print(nano.msg[41], HEX);
        }
        passingCyclist[pc_last].epcLSByte[2] = nano.msg[42]; 
        if (DEBUG1_REDBOARD) { 
          Serial.print(" epc byte 42 = ");
          Serial.println(nano.msg[42], HEX); 
        }        
        timeStamp = nano.getTagTimestamp(); //Get the time this was read, (ms) since last keep-alive message
        if (DEBUG1_REDBOARD) { 
          Serial.print(F(" time["));
          Serial.print(timeStamp);
          Serial.println(F("]"));
        }  
        passingCyclist[pc_last].elapsed_time_in_cyclerace_ms = (readtime + timeStamp - starttime);
      //  elapsed_time_in_cyclerace_sec = passingCyclist[pc_last].elapsed_time_in_cyclerace_ms/1000.0;
        if (DEBUG1_REDBOARD) { 
          Serial.print("elapsed_time_in_cyclerace_ms = ");
          Serial.print(passingCyclist[pc_last].elapsed_time_in_cyclerace_ms);
          Serial.println(" ms ");
        } 

                 for (byte x = 0; x < tagEPCBytes; x++)
        {
          // void byte2HexStr(byte * val_p, char * outputBuffer_p)
          val_p = &nano.msg[31+x];
          outputBuffer_p = &outputBuffer[0];          
          byte2HexStr(val_p, outputBuffer_p);
          myStrObject += outputBuffer;
        }
        /*
        long * long_p;
        byte * byte_p;
        for (byte x = 0; x < 4; x++)
        {
          // void byte2HexStr(byte * val_p, char * outputBuffer_p)
          long_p = &passingCyclist[pc_last].elapsed_time_in_cyclerace_ms+x;
          outputBuffer_p = &outputBuffer[0];       
          byte_p = (byte *) long_p;   
          byte2HexStr(byte_p, outputBuffer_p);
          myStrObject2 += outputBuffer;
        }
*/
        
        //Serial.print("Got tag: ");
        scannedTags++;
        //Serial.print(myStrObject);


     
        DynamicJsonDocument doc(256);
        //Creating json document for node.js
        doc["epc"] = myStrObject;
        doc["scannedTags"] = scannedTags;
        doc["elapsed_time"] = passingCyclist[pc_last].elapsed_time_in_cyclerace_ms;
        doc["tempDegC"] = nano.getTemp();
        serializeJson(doc, Serial);
        Serial.println();
        myStrObject = "";
        myStrObject2 = "";
 /*       
       // If we have a full record we can pull out the fun bits
        rssi = nano.getTagRSSI(); //Get the RSSI for this tag read

        freq = nano.getTagFreq(); //Get the frequency this tag was detected at
*/
        tagEPCBytes = nano.getTagEPCBytes(); //Get the number of bytes of EPC from response

   //     tagDataBytes = nano.getTagDataBytes(); // Would this also work? ska, 30mar2020 12.41
      
        // mekanisme der afsoeger passingCyclist fra pc_no = 0 og frem til pc_last     

        //Print EPC bytes, this is a subsection of bytes from the response/msg array
        if (DEBUG_REDBOARD) { 
          Serial.print(F(" epc["));
          for (byte x = 0 ; x < tagEPCBytes ; x++)
          {
            //     epc      31 32 33 34 35 36 37 38 39 40 41 42
            if (nano.msg[31 + x] < 0x10) Serial.print(F("0")); //Pretty print
            Serial.print(nano.msg[31 + x], HEX);
            Serial.print(F(" "));
          }      
          Serial.print(F("]"));
          Serial.println();
        }  
        if(DEBUG_REDBOARD) {
          print_passingCyclist();
        }  
      } // if (unique == true)
      unique = true;      
    } //else if 
    else if (responseType == ERROR_CORRUPT_RESPONSE)
    {
      if (DEBUG_REDBOARD) { 
        Serial.println("Bad CRC");
      }  
    }
    else
    {
      if (DEBUG_REDBOARD) { 
        //Unknown response
        Serial.print("Unknown error");
      }  
    }
  } 
  
  if (counter == 100000) {
  // if nano.check()
  int8_t t = nano.getTemp();
  
      if (t == -1 ){
        //Serial.println(F("Error getting Nano internal temperature"));
        counter = 0;
    }
    else {
      //Serial.print(F("Nano internal temperature (*C): "));
      //Serial.println(t);  
      //Serial.println(counter);
      counter = 0;
    }

    if (t >= 40) {
      digitalWrite(10,HIGH); 
      } else {
        digitalWrite(10,LOW);
        }
  
  }

counter++;





} // . void loop()

//Gracefully handles a reader that is already configured and already reading continuously
//Because Stream does not have a .begin() we have to do this outside the library
boolean setupNano(long baudRate)
{
  nano.begin(softSerial); //Tell the library to communicate over software serial port

  //Test to see if we are already connected to a module
  //This would be the case if the Arduino has been reprogrammed and the module has stayed powered
  softSerial.begin(baudRate); //For this test, assume module is already at our desired baud rate
  while (softSerial.isListening() == false); //Wait for port to open

  //About 200ms from power on the module will send its firmware version at 115200. We need to ignore this.
  while (softSerial.available()) softSerial.read();

  nano.getVersion();

  if (nano.msg[0] == ERROR_WRONG_OPCODE_RESPONSE)
  {
    //This happens if the baud rate is correct but the module is doing a ccontinuous read
    nano.stopReading();
    if (DEBUG_REDBOARD) { 
      Serial.println(F("Module continuously reading. Asking it to stop..."));
    }
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
  if (nano.msg[0] != ALL_GOOD) return (false); //Something is not right

  //The M6E has these settings no matter what
  nano.setTagProtocol(); //Set protocol to GEN2

  nano.setAntennaPort(); //Set TX/RX antenna ports to 1

  return (true); //We are ready to rock
}
