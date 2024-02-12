import mapboxgl from 'mapbox-gl'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { JENI_DATASET_LAYER_ID, JENI_DATASET_SOURCE_ID, ZIPCODE_HIGHLIGHT_LAYER_ID, loadJENIDataset } from '../datasets/JENIDataset'
import { DatasetType, ViewingOption, viewDatasetInMap } from '../datasets/helpers'
import { loadJESIDataset } from '../datasets/JESIDataset'

mapboxgl.accessToken = 'pk.eyJ1Ijoib2JqZWxpc2tzIiwiYSI6ImNsc2ZjOGtoeDBpMnIyd3BxNW8wazMwY3gifQ.oV7-f9BcvLgOHxgUKuQ9cw'

/**
 * Updates the viewing layer paint config.
 * @param map the rendered map
 * @param select a mapboxgl expression to select the object id
 * @param color a color
 */
const updateViewingLayer = (map: mapboxgl.Map, activeDataset: DatasetType, select: mapboxgl.ExpressionSpecification, color: string) => {
  map.setPaintProperty(activeDataset.dataLayerId, 'fill-color', [
    "interpolate",
    ["linear"],
    select,
    0,
    "hsla(0, 0%, 0%, 0)",
    100,
    color
  ])
}


/**
 * Fullscreen map component that all the data visualization will be displayed on
 */
export function Map() {
  const mapRef = useRef<mapboxgl.Map>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const [[lng, lat], setCenter] = useState([-118.2024, 33.9881])
  const [zoom, setZoom] = useState(9)

  // a list of options to toggle between (rendered as buttons)
  const [viewingOptions, setViewingOptions] = useState<ViewingOption[]>([])

  // active datset to visualize (jeni, jesi, combination)
  const [activeDataset, setActiveDataset] = useState<DatasetType>(null)
  const [datasets, setDatasets] = useState<DatasetType[]>([])

  const switchDataset = (dataset) => {
    viewDatasetInMap(mapRef.current, dataset, activeDataset)
    setViewingOptions(dataset.viewingOptions)
    setActiveDataset(dataset)
  }
  
  // interactive bits
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
    if(!mapRef.current || !activeDataset) return

    if (hoveredPolygonId !== null) {
      mapRef.current.setPaintProperty(activeDataset.highlightLayerId, 'line-color', [
        "match",
        ["get", "OBJECTID"],
        [hoveredPolygonId],
        "hsl(57, 78%, 66%)",
        "hsla(0, 0%, 0%, 0)"
      ])
    } else if(hoveredPolygonId === null) {
      mapRef.current.setPaintProperty(activeDataset.highlightLayerId, 'line-color', "hsla(0, 0%, 0%, 0)")
    }
  }, [activeDataset, hoveredPolygonId, mapRef])

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

      // load the JENI dataset
      const jeniDataset = await loadJENIDataset()
      
      // load the JESI dataset
      const jesiDataset = await loadJESIDataset()

      const datasets = [jeniDataset, jesiDataset]
      setDatasets(datasets)

      // set JENI to be the default
      switchDataset(jeniDataset)

      // listen for moves and clicks to update the zipcode data
      map.on('mousemove', jeniDataset.dataLayerId, (e) => {
        setHoveredPolygonId(e.features.length > 0 ? e.features[0].properties.OBJECTID : null)
      })
      map.on('mousedown', jeniDataset.dataLayerId, (e) => {
        setClickedPolygonId(e.features.length > 0 ? e.features[0].properties.OBJECTID : null)
      })
    })
  })

  return (
    <>
      {activeDataset && <span className="dataset-name">{activeDataset.name}</span>}
      <div className="controls">
        <div className="datasets">
          {datasets.map(dataset => <button className="dataset" onClick={() => switchDataset(dataset)}>{dataset.name}</button>)}
        </div>
        {activeDataset && viewingOptions.length > 0 && 
          <div className="features">
            <div>{viewingOptions.map(option =>
              <button className="feature" onClick={() => updateViewingLayer(mapRef.current, activeDataset, option.select, option.color)}>{option.name}</button>)}
            </div>
          </div>
        }
      </div>
      <div className="location">{`longitude: ${lng}, latitude: ${lat}, zoom: ${zoom}`}</div>
      {clickedPolygon && <div className="zip-data">{JSON.stringify(clickedPolygon)}</div>}
      <div ref={mapContainer} className="map-container"></div>
    </>
  )
}