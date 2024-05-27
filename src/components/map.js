import React, {useState, useEffect} from 'react';
import * as d3 from 'd3';
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { quantile } from 'd3-array';
import {scaleThreshold} from 'd3-scale';
import { get_ct_menus } from './mapComponents/DataFetching';
import Sidebar from './sidebar';
import { AreaLevelLayer, generateTractsFromData } from './mapComponents/CensusTractLayer';
import { RestaurantsLayer, generateRestaurantsFromData } from './mapComponents/RestaurantsLayer';
import { getTooltip } from './mapComponents/MapTooltip';
import MapController from './mapComponents/mapController';
import './map.css'
export default function DensityMap({tractsData, restaurantsData, isloaded=true}) {

  const MAP_STYLE = `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${process.env.REACT_APP_MAP_KEY}`;

  // Coordinates located at LA
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
  // Features that are part of the distribution
  const main_feature = {
    'ct':'rnd',
    'restaurant':'rrr'
  }

  // Features that give color in map
  const restaurants_color_feature = "rnd";
  const ct_color_feature = "fend";

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

  // Handles changes of data at area level (eg: Places -> Counties)
  const handleArea = (e) =>{
    const selected_area = e.target.value;
    setArea(selected_area);
    let filtered = tractsData.features.filter((feature) => (feature.properties.geo_type===selected_area));
    let score_values = filtered.map(feature => feature.properties[ct_color_feature]);
    sliderRanges['ct'] = [d3.min(score_values), d3.max(score_values)];
    
    setFilterRange(sliderRanges[selectedMap]);
  }



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

  // Menu data retrieval, for wordcloud
  useEffect(()=> {
    if (selectedData!==null){
      if (selectedMap==='ct') {
          const establishment_ids = selectedData.map(row => row['establishment_id']);
          // Demasiados datos
          if (establishment_ids.length>500){
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

  const restaurants_info = generateRestaurantsFromData({
    restaurantsData: restaurantsData,
     colorScale:colorScale,
    clickedZone:clickedZone, setClickedZone:setClickedZone,
    get_detail_function:get_restaurant_data,
    selectedMap:selectedMap,
    filters: [filters, chainFilters]
  } );

  if (restaurants_info!==null){
    distribution_ranges['ct'] = restaurants_info['distribution_range'];
    sliderRanges['restaurant'] = restaurants_info['distribution_range'];
    layers.push(restaurants_info['layer']);
  }
  else{
    layers.push(null);
  }


  const tracts_info = generateTractsFromData({
    tractsData: tractsData, colorScale:colorScale, color_feature:ct_color_feature,
    clickedZone:clickedZone, setClickedZone:setClickedZone,
    get_detail_function:get_ct_data, selectedMap:selectedMap, filters: filters, areaLevel:areaLevel
  })

  if (tracts_info!==null){
    sliderRanges['ct'] = tracts_info['distribution_ranges'];
    layers.push(tracts_info['layer']);
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