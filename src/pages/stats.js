import React, {useState, useEffect} from 'react';
import { makeScatter, makeBar, makeBox } from '../components/statsComponents/makePlots';
import { StatsPlot } from '../components/statsComponents/StatsPlot';
import Plot from 'react-plotly.js';

export default function Stats(){
    const [seleccion, setSeleccion] = useState('scatter');
    const [isLoading, setLoading] = useState(true);
    const [numData, setNumData] = useState(null);
    const [catData, setCatData] = useState(null);

    
    const handleChange = (event) => {
    
        let selection = event.target.value;
        setSeleccion(selection);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
              const [response1, response2] = await Promise.all([
                fetch(`${process.env.REACT_APP_API_URL}/numind/`),
                fetch(`${process.env.REACT_APP_API_URL}/catind/`),
              ]);
              // Realiza las solicitudes en paralelo
        
              const data1 = await response1.json();
              const data2 = await response2.json();
              // Parsea las respuestas de las solicitudes a objetos JavaScript
        
              setNumData(data1);
              setCatData(data2);
              setLoading(false);
              // Almacena los resultados en el estado
            } catch (error) {
              console.error('Error:', error);
            }
          };
        
          fetchData();
   
      }, []);

    const titles = {
        'scatter': 'FEND Distribution (Census tract level)',
        'box': 'FEND Distribution By Categorical Feature',
        'bar': 'Mean FEND Distribution by Categorical Feature'
    }

    if (isLoading){
        return (
            <div style={{ height:'100vh'}}>
                <h1>Select a chart type</h1>
                <select value={seleccion} onChange={handleChange}>
                    <option value="scatter">Scatterplot</option>
                    <option value="box">Boxplot</option>
                    <option value="bar">Barplot</option>
                    
                </select>
                <div >
                    <h2>{titles[seleccion]}</h2>
                    <Plot layout = {{
                        title:'Loading...',
                        width: 1024,
                        height: 576
                    }}/>

                </div>
            </div>
            );

    }
    console.log(isLoading);
    console.log('Rendering ...');

    const scatter_data = makeScatter({data: numData[0], main_feature: "rrr"}); // <DropScatter data = {numData[0]}  main_feature={"rrr"}>
    const bar_data = makeBar({data:catData[0], main_feature:numData[0]['rrr']}); // <DropBarplot  main_feature = {numData[0]['rrr']} indicators_data={catData[0]}/>
    const box_data = makeBox({data: catData[0], main_feature: numData[0]['rrr']}); //<DropBoxplot2 main_feature_data={numData[0]['rrr']} indicators_data={catData[0]}/>

    return (
        <div >
            <h1>Select a chart type</h1>
            <select value={seleccion} onChange={handleChange}>
                <option value="scatter">Scatterplot</option>
                <option value="box">Boxplot</option>
                <option value="bar">Barplot</option>
                
            </select>
            
            <div >
                <div>
                    <h2>{titles[seleccion]}</h2>
                    {seleccion === 'scatter' &&
                    <StatsPlot traces = {scatter_data[0]} layouts = {scatter_data[1]} indicators={scatter_data[2]}/>              
                    }
                    {seleccion==='box' &&
                        <StatsPlot traces={box_data[0]} layouts={box_data[1]} indicators={box_data[2]}/>
                    }

                    {seleccion==='bar' &&
                        <StatsPlot traces={bar_data[0]} layouts={bar_data[1]} indicators={bar_data[2]} />
                    }
            
                </div>
            </div>       
        </div>
        );
}