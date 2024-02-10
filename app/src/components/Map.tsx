import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'preact/hooks'
import LACountyBoundary from '..\assets\LA_County_Boundary_Feature_Layer.geojson'

mapboxgl.accessToken = 'pk.eyJ1Ijoib2JqZWxpc2tzIiwiYSI6ImNsc2ZjOGtoeDBpMnIyd3BxNW8wazMwY3gifQ.oV7-f9BcvLgOHxgUKuQ9cw'

export function Map() {
  const mapRef = useRef(null)
  const mapContainer = useRef(null)
  const [[lng, lat], setCenter] = useState([-118.2024, 33.9881])
  const [zoom, setZoom] = useState(9)

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
          'line-color': 'hsla(114, 95%, 44%, 50%)'
        }
      },
      'road-label-simple')

      const JENIDataset = await (await fetch('Justice_Equity_Need_Index_(zip_code).geojson')).json()
      console.log(JENIDataset)
      map.addSource('jeni-dataset', {
        type: 'geojson',
        data: JENIDataset
      })

      map.addLayer({
        id: 'jeni-dataset',
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
            "hsl(15, 90%, 23%)"
          ]
        }
      },
      'water')
    })
  })

  return (
    <>
      <div ref={mapContainer} className="map-container"></div>
      <div>{`lng: ${lng}, lat: ${lat}, zoom: ${zoom}`}</div>
    </>
  )
}