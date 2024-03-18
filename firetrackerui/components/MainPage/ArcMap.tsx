'use client';

import React, {
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
  memo,
  forwardRef,
  ForwardRefRenderFunction,
  PropsWithChildren,
  LegacyRef,
  ForwardRefExoticComponent,
  RefAttributes,
  ForwardedRef,
  Ref,
  Dispatch,
  SetStateAction,
  PropsWithoutRef,
  useState,
  useMemo
} from 'react';
import ArcGISMap from "@arcgis/core/Map.js";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import Legend from "@arcgis/core/widgets/Legend.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import Sketch from "@arcgis/core/widgets/Sketch.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Home from "@arcgis/core/widgets/Home.js";
import Point from "@arcgis/core/geometry/Point.js";
import Graphic from "@arcgis/core/Graphic.js";
import { watch } from '@arcgis/core/core/reactiveUtils';
import Handles from "@arcgis/core/core/Handles.js";
import Button from '@mui/material/Button';
import { createClient } from '@/utils/supabase/client';
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import { Box, Divider, Modal, Snackbar, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';


const DRAWING_LAYER_ID = "Drawing Layer";
const GRAPHIC_LAYER_ID = "Points of Interest Layer";
const LOCATION_LAYER_ID = "Locate Me Layer";

let POLYGON_SYMBOL = new SimpleFillSymbol({
  outline: {
    color: 'red'
  }
});;

interface MapApp {
  view?: MapView;
  map?: ArcGISMap;
  layer?: FeatureLayer;
  savedExtent?: any;
}

const app: MapApp = {
}

let handler: __esri.Handles = new Handles();

export type WebMapRef = {
  locateMe: (locateMe: string[] | undefined) => void;
  createGraphic: (json: string[]) => void;
};

export interface WebMapProps {
  setMapReady: Dispatch<SetStateAction<boolean>>;
  locateMe: string[] | undefined;
};

interface MicroserviceResponse {
  coordinates: Array<string>;
}

const WebMap = forwardRef<WebMapRef, WebMapProps>(({ setMapReady, locateMe }, ref) => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const mapRef = useRef<HTMLDivElement>(null);
  const saveDrawingId = useRef("drawing-widget-save-button");
  const currentGraphic = useRef<__esri.Graphic | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  
  const saveDrawing = async (params: { name: string, description: string, currentGraphic: Graphic }) => {
    try {

      const { data: { session }, error } = await supabase.auth.getSession();
      const { data: saved, error: saveError } = await supabase
        .from('locations')
        .insert(
          { name: params.name, description: params.description, location: params.currentGraphic.toJSON() }
        );
    } catch (error) {
      throw error;
    }
  };

  const { mutateAsync: addDrawing } = useMutation({
    mutationFn: saveDrawing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setOpenSnack(true);
    }
  });

  const graphicsLayer = useMemo(() => new GraphicsLayer({
    id: GRAPHIC_LAYER_ID,
    title: 'Points of Interest'
  }), []);

  const drawingLayer = useRef(new GraphicsLayer({
    id: DRAWING_LAYER_ID,
    title: 'Drawing Layer',
  }));

  const locationGraphicsLayer = useMemo(() => new GraphicsLayer({
    id: LOCATION_LAYER_ID,
    title: 'My Location'
  }), []);

  /**
   * 
   * Creates point geometry, then creates graphic and
   * adds graphic to map
   * 
   */
  const createGraphic = useCallback((json: string[]) => {
    const graphics = [] as any[];
    json.forEach((g: any) => {
      const jGraphic = Graphic.fromJSON(g);
      jGraphic.symbol = POLYGON_SYMBOL;
      graphics.push(jGraphic);
    });

    locationGraphicsLayer.addMany(graphics);

  }, [locationGraphicsLayer]);

  const loadLocation = useCallback((locateMe: string[] | undefined) => {
    if (locateMe) {
      const lat = locateMe[0];
      const long = locateMe[1]

      const point = new Point({
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
        spatialReference: app.view?.spatialReference
      });

      app?.view?.goTo({
        geometry: point,
        zoom: 10
      }).catch((error) => {
        if (error.name != "AbortError") {
          console.error(error);
        }
      });
    }
  }, []);

  const saveDrawingHandler = (name: string, description: string) => {
    if (!name || !description || !currentGraphic.current) return;
    addDrawing({ name: name, description: description, currentGraphic: currentGraphic.current })
  };

  const mapInit = useCallback(() => {
    if (mapRef.current) {
      const layer = new FeatureLayer({
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer'
      });

      const map = new ArcGISMap({
        basemap: "topo-vector",
        layers: [layer, graphicsLayer, locationGraphicsLayer, drawingLayer.current]
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
            layer: drawingLayer.current,
            availableCreateTools: ["polygon"],
            viewModel: new SketchViewModel({
              layer: drawingLayer.current,
              polygonSymbol: POLYGON_SYMBOL
            }),
            visibleElements: {
              undoRedoMenu: false,
              
            },
            defaultUpdateOptions: {

            } as __esri.SketchDefaultUpdateOptions
          })
        });

        (sketch.content as Sketch).viewModel.on("create", (evt) => {
          if (evt.state === 'complete') {
            currentGraphic.current = evt.graphic;
          }
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
        view.ui.add(document.getElementById(saveDrawingId.current) as string | any[] | HTMLElement | __esri.Widget | __esri.UIAddComponent, 'top-right');
      });


      handler.add(watch(
        () => view.ready
          && (locateMe && locateMe?.length > 0)
        ,
        () => {
          loadLocation(locateMe);
        }
      ));

      layer.when(() => {
        view.extent = layer.fullExtent;
        view.zoom = 4;
      });
    }
  }, [graphicsLayer, loadLocation, locateMe, locationGraphicsLayer]);

  useEffect(() => {
    mapInit();
    return () => {
      handler.destroy();
    }
  }, [mapRef, mapInit]);

  useImperativeHandle(ref, () => {
    return {
      locateMe(locateMe: string[] | undefined) {
        loadLocation(locateMe);
      },
      createGraphic
    }
  }, [createGraphic, loadLocation]);

  return (
    <>
      <div style={{
        display: 'flex',
        width: '100%',
        height: 'calc(100vh - 64px)',
        padding: '0'
      }}>
        <div style={{
          height: '100%',
          width: '100%'
        }} ref={mapRef}>
        </div>
        <SaveButton id={saveDrawingId.current} callBack={() => setOpenModal(true)} />
      </div>
      <SaveModal open={openModal} handleClose={() => setOpenModal(false)} handleSaveLocation={saveDrawingHandler} />
      <Snackbar
        action={
          <Button onClick={() => setOpenSnack(false)} color="inherit" size="small">
            X
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnack}
        message="Point of Interest Saved!"
        onClose={() => setOpenSnack(false)}
      />
    </>
  )
});

