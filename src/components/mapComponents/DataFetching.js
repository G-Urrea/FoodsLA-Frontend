import {load} from '@loaders.gl/core';
import {JSONLoader} from '@loaders.gl/json';

export const fetchData = async (url, setter) => {
    try {
      console.log(url);     
      const geoJSONfeatures = await load(url, JSONLoader);
      setter(geoJSONfeatures);
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
  };


export const getData = async(url) => {
  try {
      console.log(url);     
      const geoJSONfeatures = await load(url, JSONLoader);
      return geoJSONfeatures;
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
}

export const dataUpdate = async(url, currentSetter) => {
  const new_data = await getData(url);
  currentSetter(
    (prevData) => ({
      type: 'FeatureCollection',
      next: new_data.next,
      features: [...prevData.features, ...new_data.features]
    })
  )
}


/*
const fetchData = async (url, setter) => {
    try {
      console.log(url);     
      const geoJSONfeatures = await load(url, JSONLoader);
      setter(geoJSONfeatures);
    } catch (error) {
      console.error('Error al obtener datos', error);
    }
  };

  
  useEffect(() => {
    const DATA_URL = "http://localhost:8000/api/fendGIS/";
    if (tractsData===null)
      fetchData(DATA_URL, setCurrentCT);
    else{
      if (nextPageCT!==null){
        fetchData(nextPageCT, setCurrentCT);
      }
    }
  }, [tractsData]);

  useEffect(()=>{
    if (currentPageCT.features.length>0 & !(tractsData===null)){
      setTractsData(
        (prevData) => ({
          type: 'FeatureCollection',
          features: [...prevData.features, ...currentPageCT.features],
        })
      );
      setNextCT(currentPageCT.next);
    }
    else  { 
      if (currentPageCT.features.length>0){
        setTractsData(currentPageCT);
        setNextCT(currentPageCT.next);
    }
  }
  }, [currentPageCT]);
 */