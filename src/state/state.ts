import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';

type CurrentCluster = {
  title: string;
  doctors: Feature[];
}

class State {
  loading = false;
  map?: Map;
  doctors?: Feature[] | FeatureLike[];
  interface = {
    isSearchmodalVisible: false,
    isResultPanelVisible: false,
  };
  currentCluster: CurrentCluster = {
    title: '',
    doctors: []
  }
}

export default State;
