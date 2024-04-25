import React from 'react';
import Plot from 'react-plotly.js';
import ReactWordcloud from 'react-wordcloud';
import { round } from './mapComponents/utils';
import { removeStopwords, eng, spa } from 'stopword';
import { extract } from 'words-n-numbers';

// Sidebar: Acompaña al mapa, muestra información 
 function Sidebar({ data, range, main_feature, triggerData, type, menu_data, loading=false}) {

    let xData = [];

    if ((data!==undefined) && (data!==null) ){
        xData = data.map(feature => feature[main_feature]);
    }

    let menuCount = {}; 
    if ((menu_data!==undefined) && (menu_data!==null)){
        for (let i=0; i<menu_data.length; i++ ){
            let menu = menu_data[i];
            let menuSplit = extract(menu, { toLowercase: true });
            menuSplit = removeStopwords(menuSplit ===null ? [] : menuSplit, [...eng, ...spa, ...['oz']]);
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
    const plot_titles = {
        'ct': 'Restaurant Nutrient Density <br> (RND) <br> Index Distribution',
        'restaurant': 'Menu Item Nutrient Density <br> (RRR) <br> Index Distribution'
    };
    const bins = 6;

    return (
        <div style={{ backgroundColor: 'black', 'color': 'white', position: 'relative', width: '100%'}}>
            <div style={{ position: 'absolute', width: '100%', display:'flex', justifyContent:'center', flexDirection:'column', alignItems:'center'}}>
                <h2 style = {{textAlign:"center"}}>Details</h2>
                {!data && !loading && (
                <p>Click an area for more information</p>
                )}
                {!data && loading  && (<p>Loading distribution data...</p>)}
                
                {data && loading && (<p>Loading distribution data...</p>)}
                
                {data  && !loading && (
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
                                        start: range[0],
                                        end: range[1]+1,
                                        size: (range[1] - range[0]) / bins
                                    },
                                    
                                    type: 'histogram'
                                }
                            ]}
                            layout={{ width: 300, height: 250, title: plot_titles[type],
                                 xaxis : {
                                tickmode : 'linear',
                                range: [range[0], range[1]],
                                tick0 : range[0],
                                dtick : (range[1] - range[0]) / bins,
                                autorange: false
                            } }}
                            config={{ responsive: true }}
                        />
                    )
                }
                
                
                    {data && type==='ct' && (
                       <div> 
                        <p>Restaurants: {xData.length}</p>
                        <p>Fend: {round(triggerData.properties["fend"], 2)}</p>
                        <p>RND [Min, Max] : [{round(triggerData.properties["rnd_min"], 2)}, {round(triggerData.properties["rnd_max"], 2)}]</p>
                        </div>
                    )}

                    {data && type==='restaurant' && (
                       <div> 
                        <p>RND: {round(triggerData.properties["rnd"], 2)}</p>
                        <p>RRR [Min, Max] : [{round(triggerData.properties["rrr_min"], 2)}, {round(triggerData.properties["rrr_max"], 2)}]</p>
                        </div>
                    )}
                    
                    {data && (
                        <div>
                            <h4>Menu Overview</h4>
                        {menu_data &&  (words.length>0) && ( <div style={{background:'white'}}>
                                                <ReactWordcloud words={words} size={[300, 200]}
                                                options = {{fontWeight:'bold', fonstSizes:[15,20], deterministic:true, transitionDuration:0}}/>
                                                </div>
                                        )}
                        {menu_data &&  (words.length===0) && ( <p>Not available at this level<br/>(Too many restaurants)</p>
                                        )}
                        {!menu_data && (<p> Loading data...</p>)}
                        </div>
                    )}
                    
            </div>
        </div>
    );

};

export default React.memo(Sidebar);