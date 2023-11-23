import * as d3 from 'd3'

export function assignToLabel(values, labels){
    /*
    Retorna diccionario con labels como llaves,
    en cada entrada se guarda un arreglo con los valores que correspondían a ese label
  
    values: arreglo de valores
    labels: arreglo con labels
  
  
     */
    let val_label = {};
      for (let i=0; i<values.length; i++){
          let label = labels[i];
          if (val_label[label]) {
              val_label[label].push(values[i]);
            } else {
              val_label[label] = [values[i]];
            }
      }
    return val_label;
  }

  export function computeMean(dict_of_arrays){
    /*
    Computa el promedio del arreglo correspondiente a cada label.
    dict_of_arrays: Diccionario con arreglos
     */
    let labels = [];
    let means = [];
  
    for (var label in dict_of_arrays) {
      if (dict_of_arrays.hasOwnProperty(label)) {
          var valores = dict_of_arrays[label];
          var promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
          means.push(promedio);
          labels.push(label);
        }
    }
    
    return [labels, means];
  }

  export function linearRegression(xArray, yArray){
    // Calculate Sums
    let xSum=0, ySum=0 , xxSum=0, xySum=0;
    let count = xArray.length;
    for (let i = 0; i < count; i++) {
      xSum += xArray[i];
      ySum += yArray[i];
      xxSum += xArray[i] * xArray[i];
      xySum += xArray[i] * yArray[i];
    }
  
    // Calculate slope and intercept
    let slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
    let intercept = (ySum / count) - (slope * xSum) / count;
  
    return [slope, intercept];
  }
  
  export function rSquare(y_true, y_pred){
    let y_mean = d3.mean(y_true);
    let SSR = 0;
    let SST = 0;
  
    for (let i=0; i<y_true.length; i++){
        SSR += (y_true[i]- y_pred[i])*(y_true[i]- y_pred[i]);
        SST += (y_true[i] - y_mean)*(y_true[i] - y_mean);
    }
    console.log(SSR/SST);
  
    return 1-SSR/SST;
  }
  