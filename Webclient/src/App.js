import React,{useEffect,useState} from 'react';
import logo from './logo.svg';
import './App.css';
import Highscore from './components/highscore';
import FirebaseDataFunction from './components/FirebaseStatus.js';


function App() {
  const Url = "https://scontent.fsvg1-1.fna.fbcdn.net/v/t1.0-9/23380255_1870523076308854_6270247618288553993_n.jpg?_nc_cat=101&_nc_sid=85a577&_nc_ohc=S0u0czn9CF4AX9IayNx&_nc_ht=scontent.fsvg1-1.fna&oh=b8bc7b2e39ae047ca2801dbb60e999a9&oe=5E98135F";

  return (
    <div className="App">
      <Welcome name="Kasper" />
      <Tick/>
      <img src={Url} width="10%"/>

    <FirebaseDataFunction/>


    </div>
  );
}

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
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
