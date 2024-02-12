import mapboxgl from "mapbox-gl"

import { JSX } from 'preact'

// Options used to toggle
export type ViewingOption = {name: string, select: mapboxgl.ExpressionSpecification, color: string}

export type DatasetType = {
  name: string,
  sourceId: string,
  dataLayerId: string,
  highlightLayerId: string,
  geojson: any, // todo: unsure the type that should go here
  layers: (mapboxgl.AnyLayer & {underId: string})[],
  // options that will be rendered as buttons
  // the select and color values are passed to updateViewingLayer to visualize the data
  viewingOptions: ViewingOption[],
  renderZipcodeData: (data: any) => JSX.Element
}

export const viewDatasetInMap = (map: mapboxgl.Map, dataset: DatasetType, oldDataset?: DatasetType) => {
  if(oldDataset) {
    // cleanup old dataset
    oldDataset.layers.forEach((layer) => map.removeLayer(layer.id))
    map.removeSource(oldDataset.sourceId)
  }

  // add new dataset
  map.addSource(dataset.sourceId, {
    type: 'geojson',
    data: dataset.geojson
  })
  dataset.layers.forEach((layer) => map.addLayer(layer, layer.underId))
}