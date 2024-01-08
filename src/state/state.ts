import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';

class State {
  loading = false;
  map?: Map;
  doctors?: Feature[] | FeatureLike[];
  interface = {
    isSearchmodalVisible: false,
    isResultPanelVisible: false,
  };
  currentCluster = {
    title: '',
  }
}

export default State;
