import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'preact/hooks'

mapboxgl.accessToken = 'pk.eyJ1Ijoib2JqZWxpc2tzIiwiYSI6ImNsc2ZjOGtoeDBpMnIyd3BxNW8wazMwY3gifQ.oV7-f9BcvLgOHxgUKuQ9cw'

export function Map() {
  const mapRef = useRef(null)
  const mapContainer = useRef(null)

  // initialize the map on page load
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    })
  })

  return (
    <div ref={mapContainer} className="map-container"></div>
  )
}