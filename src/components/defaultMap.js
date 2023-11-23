import React from "react";
import {BASEMAP} from '@deck.gl/carto';
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import Sidebar from './sidebar';

export default function DefaultMap(){
    const MAP_STYLE = BASEMAP.DARK_MATTER;
    return (        
      <div style ={{display:'flex', 'flex-direction':'row'}}>
        <div style={{ height: '80vh', width: '70vw', position: 'relative'}}>
          <DeckGL
            layers = {[null, null]}
            initialViewState={
              {
              latitude: 34.098907,
              longitude:  -118.327759,
              zoom: 11,
              maxZoom: 16,
              bearing: 0
            }
          }
            controller={true}
            >
              <Map
              style={MAP_STYLE}
              mapStyle = {MAP_STYLE}
              preventStyleDiffing={true} />
          </DeckGL>
        <div style = {
          {    
          position: "absolute",
          "z-index": 1,
          top: "5px",
          left: "5px"}
          }>
        </div>
      </div>
      
      <div style = {{ backgroundColor: 'black', flex:'1',  height: '80vh', width: '30vw', overflowY:"scroll"}}>
        <Sidebar></Sidebar>
      </div>
    </div>
  );
  }