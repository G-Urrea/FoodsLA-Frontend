import React from 'react';
import './App.css';
import DefaultMap from './defaultMap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/navbar.js';
import About from './pages/about';
import Downloads from './pages/downloads';

const Stats = React.lazy(()=> import('./pages/stats'));
const DensityMap = React.lazy(()=> import('./components/map'));

function App() {
  return (
    <div className="App" style={{background:'#191827', color:'whitesmoke'}}>
          <Router>
            <Navbar />
            <Routes>
              <Route  path='/' exact element={
                <React.Suspense fallback={<DefaultMap/>}>
                  <DensityMap/>
                </React.Suspense>
              }></Route>
                 <Route path='/stats' element = {
                  <React.Suspense>
                    <Stats/>
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
