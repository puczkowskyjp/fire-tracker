import React, { Dispatch, RefObject, SetStateAction } from 'react'
import ArcMap, { WebMapRef } from './ArcMap'

interface MapWrapperProps {
  forwardedRef: RefObject<WebMapRef>;
  setMapReady: Dispatch<SetStateAction<boolean>>;
  locateMe: string[] | undefined;
}

export default function MapWrapper({forwardedRef, setMapReady, locateMe}: MapWrapperProps) {
  return (
    <ArcMap setMapReady={setMapReady} ref={forwardedRef} locateMe={locateMe}/>
  )
}
