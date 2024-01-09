import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';

export type ResultPanelContent = {
  title: string;
  content: Feature[] | Feature;
}

class State {
  loading = false;
  map?: Map;
  doctors?: Feature[] | FeatureLike[];
  interface = {
    isSearchmodalVisible: false,
    isResultPanelVisible: false,
  };
  resultPanelContent: ResultPanelContent = {
    title: '',
    content: []
  }
}

export default State;
