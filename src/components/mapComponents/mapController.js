import React from "react";
import MultiRangeSlider from "multi-range-slider-react";
import IndicatorOverlay from "./indicatorOverlay";
import { round } from "./utils";
import './mapController.css'

export default function MapController({minValue, maxValue, selectedMap, handleChange, handleInput,
     selectedChainFilter, handleChain, selectedArea, handleArea, sliderRanges}){

    // Actualizar datos geográficos cuando se define una nueva fuente de datos
    return (
            <div className='custom_controller'>
                <div style={{width:'12vw'}}>
                    <IndicatorOverlay index={selectedMap}/>
                </div>
                <div style={{paddingTop:'5px'}}>
                    <div>Data Range By Index:</div>
                    <div>
                    
                    <MultiRangeSlider
                        min={Math.floor(sliderRanges[0])}
                        max={round(sliderRanges[1], 2)}
                        step={(sliderRanges[1]-sliderRanges[0])/100}
                        minValue={minValue}
                        maxValue={maxValue}
                        ruler={false}
                        barInnerColor='#3a3fac'
                        style = {
                        {border:"none", boxShadow:"none", width:'10vw'}
                        }
                        onInput={(e) => {
                            handleInput(e);
                        }}
                    />
                </div>
                </div>
                    <div className='map-selector'>
                        <div>Data by:</div>
                        <div>
                            <select value={selectedMap} onChange={handleChange}>
                                <option value="ct">Environment</option>
                                <option value="restaurant">Restaurants</option>
                            </select>
                        </div>
                    </div>
                {selectedMap==='ct' && (
                    <div> 
                        <div>Area Level</div>
                        <div>
                            <select value={selectedArea} onChange={handleArea}>
                                <option value="ct">Census Tracts</option>
                                <option value ="place"> Places</option>
                                <option value ="county">Counties</option>
                                <option value = "neighborhood">Neighborhood</option>
                            </select>
                        </div>
                    </div>
                )}
                {selectedMap==='restaurant' && (
                    <div > 
                        <div>Show restaurants</div>
                        <div>
                            <select value={selectedChainFilter} onChange={handleChain}>
                                <option value="all">All available</option>
                                <option value ="chains"> Chain Restaurants</option>
                                <option value ="no_chain">Non-Chain Restaurants</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

    );
}