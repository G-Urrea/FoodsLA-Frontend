import {DataFilterExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';

export const CensusTractLayer = ({
        data, color_feature, quintiles, color_scale,
        clickedZone, clickedZoneSetter,
        get_detail_function, selectedMap, filters

    }
        ) =>{
    
    return new GeoJsonLayer({
      id: 'ct',
      data: data,
      opacity: 0.8,
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