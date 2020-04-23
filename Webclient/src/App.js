import React,{useEffect,useState} from 'react';
import logo from './logo.svg';
import './App.css';
import Highscore from './components/highscore';
import FirebaseDataFunction from './components/FirebaseStatus.js';


function App() {
  return (
    <div className="App">
      <Tick/>
    <FirebaseDataFunction/>
    </div>
  );
}



function Tick() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());


  const updateTick = () => {
    setTime(new Date().toLocaleTimeString());
  }

  useEffect(() => {
   setInterval(updateTick,1000);
  });


  return <div>Klokken er: {time} </div> ;
}

export default App;
