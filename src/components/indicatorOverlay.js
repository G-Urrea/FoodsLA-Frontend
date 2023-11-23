import React from 'react';
import './indicatorOverlay.css'

export default function IndicatorOverlay() {

    return (

        <div className='overlay'>
            <p style = {{
                textAlign:'center'
            }}> Nutritional Score </p>
            <div style={{
                width: "100%",
                height: "6px",
                background: "linear-gradient(90deg, rgb(58, 63, 172) 0px, rgb(58, 63, 172) 20%, rgb(109, 206, 225) 20%, rgb(109, 206, 225) 40%, rgb(247, 228, 50) 40%, rgb(247, 228, 50) 60%, rgb(253, 140, 48) 60%, rgb(253, 140, 48) 80%, rgb(233, 54, 39) 80%, rgb(233, 54, 39) 100%)"
            }}>

            </div>
            <div className='labels'>
                <span>Worst</span>
                <span>Better</span>
            </div>
        </div>
    )
};

