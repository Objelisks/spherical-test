import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'preact/hooks'

mapboxgl.accessToken = 'pk.eyJ1Ijoib2JqZWxpc2tzIiwiYSI6ImNsc2ZjOGtoeDBpMnIyd3BxNW8wazMwY3gifQ.oV7-f9BcvLgOHxgUKuQ9cw'

const JENI_DATASET_LAYER_ID = 'jeni-dataset'

const updateViewingLayer = (map, select, color) => {
  map.setPaintProperty(JENI_DATASET_LAYER_ID, 'fill-color', [
    "interpolate",
    ["linear"],
    select,
    0,
    "hsla(0, 0%, 0%, 0)",
    100,
    color
  ])
  console.log('update paint')
}

export function Map() {
  const mapRef = useRef(null)
  const mapContainer = useRef(null)
  const [[lng, lat], setCenter] = useState([-118.2024, 33.9881])
  const [zoom, setZoom] = useState(9)
  const [viewingOptions, setViewingOptions] = useState([])

  // initialize the map on page load
  useEffect(() => {
    if (mapRef.current) return
    const map = mapRef.current = new mapboxgl.Map({
      container: mapContainer.current, // container ID
      style: 'mapbox://styles/mapbox/dark-v11', // style URL
      center: [lng, lat], // starting position [lng, lat]
      zoom: zoom, // starting zoom
    })

    map.on('move', () => {
      const newCenter = map.getCenter()
      setCenter([newCenter.lng.toFixed(4), newCenter.lat.toFixed(4)])
      setZoom(map.getZoom().toFixed(2))
    })

    map.on('load', async () => {
      // load the custom data
      const LACountyBoundary = await (await fetch('/LA_County_Boundary_Feature_Layer.geojson')).json()
      map.addSource('la-county-boundary', {
        type: 'geojson',
        data: LACountyBoundary
      })

      map.addLayer({
        id: 'la-county-boundary',
        type: 'line',
        source: 'la-county-boundary',
        paint: {
          'line-color': 'hsla(43, 95%, 44%, 0.49)'
        }
      },
      'road-label-simple')

      const JENIDataset = await (await fetch('Justice_Equity_Need_Index_(zip_code).geojson')).json()
      map.addSource('jeni-dataset', {
        type: 'geojson',
        data: JENIDataset
      })

      const datasetLayer = {
        id: JENI_DATASET_LAYER_ID,
        type: 'fill',
        source: 'jeni-dataset',
        paint: {
          'fill-color': [
            "interpolate",
            ["linear"],
            ["get", "jenipctl"],
            0,
            "hsla(0, 0%, 0%, 0)",
            100,
            "hsl(15, 72%, 42%)"
          ]
        }
      }
      map.addLayer(datasetLayer, 'water')

      const vis_options = [
        {name: 'JENI Percentile', select: ["get", "jenipctl"], color: "hsl(15, 72%, 42%)"},
        {name: 'System Involvement', select: ["get", "systempctl"], color: "hsl(164, 72%, 42%)"},
        {name: 'Inequity Drivers', select: ["get", "driverspctl"], color: "hsl(255, 72%, 42%)"},
        {name: 'Criminalization Risk', select: ["get", "riskpctl"], color: "hsl(66, 72%, 42%)"}
      ]
      setViewingOptions(vis_options)
    })
  })

  return (
    <>
      {mapRef.current && viewingOptions.length > 0 && 
        <div>{viewingOptions.map(option =>
          <button onClick={() => updateViewingLayer(mapRef.current, option.select, option.color)}>{option.name}</button>)}
        </div>}
      <div ref={mapContainer} className="map-container"></div>
      <div>{`lng: ${lng}, lat: ${lat}, zoom: ${zoom}`}</div>
    </>
  )
}