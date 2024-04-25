import React, {useState} from "react";
import Plot from 'react-plotly.js';
import { makeBarPlot, makeBoxPlot, makeScatterPlot } from "./makePlots";

export function LoadingPlot({title}){
  return (
      <div >
        <h2>{title}</h2>
        <Plot layout = {{
            title:'Loading...',
            width: 1024,
            height: 576
        }}/>
    </div>
  );
}

function categoricalConfig({main, second}){
  const boxInfo = makeBoxPlot({main_feature:main, correlate_feature:second});
  const barInfo = makeBarPlot({main_feature:main, correlate_feature: second});

  const tracesInfo = [...boxInfo[0],...barInfo[0]];
  const tracesType = tracesInfo.map(trace => trace.type);
  const visibilityArray = (label) => {return tracesType.map(type => (type===label))};
  for (let i=0;i<tracesInfo.length; i++){
    if (tracesType[i]==='bar'){
      tracesInfo[i]['visible'] = true;
    }
    else{
      tracesInfo[i]['visible'] = false;
    }
  }

  const updatemenus= [{
          y: 0.8,
          yanchor: 'top',
          buttons: [{
            method: 'update',
            args: [{'visible': visibilityArray('bar')}, {'title.text': barInfo[1].title, 'yaxis':{'title':barInfo[1].yaxis.title}}],
            label: 'Bar'
        }, {
            method: 'update',
            args: [{'visible': visibilityArray('box')}, {'title.text': boxInfo[1].title, 'yaxis':{'title':boxInfo[1].yaxis.title}}],
            label: 'Box'
        }]
      }]

  const layout = barInfo[1];
  layout['updatemenus'] = updatemenus;

  return [tracesInfo, layout]
}
export function NewStatsPlot({main, second}){

    let traceData = [];
    let layoutData = {
      title:'Loading...',
      width: 1024,
      height: 576
  };
    if ((main!==null) && (second!==null)){
      if (second.type==='Numerical'){
          const info = makeScatterPlot({main_feature:main, correlate_feature:second});
          traceData = info[0];
          layoutData = info[1];
        }
    
        if (second.type==='Categorical'){
            
          const info = categoricalConfig({main, second});
          traceData = info[0];
          layoutData = info[1];
        }

    }
      return (
        <div>
        <Plot
          data={traceData}
          layout={layoutData}
          config={{staticPlot:true}}
        />
      </div>

    );

  
}
export function StatsPlot({ traces, layouts, indicators}){
    /*
    traces : Diccionario indexado por indicators, los elementos son arreglos de traces (datos a visualizar)
    layouts: Diccionario indexado por indicators, contiene configuraciones para el layout
    indicators: Arreglo con indicadores
     */
    
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