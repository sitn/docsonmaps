import VectorLayer from 'ol/layer/Vector';
import StateManager from '../state/statemanager';
import VectorSource from 'ol/source/Vector';
import { Cluster } from 'ol/source';
import { Icon, Style } from 'ol/style';
import { Feature } from 'ol';


class DoctorsLayerManager {
  stateManager: StateManager;
  #doctorsSource: VectorSource;
  #layer: VectorLayer<VectorSource>;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.stateManager.subscribe('doctors', (_oldDoctors, newDoctors) => this.updateDoctors(newDoctors as Feature[]));

    this.#doctorsSource = new VectorSource({
      attributions: `&copy; SITN ${(new Date()).getFullYear()}`
    });

    const clusterSource = new Cluster({
      distance: 10,
      minDistance: 25,
      source: this.#doctorsSource,
    });

    const styleCache: Record<string, Style> = {};
    this.#layer = new VectorLayer({
      source: clusterSource,
      style(feature) {
        const features = feature.get('features');
        let color = '#f8f9fa';
        let src = 'map_icon_white.svg';
        if (features.find((f) => f.get('availability') === 'Available')) {
          src = 'map_icon_green.svg';
        } else if (features.find((f) => f.get('availability') === 'Available with conditions')) {
          color = '#f6c8c8';
          src = 'map_icon_pink.svg';
        } else if (features.find((f) => f.get('availability') === 'Not available')) {
          color = '#e24848';
          src = 'map_icon_red.svg';
        }

        let style = styleCache[src];
        if (!style) {
          style = new Style({
            image: new Icon({
              displacement: [0, 15],
              src: `static/${src}`,
            }),
          });
          styleCache[color] = style;
        }
        return style;
      },
    })
  }

  updateDoctors(features: Feature[]) {
    this.#doctorsSource.addFeatures(features);
  }

  addLayer() {
    this.stateManager.state.map?.addLayer(this.#layer);
  }
}

export default DoctorsLayerManager;
