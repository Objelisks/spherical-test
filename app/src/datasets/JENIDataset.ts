import { DatasetType } from "./helpers"

export const JENI_DATASET_SOURCE_ID = 'jeni-dataset'
export const JENI_DATASET_LAYER_ID = 'jeni-dataset'
export const ZIPCODE_HIGHLIGHT_LAYER_ID = 'zipcode_highlight'

export const loadJENIDataset = async (): Promise<DatasetType> => {
  const JENIDataset = await (await fetch('Justice_Equity_Need_Index_(zip_code).geojson')).json()
  
  return {
    name: 'Justice Equity Need Index',
    sourceId: JENI_DATASET_SOURCE_ID,
    dataLayerId: JENI_DATASET_LAYER_ID,
    highlightLayerId: ZIPCODE_HIGHLIGHT_LAYER_ID,
    geojson: JENIDataset,
    layers: [
      {
        id: JENI_DATASET_LAYER_ID,
        underId: 'water',
        type: 'fill',
        source: JENI_DATASET_SOURCE_ID,
        paint: {
          // this paints the polygon fill from transparent to opaque red based on the jeni percentile
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
      },
      {
        id: ZIPCODE_HIGHLIGHT_LAYER_ID,
        underId: 'road-label-simple',
        type: 'line',
        source: JENI_DATASET_SOURCE_ID,
        paint: {
          // default to fully transparent, this will update on mouse move
          'line-color': "hsla(0, 0%, 0%, 0)"
        }
      }
    ],
    viewingOptions: [
      {name: 'JENI Percentile', select: ["get", "jenipctl"], color: "hsl(15, 72%, 42%)"},
      {name: 'System Involvement', select: ["get", "systempctl"], color: "hsl(164, 72%, 42%)"},
      {name: 'Inequity Drivers', select: ["get", "driverspctl"], color: "hsl(255, 72%, 42%)"},
      {name: 'Criminalization Risk', select: ["get", "riskpctl"], color: "hsl(66, 72%, 42%)"}
    ]
  }
}
