import React from 'react';
import './indicatorOverlay.css'

export default function IndicatorOverlay({index}) {

    const colors = ['#e93627',
    '#fd8c30',
    '#f7e432',
    '#6dcee1',
    '#3a3fac'];

    // Obtener la barra de progresión
    // Calcular el ancho de cada segmento de color
    const segmentWidth = 100 / colors.length;

    // Crear y aplicar los gradientes de color
    let gradient = "linear-gradient(to right, ";
    for (let i = 0; i < colors.length; i++) {
        gradient += `${colors[i]} ${i * segmentWidth}%, ${colors[i]} ${(i + 1) * segmentWidth}%, `;
    }
    gradient = gradient.slice(0, -2); // Eliminar la coma y el espacio final
    gradient += ")";

    const score = {
        'ct':'Food Environment Nutrient Density Index (FEND)',
        'restaurant': 'Restaurant Nutrient Density Index (RND)'
            }

    return (

        <div className='overlay'>
            <p style = {{
                textAlign:'center'
            }}> {score[index]} </p>
            <div style={{
                width: "100%",
                height: "6px",
                background: gradient
            }}>

            </div>
            <div className='labels'>
                <span>Least<br/> Nutrient Dense</span>
                <span>Most<br/> Nutrient Dense</span>
            </div>
        </div>
    )
};

