import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';

import proj4 from 'proj4';
import { Map, View } from 'ol';
import { getTopLeft } from 'ol/extent';
import Projection from 'ol/proj/Projection';
import { register } from 'ol/proj/proj4';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

class SitnMap extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #map: Map;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();

    proj4.defs(
      'EPSG:2056',
      '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
    );
    register(proj4);
    const extent = [2420000, 1030000, 2900000, 1360000];
    const projection = new Projection({
      code: 'EPSG:2056',
      extent,
    });

    const projectionExtent = projection.getExtent();

    const resolutions = [250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.125, 0.0625];

    const matrixIds = [];
    for (let i = 0; i < resolutions.length; i += 1) {
      matrixIds.push(`${i}`);
    }

    const sitnWMTSLayer = new TileLayer({
      source: new WMTS({
        attributions:
          '© <a href="https://sitn.ne.ch/web/conditions_utilisation/contrat_SITN_MO.htm"'
          + ' target="_blank">SITN</a>',
        url: 'https://sitn.ne.ch/mapproxy95/service?',
        layer: 'plan_ville',
        matrixSet: 'EPSG2056',
        format: 'image/png',
        projection,
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions,
          matrixIds,
        }),
        style: 'default',
        wrapX: false,
      }),
    });

    this.#map = new Map({
      layers: [
        sitnWMTSLayer,
      ],
      controls: [],
      view: new View({
        center: [2550000, 1205000],
        zoom: 1,
        projection,
        resolutions,
        constrainResolution: true,
      }),
    });
  }

  registerEvents() {
    
  }


  connectedCallback() {
    this.update();
    const mapTarget = this.shadowRoot!.getElementById('map') as HTMLDivElement;
    this.#map.setTarget(mapTarget);
    this.stateManager.state.map = this.#map;
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default SitnMap;
