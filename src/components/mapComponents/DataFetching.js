/*
Functions for serializing data from backend into valid GeoJSON.
 */

function serializeApiGeojson(geojson, fields, geometry_field){
  return ({
    type:'FeatureCollection',
    features:
       (geojson).map(segment=>({
          'type':'Feature',
          'geometry': JSON.parse(segment[geometry_field]),
          'properties': Object.fromEntries( fields.map( x => [x, segment[x] ]) )
       })
    )
  });
}

export function serializeRestaurants(geojson){
  const fields = ['facility_name', 'establishment_id', 'rrr_max', 'rnd', 'rrr_min', 'rrr_std', "name",
  "chain"];
  let serialized = serializeApiGeojson(geojson, fields, 'geometry');
  for (let i=0; i<serialized.features.length; i++){
    let property = serialized.features[i].properties;
      serialized.features[i].properties.is_chain = (property.chain===false ? 0 : 1)
  }
  return serialized
}

export function serializeTracts(geojson){
  const fields =  ["namelsad",'geometry', 'geo_type', 'rnd_min', 'rnd_max', 'rnd_std', 'fend', 'tract'];
  return serializeApiGeojson(geojson, fields, 'geometry');
}


// Function for obtaining Menus 
export async function get_ct_menus(urls, setter){
  try{
    const menu_jsons = await Promise.all(
      urls.map(async url => {
        const resp = await fetch(url);
        return resp.json();
      }));
    const menus = menu_jsons.map(menu => menu.map(row=>row['menu'])).flat();
    setter(menus);
  } catch (error) {
    console.error('Error al obtener la información:', error);
  }
}

export function processData({data, geo_type}){
    // Se le pasa el arreglo de datos de un sólo indicador
    const data_filtered = data.filter((feature) => (feature.geo_type===geo_type))
    let data_values = {};
    let data_order = {}
    for (let i=0; i<data_filtered.length; i++){
        let row = data_filtered[i];
        data_values[row.tract] = row.value;
        if ('order_value' in row){
            data_order[row.value] = row.order_value
        }
    }
    let props = {};
    let not_props = ['value', 'indicator', 'order_value']
    let special_mapping = {'indicator_name':'indicator', 'indicator_category':'category'}
    for (let key in data_filtered[0]){
        if (!not_props.includes(key)){
            if (key in special_mapping){
                props[special_mapping[key]] = data_filtered[0][key];
            }
            else{
                props[key] = data_filtered[0][key];
            }        
        }
    }
    props['data'] = data_values;
    if ('order_value' in data_filtered[0]){
        props['order_values'] = data_order;
    }
    return props;
}