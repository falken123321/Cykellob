import React, { useEffect, useState } from "react";
import firebase from "../lib/Firebase"

// import firebase from "firebase";

const firestore = firebase.firestore();
const docRef = firestore.doc("Cykelløb/001");

function FirebaseDataFunction() {
    const thingsToDoWithDocumentData = doc => {
        if (doc && doc.exists) {
            const myData = doc.data();
            setFirebaseData(myData.firstName);
        }
    };

    const getRealtimeUpdates = () => {
        docRef.onSnapshot(thingsToDoWithDocumentData);
    };

    const [FirebaseData, setFirebaseData] = useState("");

    useEffect(() => {
        getRealtimeUpdates();
    }); 

    return (
        <div>
        <h2>
          {FirebaseData} 
        </h2>
        <p>Username:</p>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Score</th>
            </tr>
          </thead>
  
          <tbody>
              <tr>
                <td>2398388</td>
                <td>22</td>
              </tr>
          </tbody>
        </table>
      </div>
    );
}

export default FirebaseDataFunction;