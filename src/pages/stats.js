import React, {useEffect, useState} from 'react';
import { NewStatsPlot } from '../components/statsComponents/StatsPlot';
import { processData } from '../components/mapComponents/DataFetching';


// <option value='ct'>Census Tracts</option>
function AreaDropdown({areaLevel, setter}){
    const handleChange = (event) => {
        let selection = event.target.value;
        setter(selection)
    };
    return (
        <div>
            <select value={areaLevel} onChange={handleChange}>
            <option value='ct'>Census Tracts</option>
            <option value='place'> Places</option>
            <option value='neighborhood'>Neighborhood</option>
        </select>
      </div>)
}
function IndicatorsDropdown({indicators, areaLevel, setter}){
    // Categorías que no se utilizan para correlacionar
    const categories_exception = ['Nutritional Score', 'Nutrition Density Distribution', 'Disability']
    // Crear diccionario y lista de categorias para correlacionar
    const categories = {};
    const categories_list = [];
    const indicators_dict = {};

    for (let i =0; i<indicators.length; i++){
        let indicator = indicators[i];
        let category = indicator.category;
        let indicator_id = `${indicator.indicator} (${indicator.data_value_type})`
        if (!categories_exception.includes(category)){
            indicators_dict[indicator_id] = indicator;
            if (category in categories){
                categories[category].push(indicator_id);
            }
            else{
                categories_list.push(category);
                categories[category] = [indicator_id];
            }
        }
    }

    const get_set_ind = async(url, setter) => {
        try {
            setter(null);
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            const processed = processData({data:data, geo_type:areaLevel})
            setter(processed);
    
          }catch (error) {
              console.error('Error:', error);
            }
        }
      

    const handleChange = (event) => {
        let selection = indicators_dict[event.target.value];
        
        let urls = {
            'Numerical': `${process.env.REACT_APP_API_URL}/numind`,
            'Categorical': `${process.env.REACT_APP_API_URL}/catind`
        };
        let final_url=`${urls[selection.type]}/?indicator_id=${selection.id}`;
        console.log(final_url);
        get_set_ind(final_url, setter);
    };

    return (
        <select onChange={handleChange}>
        {categories_list.map((category, index) => (
         <optgroup label={category}>
            {categories[category].map((indicator, index) =>(
                <option key={indicator} value={indicator}>
                {indicator}
                </option>
            ))}           
          </optgroup>
        ))}
      </select>
    );
}

export default function Stats({mainData}){
    const [correlateData, setCorrelateData] = useState(null);
    const [indicators, setIndicators] = useState(null)
    const [areaLevel, setAreaLevel] = useState('ct');

    useEffect(()=>{
        const fetchIndicators= async() =>{
            setIndicators(null);
            setCorrelateData(null);
            try {
              const response = await fetch(`${process.env.REACT_APP_API_URL}/indicators/?available&geo_type=${areaLevel}`);
              const data = await response.json();
              setIndicators(data);
      
            }catch (error) {
                console.error('Error:', error);
              }
          }
          fetchIndicators();
    }, [areaLevel])

    useEffect(()=>{
          const fetchDefaultCorrelate = async() =>{
            try {
             const categories_exception = ['Nutritional Score', 'Nutrition Density Distribution', 'Disability']
              const valid_indicators = indicators.filter( (ind) => (!categories_exception.includes(ind)))
              const response = await fetch(`${process.env.REACT_APP_API_URL}/numind/?indicator_id=${valid_indicators[1].id}&format=json&geo_type=${areaLevel}`);
              const data = await response.json();
              setCorrelateData(processData({data:data, geo_type:areaLevel}));
      
            }catch (error) {
                console.error('Error:', error);
              }
          }
          if (indicators!==null){
            fetchDefaultCorrelate();
        }
    }, [indicators, areaLevel])


    const available = !((indicators===null) || (mainData===null))
    if (!available){
        return (
            <div style={{ height:'100%'}}>
                <h1>Correlation Between Food Environmnent Nutrition Density and Health, Demographic Variables in <br/>Los Angeles County</h1>
                    <h2>Area Level</h2>
                    <p>Loading...</p>
                    <p style ={{fontSize:'1.1em'}}> Select a variable to correlate</p>
                    <p>Loading...</p>
                    <NewStatsPlot main={mainData} second={correlateData}/>
            </div>
            );

    }
    let main_processed = processData({data:mainData, geo_type:areaLevel});
    return (
        <div >
            <h1>Correlation Between Food Environmnent Nutrition Density<br/> and Health, Demographic Variables in <br/>Los Angeles County</h1>
            <h2>Area Level</h2>
                    <AreaDropdown areaLevel ={areaLevel} setter={setAreaLevel}/>
                <p style ={{fontSize:'1.1em'}}> Select a variable to correlate</p>

                    <IndicatorsDropdown indicators={indicators} areaLevel={areaLevel} setter={setCorrelateData}/>
            <div style={{ height:'100%'}}>
                <div style={{marginTop:'2%'}}>
                    <NewStatsPlot main={main_processed} second={correlateData}/>
                </div>
            </div>       
        </div>
        );
}