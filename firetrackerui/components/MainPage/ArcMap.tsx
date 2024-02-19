'use client';

import { useEffect, useRef } from 'react';
import ArcGISMap from "@arcgis/core/Map.js";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import Legend from "@arcgis/core/widgets/Legend.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import Sketch from "@arcgis/core/widgets/Sketch.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Home from "@arcgis/core/widgets/Home.js";

const GRAPHIC_LAYER_ID = "Drawing Layer";

interface MapApp {
  view?: MapView;
  map?: ArcGISMap;
  layer?: FeatureLayer;
  savedExtent?: any;
}

const app: MapApp = {
}

let handler: IHandle

export default function WebMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const graphicsLayer = new GraphicsLayer({
    id: GRAPHIC_LAYER_ID,
    title: 'Points of Interest'
  });

  useEffect(() => {
    if (mapRef.current) {
      const layer = new FeatureLayer({
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer'
      });

      const map = new ArcGISMap({
        basemap: "topo-vector",
        layers: [layer, graphicsLayer]
      });

      const view = new MapView({
        map: map,
        container: mapRef.current,
        zoom: 1
      });
      app.view = view;

     

      view.when(() => {
        const legend = new Expand({
          view,
          icon: 'esri-icon-legend',
          expandTooltip: 'Legend',
          content: new Legend({
            view
          })
        });
  
        const layerList = new Expand({
          view,
          icon: 'esri-icon-layers',
          expandTooltip: 'Layers',
          content: new LayerList({ view })
        });
  
        const sketch = new Expand({
          view,
          icon: 'esri-icon-sketch-rectangle',
          expandTooltip: 'Drawing Tool',
          content: new Sketch({
            view,
            layer: graphicsLayer,
            creationMode: 'update',
            visibleElements: {
              undoRedoMenu: false
            },
            defaultUpdateOptions: {

            } as __esri.SketchDefaultUpdateOptions
          })
        });
  
        const home = new Home({
          view,
        });
  
        const widgets: __esri.UIAddComponent[] = [
          {
            component: legend,
            position: "bottom-right",
            index: 0
          },
          {
            component: home,
            position: "top-left",
            index: 1
          },
          {
            component: layerList,
            position: "top-right",
            index: 0
          },
          {
            component: sketch,
            position: "top-right",
            index: 1
          }
        ];
        view.ui.add(widgets);
      });

      layer.when(() => {
        view.extent = layer.fullExtent;
        // home.viewpoint = new Viewpoint({
        //   targetGeometry: layer.fullExtent.center as __esri.Point,
        //   scale: 1
        // });
        view.zoom = 4;
      });
    }
    return () => {
      // app.view?.destroy();
    }
  }, [mapRef])

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: 'calc(100vh - 64px)',
      padding: '0'
    }}>
      <div style={{
        height: '100%',
        width: '100%'
      }} ref={mapRef}></div>
    </div>
  )
}
