import { round } from "./utils";
function getTooltipFromDict({ object }, tooltipDictionary) {
    if (!object || !tooltipDictionary) {
      return null;
    }
    const tooltipContent = Object.entries(tooltipDictionary)
      .map(([label, property]) => {
        let value = object.properties[property];
        if ((typeof value) == 'number'){
          value = round(value, 3);
        }
        return `<div><b>${label}</b>: ${value===null? 'No info' : value}</div>`;
      })
      .join('');
  
    return {
      html: tooltipContent,
    };
  }
  
  function getTooltipForCT({object}){
    if (!object ) {
      return null;
    }

    const props = object.properties;
    const tooltipContent = `
    <div><b>Tract</b>: ${props.namelsad}</div>
    <div><b>FEND (RND Median)</b>: ${round(props.fend, 2)}</div>
    <div><b>RND [Min, Max]</b>: [${round(props.rnd_min, 2)}, ${round(props.rnd_max, 2)}]</div>
    <div><b>RND Std </b>: ${round(props.rnd_std, 2)}</div>
    `
    return {
      html: tooltipContent,
    };
  }

  function getTooltipForRestaurant({object}){
    if (!object ) {
      return null;
    }

    const props = object.properties;
    const tooltipContent = `
    <div><b>Chain ID: ${props.chain?  `${props.establishment_id} (${props.name})`: 'No info' }</div>
    <div><b>RND (RRR Median)</b>: ${round(props.rnd, 2)}</div>
    <div><b>RRR [Min, Max]</b>: [${round(props.rrr_min, 2)}, ${round(props.rrr_max, 2)}]</div>
    <div><b>RRR Std </b>: ${round(props.rrr_std, 2)}</div>
    `
    return {
      html: tooltipContent,
    };
  }

  export function getTooltip({object}, type){

    if (type==='ct'){
        return getTooltipForCT({object})
    }
    
    return getTooltipForRestaurant({object});
  }