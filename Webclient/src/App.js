import React,{useEffect,useState} from 'react';
import './App.css';
import FirebaseDataFunction from './components/FirebaseStatus.js';

// TEST GIT CONNECTION (NEW PC)

function App() {
  return (
    <div className="App">
     
    <FirebaseDataFunction/>
    </div>
  );
}



// function Tick() {
//   const [time, setTime] = useState(new Date().toLocaleTimeString());


//   const updateTick = () => {
//     setTime(new Date().toLocaleTimeString());
//   }

//   useEffect(() => {
//    setInterval(updateTick,1000);
//   });


//   return <div>Klokken er: {time} </div> ;
// }

export default App;
