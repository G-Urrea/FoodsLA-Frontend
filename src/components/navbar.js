import React from 'react';
import './navbar.css';
import {NavLink } from 'react-router-dom';


export default function Navbar(){

  function navStyle({ isActive, isPending }){
    return {
      fontWeight: isActive ? "bold" : "",
      color: isActive? "yellow":'white'
    };
  }


  return (
    <div className='NavMenu' style={{ fontSize: 20 }}>
      <div className='NavLogo' style={{paddingLeft:5}}>
        Food Environments LA
      </div>
      <div className='NavSections'>
        <NavLink to='/' className='NavElement' style={(prop) => {return navStyle(prop);}}>
            Map
        </NavLink>
        <NavLink to='/stats' className='NavElement' style={(prop) => {return navStyle(prop);}}>
          Statistics
        </NavLink>
        <NavLink to='/downloads' className='NavElement' style={(prop) => {return navStyle(prop);}}>
           Downloads
        </NavLink>
        <NavLink to='/about' className='NavElement' style={(prop) => {return navStyle(prop);}}>
          About
        </NavLink>
      </div>

    </div>

  );
}
 