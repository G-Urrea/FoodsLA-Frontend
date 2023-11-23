import React, {useState, useEffect, useCallback} from 'react';
import * as d3 from 'd3'
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {BASEMAP} from '@deck.gl/carto';
import { quantile } from 'd3-array';
import {scaleThreshold} from 'd3-scale';
import IndicatorOverlay from './indicatorOverlay';
import Sidebar from './sidebar';
import MultiRangeSlider from "multi-range-slider-react";
import { CensusTractLayer } from './mapComponents/CensusTractLayer';
import { RestaurantsLayer } from './mapComponents/RestaurantsLayer';
import { getTooltip } from './mapComponents/MapTooltip';
import { dataUpdate } from './mapComponents/DataFetching';

export default function DensityMap() {

  const MAP_STYLE = BASEMAP.DARK_MATTER;

  const INITIAL_VIEW_STATE = {
        latitude: 34.098907,
        longitude:  -118.327759,
        zoom: 11,
        maxZoom: 16,
        bearing: 0
      };

  const colors = ['#3a3fac',
      '#6dcee1',
      '#f7e432',
      '#fd8c30',
      '#e93627'].map(c => d3.rgb(c));

  const [clickedZone, setClickedZone] = useState(null);
  
  const [nextPageRestaurant, setNextRestaurant] = useState(`${process.env.REACT_APP_API_URL}/restaurantsGIS/`);
  const [nextPageCT, setNextCT] = useState(`${process.env.REACT_APP_API_URL}/fendGIS/`);

  const [restaurantsData, setRestaurantsData] = useState({
    type: 'FeatureCollection', next: nextPageRestaurant,
    features: [],
  });
  const [tractsData, setTractsData] = useState({
    type: 'FeatureCollection', next: nextPageCT,
    features: [],
  });
  
  const [selectedMap, setMap] = useState('ct');
  const [mainFeature, setMain] = useState('rnd')
  const [selectedData, setSelectedData] = useState(null);
  const [menuData, setMenu] = useState(null);
  
  const restaurants_color_feature = "rnd";
  const ct_color_feature = "fend";

  const [minValue, set_minValue] = useState(0);
  const [maxValue, set_maxValue] = useState(2.3);
  const [filters, setFilters] = useState([0, 2.3]);
  const handleInput = (e) => {
    if (e.minValue!==minValue)
      set_minValue(e.minValue);
    if (e.maxValue!==maxValue)
      set_maxValue(e.maxValue);
    if (e.minValue!== minValue || e.maxValue !== maxValue)
      setFilters([e.minValue, e.maxValue]);
  };

  const memoizedRangeUpdate = useCallback(handleInput, [minValue, maxValue]);
  // Actualizar datos geográficos cuando se define una nueva fuente de datos
  useEffect(()=>{
    if (nextPageCT!==null){
      dataUpdate(nextPageCT, setTractsData);
    }
  }, [nextPageCT])

  useEffect(()=>{
    if (nextPageRestaurant!==null){
      dataUpdate(nextPageRestaurant, setRestaurantsData);
    }
  }, [nextPageRestaurant])

  // Una vez actualizados, se actualiza la siguiente fuente de donde actualizar
  useEffect(()=> {
    // hotfix para evitar llamar a localhost  (buscar mejor solución)
    const url = tractsData.next;
    if (url===null){
      setNextCT(null);
    }
    else {
      const next_page = url.split('api')[1];
      setNextCT(`${process.env.REACT_APP_API_URL}${next_page}`);
    }
    
  }, [tractsData])

  useEffect(()=> {
    const url = restaurantsData.next;
    if (url===null){
      setNextRestaurant(null);
    }
    else {
      const next_page = url.split('api')[1];
      setNextRestaurant(`${process.env.REACT_APP_API_URL}${next_page}`);
    }
  }, [restaurantsData])

    
  // Funciones para coloreo de quintiles en base a datos
  const valores = (data, color_feature) => {
     return data.features.map(feature => feature.properties[color_feature]);
    };

  const quintiles = (value_array) => {return [
    quantile(value_array, 0.2),
    quantile(value_array, 0.4),
    quantile(value_array, 0.6),
    quantile(value_array, 0.8),
    d3.max(value_array) // Quintil superior
  ]};
  
  const colorScale = (quantile) => {
    return scaleThreshold().domain(quantile).range(colors.map(c => [c.r, c.g, c.b]))};
  

  const get_detail_data = async (tract_id, url) =>{
    try {
      const respuesta = await fetch(`${url}=${tract_id}`);
      if (!respuesta.ok) {
        throw new Error('No se pudo obtener la información');
      }
      const datos = await respuesta.json();
      setSelectedData(datos);
    } catch (error) {
      console.error('Error al obtener la información:', error);
    }
  };
  

  // Obtención de menus
  const get_ct_menus = async (urls) =>{
    try{
      const menu_jsons = await Promise.all(
        urls.map(async url => {
          const resp = await fetch(url);
          return resp.json();
        }));
      const menus = menu_jsons.map(menu => menu.map(row=>row['menu'])).flat();
      setMenu(menus);
    } catch (error) {
      console.error('Error al obtener la información:', error);
    }
  }
  useEffect(()=> {
    if (selectedData!==null){
      if (selectedMap==='ct') {
        // Hacer mucho
        const urls = selectedData.map(row => `${process.env.REACT_APP_API_URL}/menus/?establishment_id=${row["establishment_id"]}`);
        get_ct_menus(urls);
      }
      else{
        // 
        const menus = selectedData.map(row => row['menu']);
        setMenu(menus);
      }
    }
    else{
      setMenu(null);
    }
  }
  ,[selectedData, selectedMap])
  const get_restaurant_data = async (tract_id) => {
    get_detail_data(tract_id, `${process.env.REACT_APP_API_URL}/menus/?establishment_id`);
  };

  const get_ct_data = async (tract_id) => {
    get_detail_data(tract_id, `${process.env.REACT_APP_API_URL}/restaurants/?tract_id`);
  }

  const layers = [];

  if (restaurantsData!==null){

    const pointQuintiles = quintiles(valores(restaurantsData, restaurants_color_feature));
    const pointColorScale = colorScale(pointQuintiles);
    const pointLayer = RestaurantsLayer({
      data: restaurantsData, color_feature: restaurants_color_feature,
      quintiles: pointQuintiles, color_scale: pointColorScale,
      clickedZone: clickedZone, clickedZoneSetter: setClickedZone,
      get_detail_function: get_restaurant_data,
      selectedMap: selectedMap, filters: filters
    })
    layers.push(pointLayer);
  }
  else{
    layers.push(null);
  }

  if (tractsData !== null){
    const ctQuintiles = quintiles(valores(tractsData, ct_color_feature));
    const ctColorScale = colorScale(ctQuintiles);
    const ctLayer = CensusTractLayer({
      data: tractsData, color_feature:ct_color_feature,
      quintiles:ctQuintiles, color_scale: ctColorScale,
      clickedZone: clickedZone, clickedZoneSetter: setClickedZone,
      get_detail_function:get_ct_data,
      selectedMap:selectedMap, filters: filters
    }
    )
    layers.push(ctLayer);
  }
  else{
    layers.push(null);
  }

  const handleChange = (event) => {
    const current = event.target.value;
    setMap(current);
    setSelectedData(null);
    if (current==='ct'){
      setMain('rnd');
    }
    else{
      setMain('rrr');
    }
  };
  
  console.log('rendering...');
  return (
        <div style ={{display:'flex', flexDirection:'row'}}>
          <div style={{ height: '90vh', width: '70vw', position: 'relative', overflow: "hidden"}}>
            <DeckGL
              layers={layers}
              initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              getTooltip={ (object) => getTooltip(object, selectedMap)}>
                <Map
                mapStyle = {MAP_STYLE}
                preventStyleDiffing={true} />
            </DeckGL>
            <div style = {{    
              position: "absolute",
              "z-index": 1,
              display:'flex',
              flexDirection:'column',
              justifyContent:'center',
              alignItems:'center',
              top: "5px",
              left: "5px",
              width: "15vw",
              backgroundColor:'black',
              color:'white'}}>
                <div style={{width:'12vw'}}>
                  <IndicatorOverlay></IndicatorOverlay>
                </div>
                  <div style={{paddingTop:'5px'}}>
                  <div>Data range by score:</div>
                  <div>
                  
                  <MultiRangeSlider
                    min={0}
                    max={2.3}
                    step={(2.3)/100}
                    minValue={minValue}
                    maxValue={maxValue}
                    ruler={false}
                    barInnerColor='#3a3fac'
                    style = {
                      {border:"none", boxShadow:"none", width:'10vw'}
                    }
                    onInput={(e) => {
                      memoizedRangeUpdate(e);
                    }}
                  /></div>
                </div>
                <div style={
                  {display:'flex', flexDirection:'row', justifyContent:'space-between',
                   paddingBottom:'5px', width:'14vw'
              }}>
                  <div>Data by:</div>
                  <div>
                    <select value={selectedMap} onChange={handleChange}>
                      <option value="ct">Census Tract</option>
                      <option value="restaurant">Restaurants</option>
                    </select>
                  </div>
                </div>
                
            </div>
          </div>
          
          <div style = {{ backgroundColor: 'black', flex:'1',  height: '90vh', width: '30vw', overflowY:"scroll"}}>
           <Sidebar data = {selectedData} main_feature={mainFeature}
             triggerData = {clickedZone} type={selectedMap} menu_data={menuData}></Sidebar>
          </div>
        </div>
      
    );
}