WebMap.displayName = "WebMap";

export default memo(WebMap);

type SaveButtonProps = {
  id: string;
  callBack: () => void;
}
const SaveButton = ({ id, callBack }: SaveButtonProps) => (
  <Button
    onClick={callBack}
    sx={{
      backgroundColor: '#1976d2 !important',
      height: 20,
      color: '#fff !important',
      padding: 2
    }}
    color='primary'
    className='esri-widget'
    variant={'contained'}
    id={id}
  >Save Drawing</Button>
);

interface SaveModalProps {
  open: boolean;
  handleClose: () => void;
  handleSaveLocation: (name: string, description: string) => void;
}
const SaveModal = ({ open, handleClose, handleSaveLocation }: SaveModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          backgroundColor: '#fff',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: 4
        }}
      >
        <Typography
          sx={{ color: 'black' }}
          mx={2}
          my={4}
        >
          Enter information about your Point of Interest
        </Typography>
        <Divider />
        <Typography
          sx={{ color: 'black' }}
          mx={2}
          my={2}
        >
          Enter shape name
        </Typography>
        <Box sx={{ padding: 2, }}>
          <TextField
            id="outlined-basic"
            label="Name"
            variant="outlined"
            value={name}
            onChange={e => setName(e.currentTarget.value)}
          />
        </Box>
        <Divider />
        <Typography mx={2} my={2} sx={{ color: 'black' }}>
          Enter a description of Point of Interest.
        </Typography>
        <Box sx={{ padding: 2, }}>
          <TextField id="outlined-basic" label="Description" variant="outlined" value={description} onChange={e => setDescription(e.currentTarget.value)} />
        </Box>
        <Divider />
        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <Button
            disabled={(name.length === 0 || description.length === 0)}
            variant='contained'
            sx={{
              backgroundColor: '#1976d2 !important',
              margin: 4,
            }}
            color='primary' onClick={() => handleSaveLocation(name, description)}>Save</Button>
          <Button
            variant='contained'
            sx={{
              backgroundColor: '#1976d2 !important',
              margin: 4,
              // color: '#fff !important'
            }}
            color='primary' onClick={handleClose}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  );
}