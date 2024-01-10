import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';

export type ResultPanelContent = {
  title: string;
  title2: string;
  content: Feature[] | Feature;
}

export interface iSite {
  name: string;
  link: string;
  address: string;
  isHidden?: boolean;
}

export class Site {
  name: string;
  link: string;
  address: string;
  isHidden: boolean;

  constructor(jsonData: iSite) {
    this.name = jsonData['name'];
    this.link = jsonData['link'];
    this.address = jsonData['address'];
    this.isHidden = jsonData['isHidden'] || false;
  }
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
    title2: '',
    content: []
  };
  sites: Site[] = [];
  currentFilter = '';
}

export default State;
