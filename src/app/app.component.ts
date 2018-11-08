import { Component, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Set our map properties
  extentArray = ["-13215046.250", "4017332.161", "-13147657.669", "4076317.766"];
  mapCenter = [-122.4194, 37.7749];
  basemapType = 'topo';
  mapZoomLevel = 11;
  spatialReference = 3857;
  gisLayer = "https://ags_infra2.sedaru.com/arcgis/rest/services/ladwp/ladwp_gis/MapServer/";
  pipeLayer = "https://ags_infra2.sedaru.com/arcgis/rest/services/ladwp/ladwp_gis/MapServer/11";
  // See app.component.html
  mapLoadedEvent(status: boolean) {
    console.log('The map loaded: ' + status);
  }
 


  queryPipesResponse(msg: string) {
    alert(msg);
  }


}
