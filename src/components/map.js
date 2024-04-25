import React, {useState, useEffect} from 'react';
import * as d3 from 'd3'
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { quantile } from 'd3-array';
import {scaleThreshold} from 'd3-scale';
import { get_ct_menus } from './mapComponents/DataFetching';
import Sidebar from './sidebar';
import { AreaLevelLayer } from './mapComponents/CensusTractLayer';
import { RestaurantsLayer } from './mapComponents/RestaurantsLayer';
import { getTooltip } from './mapComponents/MapTooltip';
import MapController from './mapComponents/mapController';
import './map.css'
export default function DensityMap({tractsData, restaurantsData, isloaded=true}) {

  const MAP_STYLE = `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${process.env.REACT_APP_MAP_KEY}`;//BASEMAP.DARK_MATTER_NOLABELS;

  const INITIAL_VIEW_STATE = {
        latitude: 34.098907,
        longitude:  -118.327759,
        zoom: 11,
        maxZoom: 16,
        bearing: 0
      };

    
  const colors = ['#e93627',
  '#fd8c30',
  '#f7e432',
  '#6dcee1',
  '#3a3fac'].map(c => d3.rgb(c));

  const [clickedZone, setClickedZone] = useState(null);
  const [loadingSide, setLoadingSide] = useState(false);
  
  const [selectedMap, setMap] = useState('ct');
  const main_feature = {
    'ct':'rnd',
    'restaurant':'rrr'
  }
  const [selectedData, setSelectedData] = useState(null);
  const [menuData, setMenu] = useState(null);
  const [chainFilters, setChainFilters] = useState([0, 1]);
  const [selectedChainFilter,  setSelectedChainFilter] = useState("all");
  const [menuRangeData, setMenuRangeData] = useState([0, 2.7]);
  const [selectedId, setSelectedId] = useState(null);
  const [areaLevel, setArea] = useState('ct')

  const handleChain = (e) =>{
      const chain_filter = e.target.value;
      const chain_mapping = {
        "all": [0, 1],
        "chains": [1, 1],
        "no_chain": [0, 0]
      }
      setSelectedChainFilter(chain_filter)
      setChainFilters(chain_mapping[chain_filter]);
  }

  // Maneja cambio de nivel de area (ej: zona censal -> lugar)
  const handleArea = (e) =>{
    const selected_area = e.target.value;
    setArea(selected_area);
    let filtered = tractsData.features.filter((feature) => (feature.properties.geo_type===selected_area));
    let score_values = filtered.map(feature => feature.properties[ct_color_feature]);
    sliderRanges['ct'] = [d3.min(score_values), d3.max(score_values)];
    
    setFilterRange(sliderRanges[selectedMap]);
  }

  const restaurants_color_feature = "rnd";
  const ct_color_feature = "fend";

  const [minValue, set_minValue] = useState(0);
  const [maxValue, set_maxValue] = useState(2.3);
  const distribution_ranges = {
    'restaurant' : menuRangeData,
    'ct' : [0, 2.7]
  }
  const sliderRanges = {
    'ct':[0, 2.3],
    'restaurant': [0, 2.3]
  }

  // Filtro y rango del slider
  const [filters, setFilters] = useState([0, 2.3]);
  const [filterRange, setFilterRange] = useState([0, 2.3]);


  const handleInput = (e) => {
    if (e.minValue!==minValue)
      set_minValue(e.minValue);
    if (e.maxValue!==maxValue)
      set_maxValue(e.maxValue);
    
    if (e.minValue!== minValue || e.maxValue !== maxValue)
      setFilters([e.minValue, e.maxValue]);
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
  

  const get_detail_data = async (id, url) =>{
    try {
      setSelectedData(null);
      setLoadingSide(true);
      const respuesta = await fetch(`${url}=${id}`);
      if (!respuesta.ok) {
        throw new Error('No se pudo obtener la información');
      }
      const datos = await respuesta.json();
      setSelectedData(datos);
      setLoadingSide(false)
      setSelectedId(id);
    } catch (error) {
      console.error('Error al obtener la información:', error);
    }
  };

  // Cargar rangos de distribución de menus
  useEffect(()=>{
    const fetchRange = async ()=>{
      try {
        const respuesta = await fetch(`${process.env.REACT_APP_API_URL}/menus/?distribution`);
        if (!respuesta.ok) {
          throw new Error('No se pudo obtener la información');
        }
        const datos = await respuesta.json();
        setMenuRangeData([datos['rrr__min'], datos['rrr__max']]);
      } catch (error) {
        console.error('Error al obtener la información:', error);
      }
    }
    fetchRange();
  }, [])
  
  // Reiniciar rangos de filtro
  useEffect(() =>{
    setFilters([0, filterRange[1]]);
    set_minValue(0);
    set_maxValue(filterRange[1]);

  }, [filterRange]);

  // Recolección de datos de menus, para wordcloud
  useEffect(()=> {
    if (selectedData!==null){
      if (selectedMap==='ct') {
          const establishment_ids = selectedData.map(row => row['establishment_id']);
          // Demasiados datos
          if (establishment_ids.length>200){
            setMenu([]);
          }
          else{
            setMenu(null);
            const url = `${process.env.REACT_APP_API_URL}/menus/?geoid=${selectedId}`;
            get_ct_menus([url], setMenu);
          }
      }
      else{
        const menus = selectedData.map(row => row['menu']);
        setMenu(menus);
      }
    }
    else{
      setMenu(null);
    }
  } ,[selectedData, selectedMap, selectedId])
  const get_restaurant_data = async (establishment_id) => {
    get_detail_data(establishment_id, `${process.env.REACT_APP_API_URL}/menus/?establishment_id`);
  };

  const get_ct_data = async (tract_id) => {
    get_detail_data(tract_id, `${process.env.REACT_APP_API_URL}/restaurants/?tract_id`);

  }

  const layers = [];


  if (restaurantsData!==null){

    let restaurant_values = restaurantsData.features.map(feature => feature.properties['rnd']);
    distribution_ranges['ct'] = [d3.min(restaurant_values), d3.max(restaurant_values)];
    sliderRanges['restaurant'] = [d3.min(restaurant_values), d3.max(restaurant_values)];

    //Dejar un score unico por cada cadena de comida
    const chain_score = {};
    for (let ix = 0; ix<restaurantsData.features.length; ix++){
      let chain_id = restaurantsData.features[ix].properties['establishment_id'];
      let score = restaurantsData.features[ix].properties[restaurants_color_feature];
      chain_score[chain_id] = score;
    }
    const restaurantUniqueScores = [];
    for (var key in chain_score){
      restaurantUniqueScores.push(chain_score[key]);
    }
    const pointQuintiles = quintiles(restaurantUniqueScores);
    const pointColorScale = colorScale(pointQuintiles);
    const pointLayer = RestaurantsLayer({
      data: restaurantsData, color_feature: restaurants_color_feature,
      quintiles: pointQuintiles, color_scale: pointColorScale,
      clickedZone: clickedZone, clickedZoneSetter: setClickedZone,
      get_detail_function: get_restaurant_data,
      selectedMap: selectedMap, filters: [filters, chainFilters]
    })
    layers.push(pointLayer);
  }
  else{
    layers.push(null);
  }

  if (tractsData !== null){
    let filtered = tractsData.features.filter((feature) => (feature.properties.geo_type===areaLevel));
    let score_values = filtered.map(feature => feature.properties[ct_color_feature]);
    sliderRanges['ct'] = [d3.min(score_values), d3.max(score_values)]
   const ctLayer = AreaLevelLayer({
      data: tractsData, color_feature:ct_color_feature,
      quintilFunction:quintiles, colorScaler: colorScale,
      clickedZone: clickedZone, clickedZoneSetter: setClickedZone,
      get_detail_function:get_ct_data,
      selectedMap:selectedMap, filters: filters, geo_type:areaLevel
   })
    layers.push(ctLayer);
  }
  else{
    layers.push(null);
  }

  // Maneja cambio de restaurante a mapa
  const handleChange = (event) => {
    const current = event.target.value;
    setMap(current);
    setSelectedData(null);
    setFilterRange(sliderRanges[current]);
  };
  
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
                preventStyleDiffing={true} >
                </Map>
            </DeckGL>
            {!isloaded && (
              <div style ={{zIndex:1, alignItems:'center', top:'5px', position:'relative'}}>Loading data...</div>
            )}
            <MapController minValue={minValue} maxValue={maxValue}
                          selectedMap={selectedMap} handleChange={handleChange} handleInput={handleInput}
                          selectedChainFilter = {selectedChainFilter} handleChain={handleChain}
                          selectedArea={areaLevel} handleArea={handleArea}
                          sliderRanges={sliderRanges[selectedMap]}
            />
          </div>
          
          <div style = {{ backgroundColor: 'black', flex:'1',  height: '90vh', width: '30vw', overflowY:"scroll"}}>
           <Sidebar data = {selectedData} main_feature={main_feature[selectedMap]}
             triggerData = {clickedZone} type={selectedMap} menu_data={menuData}
             range={distribution_ranges[selectedMap]} loading = {loadingSide} 
             />
          </div>
        </div>
      
    );
}