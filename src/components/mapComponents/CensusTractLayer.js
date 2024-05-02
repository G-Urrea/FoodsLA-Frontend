import {DataFilterExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';
import * as d3 from 'd3';
import { quantile } from 'd3-array';

const quintiles = (value_array) => {return [
  quantile(value_array, 0.2),
  quantile(value_array, 0.4),
  quantile(value_array, 0.6),
  quantile(value_array, 0.8),
  d3.max(value_array) // Quintil superior
]};


export const generateTractsFromData = ({
  tractsData, areaLevel, color_feature, colorScale,
  clickedZone, setClickedZone, get_detail_function,
  selectedMap, filters
}) =>{
  if (tractsData!==null){
    let filtered = tractsData.features.filter((feature) => (feature.properties.geo_type===areaLevel));
    let score_values = filtered.map(feature => feature.properties[color_feature]);
    //sliderRanges['ct'] = [d3.min(score_values), d3.max(score_values)]
   const ctLayer = AreaLevelLayer({
      data: tractsData, color_feature:color_feature,
      quintilFunction:quintiles, colorScaler: colorScale,
      clickedZone: clickedZone, clickedZoneSetter: setClickedZone,
      get_detail_function:get_detail_function,
      selectedMap:selectedMap, filters: filters, geo_type:areaLevel
   });
   return {
    'distribution_ranges':  [d3.min(score_values), d3.max(score_values)],
    'layer': ctLayer
   }
  }
  else{
    return null;
  }


};
export const AreaLevelLayer = ({
  data, color_feature, quintilFunction, colorScaler,
  clickedZone, clickedZoneSetter,
  get_detail_function, selectedMap, geo_type, filters}) => {
    let area_data = {
      type:'FeatureCollection',
      features: data.features.filter((feature) => (feature.properties.geo_type===geo_type))
    };

    const quintil_area = quintilFunction(area_data.features.map(feature => feature.properties[color_feature]));
    const color_scale = colorScaler(quintil_area);

    return CensusTractLayer({
      data: area_data, color_feature:color_feature,
      quintiles:quintil_area, color_scale: color_scale,
      clickedZone: clickedZone, clickedZoneSetter: clickedZoneSetter,
      get_detail_function:get_detail_function,
      selectedMap:selectedMap, filters: filters
    }
    );

  };

export const CensusTractLayer = ({
        data, color_feature, quintiles, color_scale,
        clickedZone, clickedZoneSetter,
        get_detail_function, selectedMap, filters

    }
        ) =>{
    
    return new GeoJsonLayer({
      id: 'ct',
      data: data,
      opacity: 0.15,
      stroked: true,
      filled: true,
      getFillColor: feature => 
            {
              if (clickedZone && (clickedZone.properties['tract'] === feature.properties['tract'])){
                return [255, 255, 255, 255];
              }
              return color_scale(feature.properties[color_feature]);
            },
      updateTriggers: {
        getFillColor: [quintiles, clickedZone] // Actualiza cuando cambian los quintiles

      },
      getLineColor: [0, 0, 0], 
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      pickable: true,
      autoHighlight: true,
      visible: selectedMap=== 'ct',
      getFilterValue: feature => feature.properties[color_feature],
      filterRange: filters,
      extensions: [new DataFilterExtension({filterSize: 1})],
      onClick: (info, event) => {
        console.log('Clicked:', info, event);
        clickedZoneSetter(info.object);
        get_detail_function
        (info.object.properties['tract']);
    }
    });
}