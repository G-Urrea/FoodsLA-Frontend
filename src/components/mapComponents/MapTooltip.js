function getTooltipFromDict({ object }, tooltipDictionary) {
    if (!object || !tooltipDictionary) {
      return null;
    }
    const tooltipContent = Object.entries(tooltipDictionary)
      .map(([label, property]) => {
        const value = object.properties[property];
        return `<div><b>${label}</b>: ${value===null? 'No info' : value}</div>`;
      })
      .join('');
  
    return {
      html: tooltipContent,
    };
  }
  
  export function getTooltip({object}, type){

    if (type==='ct'){
      const tooltipDictionary = {
        'FEND': "fend",
        'Max RND': 'rnd_max',
        'Min RND': 'rnd_min'
        }
        return getTooltipFromDict({object}, tooltipDictionary)
    }
    
    const tooltipDictionary = {
      'Restaurant Chain': 'name',
      'RND': "rnd",
      'Max RRR': "rrr_max",
      "Min RRR": "rrr_min",
      "STD": "rrr_std"
      }
    
    return getTooltipFromDict({object}, tooltipDictionary)
  }