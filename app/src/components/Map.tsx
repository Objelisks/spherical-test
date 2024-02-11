import mapboxgl from 'mapbox-gl'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

mapboxgl.accessToken = 'pk.eyJ1Ijoib2JqZWxpc2tzIiwiYSI6ImNsc2ZjOGtoeDBpMnIyd3BxNW8wazMwY3gifQ.oV7-f9BcvLgOHxgUKuQ9cw'

const JENI_DATASET_SOURCE_ID = 'jeni-dataset'
const JENI_DATASET_LAYER_ID = 'jeni-dataset'
const ZIPCODE_HIGHLIGHT_LAYER_ID = 'zipcode_highlight'

type ViewingOption = {name: string, select: mapboxgl.ExpressionSpecification, color: string}

/**
 * Updates the viewing layer paint config.
 * @param map the rendered map
 * @param select a mapboxgl expression to select the object id
 * @param color a color
 */
const updateViewingLayer = (map: mapboxgl.Map, select: mapboxgl.ExpressionSpecification, color: string) => {
  map.setPaintProperty(JENI_DATASET_LAYER_ID, 'fill-color', [
    "interpolate",
    ["linear"],
    select,
    0,
    "hsla(0, 0%, 0%, 0)",
    100,
    color
  ])
}

export function Map() {
  const mapRef = useRef<mapboxgl.Map>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const [[lng, lat], setCenter] = useState([-118.2024, 33.9881])
  const [zoom, setZoom] = useState(9)

  // a list of options to toggle between (rendered as buttons)
  const [viewingOptions, setViewingOptions] = useState<ViewingOption[]>([])

  const [hoveredPolygonId, setHoveredPolygonId] = useState<number>(null)
  const [clickedPolygonId, setClickedPolygonId] = useState<number>(null)
  const clickedPolygon = useMemo(() => mapRef.current?.querySourceFeatures(JENI_DATASET_SOURCE_ID,
    {
      filter: [
        "in",
        "OBJECTID",
        clickedPolygonId
      ]
    })[0],
  [clickedPolygonId])

  // updates the hovered zip code polygon to have a highlighted border
  useEffect(() => {
    if (mapRef.current && hoveredPolygonId !== null) {
      mapRef.current.setPaintProperty(ZIPCODE_HIGHLIGHT_LAYER_ID, 'line-color', [
        "match",
        ["get", "OBJECTID"],
        [hoveredPolygonId],
        "hsl(57, 78%, 66%)",
        "hsla(0, 0%, 0%, 0)"
      ])
    } else if(mapRef.current && hoveredPolygonId === null) {
      mapRef.current.setPaintProperty(ZIPCODE_HIGHLIGHT_LAYER_ID, 'line-color', "hsla(0, 0%, 0%, 0)")
    }
  }, [hoveredPolygonId, mapRef])

  // initialize the map on page load
  useEffect(() => {
    if (mapRef.current) return
    const map = mapRef.current = new mapboxgl.Map({
      container: mapContainer.current, // container element
      style: 'mapbox://styles/mapbox/dark-v11', // style URL
      center: [lng, lat], // starting position [lng, lat]
      zoom: zoom, // starting zoom
    })

    // update the lat lng and zoom properties
    map.on('move', () => {
      const newCenter = map.getCenter()
      setCenter([parseFloat(newCenter.lng.toFixed(4)), parseFloat(newCenter.lat.toFixed(4))])
      setZoom(parseFloat(map.getZoom().toFixed(2)))
    })

    // listen for moves and clicks to update the zipcode data
    map.on('mousemove', JENI_DATASET_LAYER_ID, (e) => {
      setHoveredPolygonId(e.features.length > 0 ? e.features[0].properties.OBJECTID : null)
    })
    map.on('mousedown', JENI_DATASET_LAYER_ID, (e) => {
      setClickedPolygonId(e.features.length > 0 ? e.features[0].properties.OBJECTID : null)
    })

    // load the source data
    map.on('load', async () => {
      const LACountyBoundary = await (await fetch('/LA_County_Boundary_Feature_Layer.geojson')).json()
      map.addSource('la-county-boundary', {
        type: 'geojson',
        data: LACountyBoundary
      })

      // this is just a static border around the county
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
      map.addSource(JENI_DATASET_SOURCE_ID, {
        type: 'geojson',
        data: JENIDataset
      })

      // this contains all the interesting zip code data
      const datasetLayer: mapboxgl.FillLayer = {
        id: JENI_DATASET_LAYER_ID,
        type: 'fill',
        source: JENI_DATASET_SOURCE_ID,
        paint: {
          // this paints the fill from transparent to opaque red based on the jeni percentile
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
      // add beneath water so it conforms to land edges
      map.addLayer(datasetLayer, 'water')

      const zipcodeHighlightLayer: mapboxgl.LineLayer = {
        id: ZIPCODE_HIGHLIGHT_LAYER_ID,
        type: 'line',
        source: JENI_DATASET_SOURCE_ID,
        paint: {
          // default to fully transparent, this will update on mouse move
          'line-color': "hsla(0, 0%, 0%, 0)"
        }
      }
      map.addLayer(zipcodeHighlightLayer, 'road-label-simple')

      // options that will be rendered as buttons
      // the select and color values are passed to updateViewingLayer to visualize the data
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
      {clickedPolygon && <div>{JSON.stringify(clickedPolygon)}</div>}
    </>
  )
}