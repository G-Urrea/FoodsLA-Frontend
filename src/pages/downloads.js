import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { serializeRestaurants, serializeTracts } from '../components/mapComponents/DataFetching';

export default function Downloads(){
    const [downloading, setDownloading] = useState(0);

    async function handleDownload(e, url, name, extension) {
        e.preventDefault();
        setDownloading(prevCount=>prevCount+1);
        fetch(url, {
            method: 'GET',
        }).then((response) => response.blob())
            .then((blob) => {
                console.log(blob);
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name}.${extension}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setDownloading(prevCount=>prevCount-1);
            });
            return false;
        }
        async function handleGisDownload(e, url, name, extension, serializer) {
            e.preventDefault();
            setDownloading(prevCount=>prevCount+1);
            fetch(url, {
                method: 'GET',
            }).then((response) => response.json())
                .then((json) => {
                    console.log(json);
                    json = serializer(json);
                    const str = JSON.stringify(json);
                    const bytes = new TextEncoder().encode(str);
                    const url = window.URL.createObjectURL(new Blob([bytes]));
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${name}.${extension}`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    setDownloading(prevCount=>prevCount-1);
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
                                
                                <a href="#"  onClick={(e)=>handleGisDownload(e, row.url_gjson, row.name, 'json', row.serializer)} target="_blank" rel="noopener noreferrer">
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
            url: `${process.env.REACT_APP_API_URL}/restaurants/?format=csv`,
            url_gjson : `${process.env.REACT_APP_API_URL}/restaurants/?gis&format=json`,
            serializer: serializeRestaurants,
            name: 'restaurants_rnd'
        },
        {
            id: 2,
            title: 'Census Tract FEND',
            url: `${process.env.REACT_APP_API_URL}/fend/?geo_type=ct&format=csv`,
            url_gjson : `${process.env.REACT_APP_API_URL}/fend/?gis&geo_type=ct&format=json`,
            serializer: serializeTracts,
            name : 'census_tract_fend'
        },
        {
            id:3,
            title: 'Places FEND',
            url: `${process.env.REACT_APP_API_URL}/fend/?geo_type=place&format=csv`,
            url_gjson : `${process.env.REACT_APP_API_URL}/fend/?gis&geo_type=place&format=json`,
            serializer: serializeTracts,
            name : 'places_fend'
        },
        {
            id:4,
            title: 'Counties FEND',
            url: `${process.env.REACT_APP_API_URL}/fend/?geo_type=county&format=csv`,
            url_gjson : `${process.env.REACT_APP_API_URL}/fend/?gis&geo_type=county&format=json`,
            serializer: serializeTracts,
            name : 'counties_fend'
        }
    ]
    return (
        <div style={{ height:'100vh'}}>
            {(downloading>0) && (<p>Downloading data ...</p>)}
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