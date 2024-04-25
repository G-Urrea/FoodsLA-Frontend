import React, {useState, useEffect} from 'react';
import './App.css';
import DefaultMap from './components/mapComponents/defaultMap.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { serializeRestaurants, serializeTracts } from './components/mapComponents/DataFetching';

import Navbar from './components/navbar.js';
import About from './pages/about';
import Downloads from './pages/downloads';


const Stats = React.lazy(()=> import('./pages/stats.js'));
const DensityMap = React.lazy(()=> import('./components/map'));

function App() {
  // Datos de mapa
  const [mapLoaded, setMapLoaded] = useState(false);
  const [restaurantsData, setRestaurantsData] = useState(null);
  const [tractsData, setTractsData] = useState(null);
  // Datos para gráficos
  const [mainIndicator, setMainIndicator] = useState(null);
  // Descarga de datos para gráficos
  useEffect(()=>{
    const fetchRestaurants = async() =>{
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurants/?gis&format=json`);
        const data = await response.json();
        let serializedRestaurants = serializeRestaurants(data);
        setRestaurantsData(serializedRestaurants);

      }catch (error) {
          console.error('Error:', error);
        }
    }
    fetchRestaurants();
  }, []);

  useEffect(()=>{
    const fetchTracts = async() =>{
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/fend/?gis&format=json`);
        const data = await response.json();
        setTractsData(serializeTracts(data));

      }catch (error) {
          console.error('Error:', error);
        }
    }
    fetchTracts();
  }, []);

  useEffect(()=>{
    const fetchMain = async() =>{
      try {
        console.log(`${process.env.REACT_APP_API_URL}/numind/?indicator_id=0&format=json`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/numind/?indicator_id=0&format=json`);
        const data = await response.json();
        setMainIndicator(data);

      }catch (error) {
          console.error('Error:', error);
        }
    }
    fetchMain();
  }, [])

  useEffect(()=>{
    if ((tractsData!==null) && (restaurantsData!==null)){
      setMapLoaded(true);
    }
  }, [tractsData, restaurantsData])


  return (
    <div className="App" style={{background:'#191827', color:'whitesmoke'}}>
          <Router>
            <Navbar />
            <Routes>
              <Route  path='/' exact element={
                <React.Suspense fallback={<DefaultMap/>}>
                  <DensityMap tractsData={tractsData} restaurantsData={restaurantsData} isloaded={mapLoaded}/>
                </React.Suspense>
              }></Route>
                 <Route path='/stats' element = {
                  <React.Suspense>
                    <Stats mainData = {mainIndicator}/>
                  </React.Suspense>
                }></Route>
               <Route path='/downloads' element = {
                <React.Suspense>
                  <Downloads/>
                </React.Suspense>
              }></Route>
              <Route path='/about'element={
                <React.Suspense>
                  <About/>
                </React.Suspense>
              }/>
            </Routes>
          </Router>
    </div>
  );
}

export default App;
