import React from 'react';
import './MapMenu.css'
import IndicatorOverlay from './indicatorOverlay';
import MultiRangeSlider from "multi-range-slider-react";

export default function MapMenu({minValue: min}){
    return (
    <div className = 'mainMenu'>
        <div style={{width:'12vw'}}>
            <IndicatorOverlay></IndicatorOverlay>
        </div>
            <div style={{paddingTop:'5px'}}>
            <div>Data range by score:</div>
            <div>
            
            <MultiRangeSlider
            min={0}
            max={2.3}
            step={(2.3)/100}
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
            /></div>
        </div>
        <div style={
            {display:'flex', flexDirection:'row', justifyContent:'space-between',
            paddingBottom:'5px', width:'14vw'
        }}>
            <div>Data by:</div>
            <div>
            <select value={selectedMap} onChange={handleChange}>
                <option value="ct">Census Tract</option>
                <option value="restaurant">Restaurants</option>
            </select>
            </div>
        </div>
        
    </div>);
    }