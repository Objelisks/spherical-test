import { DatasetType } from "./helpers"

export const JESI_DATASET_SOURCE_ID = 'jesi-dataset'
export const JESI_DATASET_LAYER_ID = 'jesi-dataset'
export const ZIPCODE_HIGHLIGHT_LAYER_ID = 'zipcode_highlight'

export const loadJESIDataset = async (): Promise<DatasetType> => {
  const JESIDataset = await (await fetch('Justice_Equity_Services_Index_(zip_code).geojson')).json()
  
  return {
    name: 'Justice Equity Services Index',
    sourceId: JESI_DATASET_SOURCE_ID,
    dataLayerId: JESI_DATASET_LAYER_ID,
    highlightLayerId: ZIPCODE_HIGHLIGHT_LAYER_ID,
    geojson: JESIDataset,
    layers: [
      {
        id: JESI_DATASET_LAYER_ID,
        underId: 'water',
        type: 'fill',
        source: JESI_DATASET_SOURCE_ID,
        paint: {
          // this paints the polygon fill from transparent to opaque red based on the jeni percentile
          'fill-color': [
            "interpolate",
            ["linear"],
            ["get", "jesipctl"],
            0,
            "hsla(0, 0%, 0%, 0)",
            100,
            "hsl(15, 72%, 42%)"
          ]
        }
      },
      {
        id: ZIPCODE_HIGHLIGHT_LAYER_ID,
        underId: 'road-label-simple',
        type: 'line',
        source: JESI_DATASET_SOURCE_ID,
        paint: {
          // default to fully transparent, this will update on mouse move
          'line-color': "hsla(0, 0%, 0%, 0)"
        }
      }
    ],
    viewingOptions: [
      {name: 'JESI Percentile', select: ["get", "jesipctl"], color: "hsl(15, 72%, 42%)"},
      {name: 'Prevention and Intervention', select: ["get", "prevenpctl"], color: "hsl(255, 72%, 42%)"},
      {name: 'Housing and Employment', select: ["get", "housepctl"], color: "hsl(66, 72%, 42%)"},
      {name: 'Health and Wellness', select: ["get", "healthpctl"], color: "hsl(66, 72%, 42%)"}
    ],
    renderZipcodeData: (data) => {
      return <div className="zip-data">
        <span>Zipcode: {data.zip}</span>
        <span>Neighborhood: {data.neighborhood}</span>
        <span>District: {data.sup_district}</span>
        <span>JESI Category: {data.jesicategory}</span>
        <span>Percentile: {data.jesipctl}%</span>
        <span>Rank: {data.jesirank}</span>
        <span>Prevention and Intervention: {data.prevenpctl.toFixed(2)}% ({data.prevencategory})</span>
        <span>Housing and Employment: {data.housepctl.toFixed(2)}% ({data.housecategory})</span>
        <span>Health and Wellness: {data.healthpctl.toFixed(2)}% ({data.healthcategory})</span>
      </div>
    }
  }
}
