import React, { useEffect, useState } from "react";
import firebase from "../lib/Firebase"

// import firebase from "firebase";

// Her får .orderBy strukturen på hvad er valgt efter vores SortBy hook
// Det er her jeg har brug for hjælp Rasmus. Name, er bare Name i firebase. Men ved ikke
// hvordan jeg skal sortere over hvem er lænst når de alle har et array hver.
// Har prøvet at lave mapping på alle mulige mærkelige måder men uden held.
const SORT_OPTIONS = {
  'SCORE_ASC': {column: 'OmgangeTotal', direction:'asc'},
  'SCORE_DESC': {column: 'OmgangeTotal', direction:'desc'},
  'NAVN_ASC': {column: 'Name', direction:'asc'},
  'NAVN_DESC': {column: 'Name', direction:'desc'},
  'NUMMER_ASC': {column: 'Nummer', direction:'asc'},
  'NUMMER_DESC': {column: 'Nummer', direction:'desc'}
}

const firestore = firebase.firestore();

function FirebaseDataFunction() {

  // Sorterings hook
  const [sortBy, setSortBy] = useState('SCORE_DESC')

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
    // console.log(DataArray[0]);
  };

  const getRealtimeUpdates = () => {
    const query = firestore.collection("Cykelløb")
    // Sortering
    .orderBy(SORT_OPTIONS[sortBy].column, SORT_OPTIONS[sortBy].direction)
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
  }, [sortBy] // fyldt array for at undgå spam i konsol
  );

  // const docRef = firestore.doc.map(item) => (

  // var OmgangeTotal = [];

  // // key{i}
  // // Laver et array med alle omgangene i
  // firebaseData.forEach((it) => (
  //   OmgangeTotal.push(Object.values(it.Omgange).length/2)
  // ))
  
  // console.log(OmgangeTotal)

  return (
    <div>
      <div className="Highscores">
      <h1>Highscore over alle deltagerene</h1>
        <label>Soter: </label>
        <select value={sortBy} onChange={e => setSortBy(e.currentTarget.value)}>
          <option value="SCORE_DESC">Omgange (Flest først)</option>
          <option value="SCORE_ASC">Omgange (Færrest først)</option>
          <option disabled>------</option>
          <option value="NAVN_ASC">Navn (a-z)</option>
          <option value="NAVN_DESC">Navn (z-a)</option>
          <option disabled>------</option>
          <option value="NUMMER_DESC">Løbsnummer (Højest først)</option>
          <option value="NUMMER_ASC">Løbsnummer (Lavest først)</option>
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
            firebaseData.map((it, i) => (
              <tr key={i}>
                <td>{it.Name}</td>
                <td>{Object.values(it.Omgange).length/2}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      </div>
      
      <div className="Scores">
      <h1>Resultater fra alle deltagere individuel</h1>
      
      {
        firebaseData.map((it, i) => (
          <div key={i}>
            <h3>Cykelrytter: {it.Name} </h3>
            <p>Klassetrin: {it.Klasse}</p>
            <p>Løbsnummer: {it.Nummer}</p>
            <p>Antal omgange cyklet: {it.OmgangeTotal}</p>
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
            <hr/>
          </div>
        ))
      }
      </div>
    </div>
  );
}

export default FirebaseDataFunction;