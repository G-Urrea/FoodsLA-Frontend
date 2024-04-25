import * as d3 from 'd3'
import { assignToLabel, linearRegression, rSquare, computeMedian} from './utils';
import { round } from '../mapComponents/utils';

function lineBreaker(text, line_length){
  const splitted = text.split(" ");
  let accumulated_length = 0;
  let new_text = '';
  for (let i = 0; i<splitted.length; i++){
    new_text+=splitted[i];
    accumulated_length+=splitted[i].length;
    if (accumulated_length>line_length){
      new_text+='<br>';
      accumulated_length = 0;
    }
    else{
      new_text+=' ';
    }
  }
  return new_text;
}

export function makeScatterPlot({main_feature, correlate_feature}){
  // main_feature y correlate_feature : input de tipo {props...., data:{tract1:value1, tract2:value2}}
  const y_raw = main_feature["data"];
  const x_raw = correlate_feature['data'];
  // Asegurarse de que Y y X estén alineados por area
  let x_to_push = [];
  let y_to_push = [];
  let ct_to_push = []; 
  for (let ct in y_raw){
    // CT en común?
    if (ct in x_raw){
        x_to_push.push(x_raw[ct]);
        y_to_push.push(y_raw[ct])
        ct_to_push.push(ct);
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
  let r2 = round(rSquare(y_to_push, yValues), 3);

  const plotData = [
    {
      x: x_to_push,
      y: y_to_push,
      mode: 'markers',
      type: 'scatter',
      text: ct_to_push,
      hovertemplate: 'FEND: %{y:.2f}' + 
      '<br>'+ correlate_feature['indicator'] +": %{x:.2f}" +
      `${(correlate_feature['measure']===null) ? '' : correlate_feature['measure']} </br> tract id: %{text}`,
      marker: {
        color: y_to_push,
        colorscale: 'Viridis',
        colorbar: {
        title: 'FEND'  // Título de la barra de color
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

  const layoutData = {
    legend:{x:0, y:1},
     width: 1024, height: 576,
    title: lineBreaker(correlate_feature['description'], 60),
     yaxis:{title:{text:'FEND'}},
     xaxis:{title:{text:(correlate_feature['measure']===null) ? '': correlate_feature['measure']}}
  }
  return [plotData, layoutData];

}

export function makeBoxPlot({main_feature, correlate_feature}){
  const raw_y = main_feature['data'];
  const raw_correlate = correlate_feature['data'];

  let x_to_push = [];
  let y_to_push = [];
  for (let ct in raw_y){
    if (ct in raw_correlate){
      x_to_push.push(raw_correlate[ct]);
      y_to_push.push(raw_y[ct])
    }
  }
  // Crear mapeo (feature categorica -> valores que corresponden a feature)
  let dict_of_arrays = assignToLabel(y_to_push, x_to_push);
  const traces = new Array(Object.keys(dict_of_arrays).length); //[];
  // Expandir 
  for (let key in dict_of_arrays){
    let ix = correlate_feature['order_values'][key];
    traces[ix] = 
        {
          y: dict_of_arrays[key],
          name:key,
          type:'box'
        };
  }

  const layout = {
      width: 1024, height: 576,
      title: `Boxplot for ${correlate_feature.indicator}`,
      yaxis:{title:{text:'FEND'}}
  }
  return [traces, layout];

}

export function makeBarPlot({main_feature, correlate_feature}){
  const raw_y = main_feature['data'];
  const raw_correlate = correlate_feature['data'];

  let x_to_push = [];
  let y_to_push = [];
  for (let ct in raw_y){
    if (ct in raw_correlate){
      x_to_push.push(raw_correlate[ct]);
      y_to_push.push(raw_y[ct])
    }
  }

    // Crear mapeo (feature categorica -> valores que corresponden a feature)
    let dict_of_arrays = assignToLabel(y_to_push, x_to_push);
    // Computar mediana
    let median_computed = computeMedian(dict_of_arrays);
    // Ordenar categorias
    let x_ind = new Array(median_computed[0].length);
    let y_ind = new Array(median_computed[1].length);
  
      for (let j=0; j<median_computed[0].length; j++ ){
          let key = median_computed[0][j]; 
          let ix = correlate_feature['order_values'][key];
          x_ind[ix] = key;
          y_ind[ix] = median_computed[1][j]
      }
  
    const traces = [
          {
            x: x_ind,
            y: y_ind,
            type: 'bar',
            hovertemplate:'Median FEND: %{y:.2f}'
          },
        ];
  
    const layout = {
           width: 1024, height: 576,
              title: `Barplot for ${correlate_feature.indicator}`,
              yaxis:{title:{text:'FEND (Median)'}}
            };
  
return [traces, layout];
}