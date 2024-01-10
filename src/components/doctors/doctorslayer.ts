import VectorLayer from 'ol/layer/Vector';
import StateManager from '../../state/statemanager';
import VectorSource from 'ol/source/Vector';
import { Cluster } from 'ol/source';
import { Icon, Style } from 'ol/style';
import { Feature } from 'ol';
import { boundingExtent } from 'ol/extent';
import { Point } from 'ol/geom';

class DoctorsLayerManager {
  stateManager: StateManager;
  #doctorsSource: VectorSource;
  #layer: VectorLayer<VectorSource>;

  constructor() {
    this.stateManager = StateManager.getInstance();

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
        if (features.find((f: Feature) => f.get('availability') === 'Available')) {
          src = 'map_icon_green.svg';
        } else if (features.find((f: Feature) => f.get('availability') === 'Available with conditions')) {
          color = '#f6c8c8';
          src = 'map_icon_pink.svg';
        } else if (features.find((f: Feature) => f.get('availability') === 'Not available')) {
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
    this.registerEvents();
  }

  private doctors() {
    const doctorFeatures = this.stateManager.state.doctors;
    if (doctorFeatures) {
      return doctorFeatures as Feature[];
    }
    return [] as Feature[];
  }

  registerEvents() {
    this.stateManager.subscribe('doctors', (_oldDoctors, _newDoctors) => this.resetDoctors());
    this.stateManager.subscribe('currentFilter', (_oldFilter, newFilter) => this.applyFilter(newFilter as string));
    this.addClickListener();
  }

  applyFilter(filter: string) {
    if (filter === '') {
      this.resetDoctors();
    } else {
      const filteredDoctors: Feature[] = [];
      this.doctors().forEach((doctorFeature) => {
        if (filter === 'Médecin généraliste') {
          if (doctorFeature.get('specialites').includes('Médecine interne générale')
             || doctorFeature.get('specialites').includes('Médecin praticien')) {
            filteredDoctors.push(doctorFeature);
          }
        } else if (doctorFeature.get('specialites').includes(filter)) {
          filteredDoctors.push(doctorFeature);
        }
      });
      this.#doctorsSource.clear();
      this.#doctorsSource.addFeatures(filteredDoctors);
    }
  }

  addClickListener() {
    const olMap = this.stateManager.state.map!;
    olMap.on('singleclick', (e) => {
      this.#layer.getFeatures(e.pixel).then((clickedFeatures) => {
        if (clickedFeatures.length) {
          // Get clustered Coordinates
          const features = clickedFeatures[0].get('features');
          const view = olMap.getView();
          if (features.length > 1 && view.getZoom()! < 5) {
            const extentClicked = boundingExtent(
              features.map((r: Feature<Point>) => r.getGeometry()!.getCoordinates()),
            );
            view.fit(extentClicked, { duration: 250, padding: [50, 50, 50, 50] });
          } else {
            this.showResult(features);
          }
        }
      });
    });
  }

  private prepareOrderedList(doctors: Feature[]) {
    const orderedList: Record<string, Feature[]> = {
      'Available': [],
      'Available with conditions': [],
      'Unknown': [],
      'Not available': [],
    };
    doctors.forEach((feature) => {
      const availability = feature.get('availability');
      orderedList[availability].push(feature);
    });
    return Object.values(orderedList).flat();
  }

  showResult(features: Feature[]) {
    const firstFeature = features[0];
    let address = `${firstFeature.get('sitn_address')}, ${firstFeature.get('nopostal')} ${firstFeature.get('localite')}`;
    const currentSite = this.stateManager.state.sites.find((site) => site.address === address);
    console.log(currentSite?.address)
    const currentCluster = {
      title: currentSite?.name || firstFeature.get('sitn_address'),
      title2:currentSite?.address || `${firstFeature.get('nopostal')} ${firstFeature.get('localite')}`,
      content: this.prepareOrderedList(features)
    }
    this.stateManager.state.resultPanelContent = currentCluster;
    this.stateManager.state.interface.isResultPanelVisible = true;
  }

  private resetDoctors() {
    this.#doctorsSource.clear();
    this.#doctorsSource.addFeatures(this.doctors());
  }

  addLayer() {
    this.stateManager.state.map?.addLayer(this.#layer);
  }
}

export default DoctorsLayerManager;
