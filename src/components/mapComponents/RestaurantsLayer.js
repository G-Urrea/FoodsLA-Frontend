import {DataFilterExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';
import { quantile } from 'd3-array';
import * as d3 from 'd3';

function get_coordinates(point){
  return point.geometry.coordinates;
}

const quintiles = (value_array) => {return [
  quantile(value_array, 0.2),
  quantile(value_array, 0.4),
  quantile(value_array, 0.6),
  quantile(value_array, 0.8),
  d3.max(value_array) 
]};

export const generateRestaurantsFromData = ({
  restaurantsData, colorScale,
  clickedZone, setClickedZone,
  get_detail_function,
  selectedMap,
  filters
}) => {
  /*
  Inputs:
  - restaurantsData: Object with the following format:
  - colorScale: Function to map scores to colors
  - clickedZone: Object that represents the selected zone in the map
  - setClickedZone: Setter for the selected zone in map
  - selectedMap: State that indicates the kind of map the user is visualizing (Tracts or Restaurants)
  - filters: Array with the current value of the filers

  Output:
  - NULL if data is NULL
  - Otherwise: {
    'distribution_range':[lower, higher],
    'layer': GeoJsonLayer(...)
  }
   */
  if (restaurantsData!==null){
    let restaurant_values = restaurantsData.features.map(feature => feature.properties['rnd']);
    const distribution_ranges = [d3.min(restaurant_values), d3.max(restaurant_values)];
   

    // We only leave one score per restaurant chain for the purpose of computing quintiles

    const chain_score = {};
    for (let ix = 0; ix<restaurantsData.features.length; ix++){
      let chain_id = restaurantsData.features[ix].properties['establishment_id'];
      let score = restaurantsData.features[ix].properties['rnd'];
      chain_score[chain_id] = score;
    }
    const restaurantUniqueScores = [];
    for (var key in chain_score){
      restaurantUniqueScores.push(chain_score[key]);
    }
    const pointQuintiles = quintiles(restaurantUniqueScores);
    const pointColorScale = colorScale(pointQuintiles);
    const pointLayer = RestaurantsLayer({
      data: restaurantsData,
      color_feature: 'rnd',
      quintiles: pointQuintiles,
      color_scale: pointColorScale,
      clickedZone: clickedZone, clickedZoneSetter: setClickedZone,
      get_detail_function: get_detail_function,
      selectedMap: selectedMap, filters: filters

  });
  return {
    'distribution_range': distribution_ranges,
    'layer':pointLayer
  }
}
  else{
    return null;
  }
}

export const RestaurantsLayer = ({
        data, color_feature, quintiles, color_scale,
        clickedZone, clickedZoneSetter,
        get_detail_function, selectedMap, filters

    }) => {
        return new GeoJsonLayer({
              id: 'points',
              data: data,
              opacity: 0.8,
              stroked: true,
              filled: true,
              getFillColor: feature => color_scale(feature.properties[color_feature]),
              updateTriggers: {
                getFillColor: quintiles, // Actualiza cuando cambian los quintiles
                getLineColor: [clickedZone]
              },
              getLineColor: point =>{
                if ( clickedZone && (get_coordinates(point)[0]=== get_coordinates(clickedZone)[0]) &&
                    (get_coordinates(point)[1] === get_coordinates(clickedZone)[1])
                ){
                  return [255, 255, 255]
                }
                return [0, 0, 0];
              }, 
              getFilterValue: feature => [feature.properties[color_feature], feature.properties['is_chain']],
              filterRange: filters,
              extensions: [new DataFilterExtension({filterSize: 2})],
              getLineWidth: 2,
              lineWidthUnits: 'pixels',
              getPointRadius: 3,
              pointRadiusUnits: 'pixels',
              pickable: true,
              autoHighlight: true,
              visible: selectedMap=== 'restaurant',
              onClick: (info, event) => {
                //console.log('Clicked:', info, event);
                clickedZoneSetter(info.object);
                get_detail_function(info.object.properties['establishment_id']);
            }
            });
}