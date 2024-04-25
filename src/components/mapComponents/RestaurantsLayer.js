import {DataFilterExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';

function get_coordinates(point){
  return point.geometry.coordinates;
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
                console.log('Clicked:', info, event);
                clickedZoneSetter(info.object);
                get_detail_function(info.object.properties['establishment_id']);
            }
            });
}