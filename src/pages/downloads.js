import React from 'react';
import DataTable from 'react-data-table-component';

export default function Downloads(){
    const handleDownload = (e, url, name, extension) => {
        e.preventDefault();
        fetch(url, {
            method: 'GET',
        }).then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name}.${extension}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            });
            return false;
        }

    const columns = [
        {
            name: 'Data',
            selector: row => row.title,
        },
        {
            name: 'Download',
            cell: row => ( <div> 
                                <a style={{paddingRight:'10px'}} href="#" onClick={(e)=>handleDownload(e, row.url, row.name, 'csv')} 
                                target="_blank" rel="noopener noreferrer">
                                    CSV
                                </a>
                                
                                <a href="#"  onClick={(e)=>handleDownload(e, row.url_gjson, row.name, 'json')} target="_blank" rel="noopener noreferrer">
                                    GeoJSON
                                </a>
                            </div>
                		)
        },
    ];
    
    const data = [
        {
            id: 1,
            title: 'Restaurants RND',
            url: `${process.env.REACT_APP_API_URL}/restaurants/?limit=10&format=csv`,
            url_gjson : `${process.env.REACT_APP_API_URL}/restaurantsGIS/`,
            name: 'restaurants_rnd'
        },
        {
            id: 2,
            title: 'Census Tract FEND',
            url: `${process.env.REACT_APP_API_URL}/fend/?format=csv`,
            url_gjson : `${process.env.REACT_APP_API_URL}/restaurantsGIS/?limit=10`,
            name : 'census_tract_fend'
        },
    ]
    return (
        <div style={{ height:'100vh'}}>
            <h1>Downloads</h1>
            <div style={{display:'flex', justifyContent:'center'}}>
                <div style ={{width:'60vw'}}>
                    <DataTable
                    columns={columns}
                    data={data}
                />
                </div>
            </div>
        </div>
    );
}