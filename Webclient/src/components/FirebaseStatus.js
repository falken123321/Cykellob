import React, { useEffect, useState } from "react";
import firebase from "../lib/Firebase"

// import firebase from "firebase";

const firestore = firebase.firestore();

function FirebaseDataFunction() {
  const thingsToDoWithDocumentData = snapshot => {
    if (snapshot.empty) {
      console.log("Fejl");
      return;
    }

    let DataArray = [];
 
    snapshot.forEach(doc => {
      let DataData = doc.data();
      DataData["key"] = doc.id;
      DataArray.push(DataData);
    })

    setFirebaseData(DataArray);
    console.log(DataArray[0]);
  };

  const getRealtimeUpdates = () => {
    const query = firestore.collection("Cykelløb")
    query.onSnapshot(thingsToDoWithDocumentData);
  };


  // InitialValue er brugt her fordi at React loader objektet før der er noget deri, og så crasher programmet.*
  // På denne måde laver vi værdierne som tomme på forhånd, for at undgå crash.

  // const initialValue = {
  //   Name: "Loading...",
  //   Klasse: "Loading...",
  //   Nummer: "Loading...",
  //   Omgange: []}
  const [firebaseData, setFirebaseData] = useState([]);

  useEffect(() => {
    getRealtimeUpdates();
  }, [] // Tomt array for at undgå spam i konsol
  );

  // const docRef = firestore.doc.map(item) => (
  console.log("Test FirebaseData.Name: " + firebaseData.Name);

  // var omgangeTotal = Object.values(firebaseData.Omgange);

  return (

    <div>
      <div class="Highscores">
      <h1>Highscore over alle deltagerene</h1>
        <label>Soter: </label>
        <select>
          <option>Omgange (Flest først)</option>
          <option>Omgange (Færrest først)</option>
        </select>
      <table>
        <thead>
          <tr>
            <th>Navn</th>
            <th>Omgange</th>
          </tr>
        </thead>
        <tbody>
          {
            firebaseData.map((it) => (
              <tr>
                <td>{it.Name}</td>
                <td>{Object.values(it.Omgange).length/2.}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      </div>
      
      <div class="Scores">
      <h1>Resultater fra alle deltagere induvidielt</h1>
      
      {
        firebaseData.map((it, i) => (
          <div key={i}>
            <h3>Cykkelrytter: {it.Name} </h3>
            <p>Klassetrin: {it.Klasse}</p>
            <p>Cykkelnummer: {it.Nummer}</p>
            <h4>Tabel for gange registretet</h4>
            <table>
              <thead>
                <tr>
                  <th>Tidspunkt</th>
                  <th>Registrede gange</th>
                </tr>
              </thead>
              <tbody>
                {
                  Object.values(it.Omgange).map(
                    (item, i) => (
                      <tr key={i}>
                        <td> {item.toDate().toISOString()}</td>
                        <td>{i+1}</td>
                      </tr>
                    )
                  )
                }
              </tbody>
            </table>
            <p>-------------------------------------------------------------------</p>
          </div>
        ))
      }
      </div>
    </div>
  );
}

export default FirebaseDataFunction;