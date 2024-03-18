import React, { Dispatch, RefObject, SetStateAction } from 'react'
import ArcMap, { WebMapRef } from './ArcMap'

interface MapWrapperProps {
  forwardedRef: RefObject<WebMapRef>;
  locateMe: string[] | undefined;
}

export default function MapWrapper({forwardedRef, locateMe}: MapWrapperProps) {
  return (
    <ArcMap ref={forwardedRef} locateMe={locateMe}/>
  )
}
