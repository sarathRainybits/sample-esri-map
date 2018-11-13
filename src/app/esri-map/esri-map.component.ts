import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri;
@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {

  @Output() queryPipesResponse = new EventEmitter<string>();
  @Output() mapLoaded = new EventEmitter<boolean>();
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  /**
   * @private _zoom sets map zoom
   * @private _center sets map center
   * @private _basemap sets type of map
   */
  private _zoom: number = 10;
  private _gisLayer: string = "";
  private _pipeLayer: string = "";
  private _center: Array<number> = [0.1278, 51.5074];
  private _basemap: string = 'streets';
  private _extentArray: string[] = [];
  private _spatialReference: number = 3587;

  @Input()
  set extentArray(extentArray: string[]) {
    this._extentArray = extentArray;
  }

  get extentArray(): string[] {
    return this._extentArray;
  }

  @Input()
  set spatialReference(zoom: number) {
    this._spatialReference = zoom;
  }

  get spatialReference(): number {
    return this._spatialReference;
  }

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set pipeLayer(layer: string) {
    this._pipeLayer = layer;
  }

  get pipeLayer(): string {
    return this._pipeLayer;
  }

  @Input()
  set gisLayer(layer: string) {
    this._gisLayer = layer;
  }

  get gisLayer(): string {
    return this._gisLayer;
  }

  @Input()
  set center(center: Array<number>) {
    this._center = center;
  }

  get center(): Array<number> {
    return this._center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;
  }

  get basemap(): string {
    return this._basemap;
  }

  constructor() { }

  async initializeMap() {
    try {
      const [EsriMap, EsriMapView, TileLayer, Extent, SpatialReference, FeatureLayer, IdentifyTask, IdentifyParameters, QueryTask, Query] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/TileLayer',
        'esri/geometry/Extent',
        'esri/geometry/SpatialReference',
        'esri/layers/FeatureLayer',
        'esri/tasks/IdentifyTask',
        'esri/tasks/support/IdentifyParameters',
        'esri/tasks/QueryTask',
        'esri/tasks/support/Query'
      ]);

      const customExtentAndSR = Extent(parseFloat(this._extentArray[0]), parseFloat(this._extentArray[1]), parseFloat(this._extentArray[2]), parseFloat(this._extentArray[3]), SpatialReference({ "wkid": this._spatialReference }));

      var popupTemplate = { // autocasts as new PopupTemplate()
        title: "Outage Event : {description}",
        content: "customers affected : <b>{n_customers}</b>"
      };
      // Typical usage
      const gisLayer = new FeatureLayer({
        url: this._gisLayer,
        outFields: ["*"],
        popupTemplate: popupTemplate

      });

      var pipeLayer = new FeatureLayer({
        url: this._pipeLayer,
      });
      // Set type of map
      const mapProperties: esri.MapProperties = {
        basemap: this._basemap,
        layers: [pipeLayer, gisLayer]
      };

      const map: esri.Map = new EsriMap(mapProperties);

      // Set type of map view
      const mapViewProperties: esri.MapViewProperties = {
        container: this.mapViewEl.nativeElement,
        extent: customExtentAndSR,
        zoom: this._zoom,
        map: map
      };

      const mapView: esri.MapView = new EsriMapView(mapViewProperties);
      var identifyTask: any = {};
      var params: any = {};

      let executeIdentifyTask = function (event) {
        // Set the geometry to the location of the view click
        params.geometry = event.mapPoint;
        params.mapExtent = mapView.extent;
        // This function returns a promise that resolves to an array of features
        // A custom popupTemplate is set for each feature based on the layer it
        // originates from
        identifyTask.execute(params).then(function (response) {
          var results = response.results;
          return results.map(function (result) {
            return response.results[0].feature;
          });
        });
      };

      let getRandomInt = function (max) {
        return Math.floor(Math.random() * Math.floor(max));
      }

      let executeQueryTask = function () {
        var queryTask = new QueryTask({
          url: this._pipeLayer
        });
        var query = new Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = "1=1";  // Return all cities with a population greater than 1 million
        // When resolved, returns features and graphics that satisfy the query.
        queryTask.execute(query).then(function (results) {
          var attr = results.features[getRandomInt(1000)].attributes;
          this.queryPipesResponse.emit("the selected " + attr.facilityid + " pipe has length :" + attr.pipe_length);
        }.bind(this));
      }.bind(this);


      mapView.when(() => {
        // executeIdentifyTask() is called each time the view is clicked
        mapView.on("click", executeIdentifyTask);
        mapView.on("click", executeQueryTask);
        //    mapView.on("click", );
        // Create identify task for the specified map service
        identifyTask = new IdentifyTask(this._gisLayer);
        // Set the parameters for the Identify
        params = new IdentifyParameters();
        params.tolerance = 10;
        params.layerIds = [0];
        params.layerOption = "all";
        params.width = mapView.width;
        params.height = mapView.height;


        this.mapLoaded.emit(true);
      });
    } catch (error) {
      console.log('We have an error: ' + error);
    }
  }

  ngOnInit() {
    this.initializeMap();
  }

}