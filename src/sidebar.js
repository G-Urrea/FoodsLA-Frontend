import React from 'react';
import * as d3 from 'd3'
import Plot from 'react-plotly.js';
import ReactWordcloud from 'react-wordcloud';

function round(number, decimals){
    if (decimals >0){
        return Math.round(number*(10**decimals))/(10**decimals);
    }
    return Math.round(number);
}
// Sidebar: Acompaña al mapa, muestra información 
 function Sidebar({ data, main_feature, triggerData, type, menu_data }) {

    let xData = [];

    console.log(main_feature);
    if ((data!==undefined) && (data!==null) ){
        xData = data.map(feature => feature[main_feature]);
    }

    let menuCount = {}; //[{text:'asda', value:1212}]
    if ((menu_data!==undefined) && (menu_data!==null)){
        for (let i=0; i<menu_data.length; i++ ){
            let menu = menu_data[i];
            let menuSplit = menu.split(" ");
            for (let j=0; j<menuSplit.length; j++){
                let word = menuSplit[j];
                if (word in menuCount){
                    menuCount[word]+=1;
                }
                else{
                    menuCount[word]=1;
                }
            }
        }
    };

    let words_temp = [];
    for (let key in menuCount){
        words_temp.push(
            {
                text: key,
                value:menuCount[key]
                }
        );
    }
    const words = words_temp;

    return (
        <div style={{ 'background-color': 'black', 'color': 'white', position: 'relative', width: '100%'}}>
            <div style={{ position: 'absolute', width: '100%', display:'flex', justifyContent:'center', flexDirection:'column', alignItems:'center'}}>
                <h2 style = {{textAlign:"center"}}>Details</h2>
                {!data && (
                <p>Select an area for more information</p>
                )}
                
                {data && (
                    <Plot
                        data={[
                            {
                                x: xData,
                                marker: {
                                    color: 'blue', // Color de las barras del histograma
                                    line: {
                                        color: 'black', // Color de las líneas de los bins
                                        width: 2,       // Ancho de las líneas de los bins
                                    }
                                },
                                autobinx: false,
                                xbins: {
                                    start: d3.min(xData),
                                    end: d3.max(xData)+1,
                                    size: (d3.max(xData) - d3.min(xData)) / 4
                                },
                                type: 'histogram'
                            }
                        ]}
                        layout={{ width: 300, height: 250, title: 'Score distribution' }}
                        config={{ responsive: true }}
                    />
                )}
                
                
                    {data && type==='ct' && (
                       <div> 
                        <p>Restaurants: {xData.length}</p>
                        <p>Fend: {round(triggerData.properties["fend"], 3)}</p>
                        <p>Max RND: {round(triggerData.properties["rnd_max"], 3)}</p>
                        <p>Min RND: {round(triggerData.properties["rnd_min"], 3)}</p>
                        </div>
                    )}

                    {data && type==='restaurant' && (
                       <div> 
                        <p>RND: {round(triggerData.properties["rnd"], 3)}</p>
                        <p>Max RRR: {round(triggerData.properties["rrr_max"], 3)}</p>
                        <p>Min RRR: {round(triggerData.properties["rrr_min"], 3)}</p>
                        </div>
                    )}

                    {menu_data && (
                                        <div>
                                            <h4>Menu Overview</h4>
                                            <div style={{background:'white'}}>
                                            <ReactWordcloud words={words} size={[300, 200]}
                                             options = {{fontWeight:'bold', fonstSizes:[15,20]}}/>
                                            </div>
                                        </div>
                                    )
                                    }
            </div>
        </div>
    );

};

export default React.memo(Sidebar);