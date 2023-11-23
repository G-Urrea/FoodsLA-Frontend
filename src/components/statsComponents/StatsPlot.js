import React, {useState} from "react";
import Plot from 'react-plotly.js';

export function StatsPlot({ traces, layouts, indicators}){
    /*
    traces : Diccionario indexado por indicators, los elementos son arreglos de traces (datos a visualizar)
    layouts: Diccionario indexado por indicators, contiene configuraciones para el layout
    indicators: Arreglo con indicadores
     */
    
    console.log(traces);
    const [traceData, setTraceData ] = useState(traces[indicators[0]]);
    const [layoutData, setLayout] = useState(layouts[indicators[0]]);
    const handleChange = (event) => {
      const selectedOption = event.target.value;
      setTraceData(traces[selectedOption]);
      setLayout(layouts[selectedOption]);
    };
  
    return (
      <div>
        <div className="dropdowns" style={{"padding-bottom":"1em"}}>
          <label>Select a feature:</label><br/>
          <select onChange={handleChange}>
            {indicators.map((option, index) => (
              <option key={index} value={option}>
                {indicators[index]}
              </option>
            ))}
          </select>
        </div>
        <Plot
          data={traceData}
          layout={layoutData}
        />
      </div>
    );
  }