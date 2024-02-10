import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'preact/hooks'

mapboxgl.accessToken = 'pk.eyJ1Ijoib2JqZWxpc2tzIiwiYSI6ImNsc2ZjOGtoeDBpMnIyd3BxNW8wazMwY3gifQ.oV7-f9BcvLgOHxgUKuQ9cw'

export function Map() {
  const mapRef = useRef(null)
  const mapContainer = useRef(null)
  const [[lng, lat], setCenter] = useState([-118.2024, 33.9881])
  const [zoom, setZoom] = useState(9)

  // initialize the map on page load
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [lng, lat], // starting position [lng, lat]
      zoom: zoom, // starting zoom
    })
    mapRef.current.on('move', () => {
      const newCenter = mapRef.current.getCenter()
      setCenter([newCenter.lng.toFixed(4), newCenter.lat.toFixed(4)])
      setZoom(mapRef.current.getZoom().toFixed(2))
    })
  })

  return (
    <>
      <div ref={mapContainer} className="map-container"></div>
      <div>{`lng: ${lng}, lat: ${lat}, zoom: ${zoom}`}</div>
    </>
  )
}