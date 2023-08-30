import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// Arcgis Js components
import WebMap from "@arcgis/core/WebMap.js";
import MapView from "@arcgis/core/views/MapView.js";



@Component({
  selector: 'app-web-map',
  templateUrl: './web-map.component.html',
  styleUrls: ['./web-map.component.less']
})
export class WebMapComponent implements OnInit {  
  @ViewChild('viewDiv', { read: ElementRef }) _mapViewEl: ElementRef;
  private _map: __esri.WebMap;
  private _view: __esri.MapView;

  ngOnInit(): void {
    this._map = new WebMap({
      portalItem: {
        id: '9e2f2b544c954fda9cd13b7f3e6eebce'
      }
    });

    this._view = new MapView({
      map: this._map
    });
  }
}
