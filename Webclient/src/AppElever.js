import React,{useEffect,useState} from 'react';
import './App.css';
import FirebaseDataElever from './components/FirebaseElever.js';

// TEST GIT CONNECTION (NEW PC)

function AppElever() {
  return (
    <div className="AppElever">
    <FirebaseDataElever/>
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

// export default App;
// export default AppElever;
export default AppElever;

