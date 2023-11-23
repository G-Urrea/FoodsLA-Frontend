import * as d3 from 'd3'
import { assignToLabel, computeMean, linearRegression, rSquare } from './utils';


export function makeBox({data, main_feature}){
    /*
    main_feature: nombre de caracteristica que irá en eje y
    indicators: arreglo de nombres de indicadores

   */
  // y -> arreglo de valores de main_feature

  // trace -> {y: y[cat1], type:'box'}
  // traces -> {ind1: [tracei1, tracei2,..]}
  const y = main_feature["data"];
  
  const indicators = [];
  const indicators_long = [];
  for (let ind in data){
      indicators.push(ind);
      indicators_long.push(data[ind]['indicator']);
  }

  // Rellenar datos
  const traces = {};
  const layouts = {};
  for (let i = 0; i<indicators.length; i++){
    let indicator_key = indicators[i];
    let indicator = indicators_long[i];
    let x_temp = data[indicator_key]["data"]; 
    let x_to_push = [];
    let y_to_push = [];
    for (let ct in x_temp){
      if (y[ct]!==undefined && x_temp[ct]!=null && y[ct]!=null){
        x_to_push.push(x_temp[ct]);
        y_to_push.push(y[ct])
      }
    }
    // Crear mapeo (feature categorica -> valores que corresponden a feature)
    let dict_of_arrays = assignToLabel(y_to_push, x_to_push);
    let traces_for_ind = new Array(Object.keys(dict_of_arrays).length); //[];
    // Expandir 
    for (let key in dict_of_arrays){
      let ix = data[indicator_key]['order_values'][key];
      traces_for_ind[ix] = 
          {
            y: dict_of_arrays[key],
            name:key,
            type:'box'
          };
    }
    traces[indicator] = traces_for_ind;
    layouts[indicator] = {
        width: 1024, height: 576,
        title: `Boxplot for ${indicator}`,
        yaxis:{title:{text:'RRR'}}
    }
}

  return [traces, layouts, indicators_long];
}

export function makeBar({data, main_feature}){
    /*

    Crea traces, layouts y un arreglo de indicadores para crear un Barplot con dropdown
    data: Datos de indicadores categoricos
    main_feature: Datos de indicador númerico principal}
    */
    const y = main_feature['data'];
    const indicators = [];
    const indicators_long = [];
    for (let ind in data){
         indicators.push(ind);
         indicators_long.push(data[ind]['indicator']);
     }

  // Rellenar datos
  const traces = {};
  const layouts = {};
  for (let i = 0; i<indicators.length; i++){
    let indicator_key = indicators[i];
    let indicator = indicators_long[i];
    let x_temp = data[indicator_key]["data"];
    let x_to_push = [];
    let y_to_push = [];

    for (let ct in x_temp){
      if (y[ct]!==undefined && x_temp[ct]!=null && y[ct]!=null){
        x_to_push.push(x_temp[ct]);
        y_to_push.push(y[ct])
      }
    }

    // Crear mapeo (feature categorica -> valores que corresponden a feature)
    let dict_of_arrays = assignToLabel(y_to_push, x_to_push);
    // Computar promedio
    let mean_computed = computeMean(dict_of_arrays);
    // Ordenar categorias
    let x_ind = new Array(mean_computed[0].length);
    let y_ind = new Array(mean_computed[1].length);

    for (let j=0; j<mean_computed[0].length; j++ ){
        let key = mean_computed[0][j]; 
        let ix = data[indicator_key]['order_values'][key];
        x_ind[ix] = key;
        y_ind[ix] = mean_computed[1][j]
    }

    traces[indicator] = [
        {
          x: x_ind,
          y: y_ind,
          type: 'bar',
          hovertemplate:'Mean RRR: %{y:.2f}'
        },
      ];

    layouts[indicator] = {
         width: 1024, height: 576,
        title: `Barplot for ${indicator}`,
        yaxis:{title:{text:'RRR'}}};
  }

  return [traces, layouts, indicators_long];
}

export function makeScatter({data, main_feature}){
    const y = data[main_feature]["data"];
    const indicators = []; // Arreglo con nombres cortos de indicadores
    const indicators_long = []; // Arreglo con nombres de indicadores
    for (let ind in data){
      if (ind!==main_feature){
        indicators.push(ind);
        indicators_long.push(data[ind]['indicator'])
      }
    }
    
    const plotData = {}; // Mapea indicador -> Lista de traces
    const layoutData = {} // Mapea indicador -> Layout
  
    // Rellenar datos
    for (let i = 0; i<indicators.length; i++){
      let indicator_key = indicators[i];
      let indicator_long = indicators_long[i];
      let x_temp = data[indicator_key]["data"] 
      let x_to_push = [];
      let y_to_push = [];
      // Tener arreglos mapeados
      for (let ct in x_temp){
        if (y[ct]!==undefined && x_temp[ct]!=null && y[ct]!=null){
          x_to_push.push(x_temp[ct]);
          y_to_push.push(y[ct])
        }
      }
      let coefs = linearRegression(x_to_push, y_to_push); // [slope, intercept]
      
      // Generar línea de regresión
      let xMin =d3.min(x_to_push);
      let xMax = d3.max(x_to_push);
      
      let yPlot = [xMin*coefs[0] +coefs[1], xMax*coefs[0] +coefs[1]];
      let xPlot = [xMin, xMax];
  
      let yValues = [];
      for (let x in x_to_push){
        yValues.push(x*coefs[0] + coefs[1]);
      }
      //  Calcular R^2
      let r2 = rSquare(y_to_push, yValues);
  
      plotData[indicator_long] = [
        {
          x: x_to_push,
          y: y_to_push,
          mode: 'markers',
          type: 'scatter',
          hovertemplate: main_feature +': %{y:.2f}' + 
          '<br>'+ indicator_key +": %{x:.2f}" +
          `${(data[indicator_key]['measure']===null) ? '' : data[indicator_key]['measure']} </br>`,
          marker: {
            color: y_to_push,
            colorscale: 'Viridis',
            colorbar: {
            title: main_feature  // Título de la barra de color
            }
          },
          showlegend:false
        },
        {
          x:xPlot,
          y:yPlot,
          mode: 'lines',
          type:'scatter',
          name: `R2: ${r2}`
        }
      ];
  
      layoutData[indicator_long] = {
        legend:{x:0, y:1},
         width: 1024, height: 576,
        title: data[indicator_key]['description'],
         yaxis:{title:{text:main_feature}},
         xaxis:{title:{text:(data[indicator_key]['measure']===null) ? '': data[indicator_key]['measure']}}
    }
    }
    console.log(plotData);
    return [plotData, layoutData, indicators_long];
  
  }