import React, { useEffect, useState } from "react";
import firebase from "../lib/Firebase"

// import firebase from "firebase";

const firestore = firebase.firestore();
const docRef = firestore.doc("Cykelløb/001");


function FirebaseDataFunction() {
  const thingsToDoWithDocumentData = doc => {
    if (doc && doc.exists) {
      const myData = doc.data();
      console.log(myData);
      setFirebaseData(myData);
    }
  };

  const getRealtimeUpdates = () => {
    docRef.onSnapshot(thingsToDoWithDocumentData);
  };


  // InitialValue er brugt her fordi at React loader objektet før der er noget deri, og så crasher programmet.*
  // På denne måde laver vi værdierne som tomme på forhånd, for at undgå crash.

  const initialValue = {
    Name: "Loading...",
    Klasse: "Loading...",
    Nummer: "Loading...",
    Omgange: [],
    Test: []}
  const [firebaseData, setFirebaseData] = useState(initialValue);

  useEffect(() => {
    getRealtimeUpdates();
  });


  const array1 = [1, 4, 9, 16];
  // const docRef = firestore.doc.map(item) => (
  
  return (
    <div>
            <h1>Liste over alle omgange sorteret</h1>
      <div>
        <label>Soter: </label>
        <select>
          <option>Omgange (Flest først)</option>
          <option>Omgange (Færrest først)</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Navn</th>
            <th>Omgange</th>
          </tr>
        </thead>

        <tbody>

          <tr>

          </tr>


          <tr>
            <td>Andreas Østergaard</td>
            <td>22</td>
          </tr>
          <tr>
            <td>Lalsl Østergaard</td>
            <td>2</td>
          </tr>
        </tbody>
      </table>
      <h1>Resultater fra alle deltagere induvidielt</h1>
      <p>Cykkelrytter: {firebaseData.Name} </p>
      <p>Klassetrin: {firebaseData.Klasse}</p>
      <p>Cykkelnummer: {firebaseData.Nummer}</p>
      <p>Cykkelnummer: {firebaseData.Test}</p>
      
      <h3>Antal omgange cyklet</h3>

      <table>
        <thead>
          <tr>
          <th>Tid</th>
            <th>Omgangs Nummer</th>
            
          </tr>
        </thead>

        <tbody>
          {
            firebaseData.Omgange.map(
              (item, i) => (
                <tr>
                  <td> {item.toDate().toISOString()}</td>
                  <td>{i}</td>
                </tr>
              )
            )
          }
        </tbody>
      </table>
    </div>
  );
}

export default FirebaseDataFunction;