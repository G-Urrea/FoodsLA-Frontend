import {DataFilterExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';

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