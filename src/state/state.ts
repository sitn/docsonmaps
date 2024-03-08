import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';

export type ResultPanelHeader = {
  title: string;
  title2: string;
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

export type ResultPanelMode = 'LIST' | 'DOCTOR';

export type ResultPanelInterface = {
  isVisible: boolean,
  mode: ResultPanelMode
}

type AppInterface = {
  isSearchmodalVisible: boolean,
  isEditModalVisible: boolean,
  isAboutModalVisible: boolean,
  resultPanel: ResultPanelInterface
};

const defaultInterface: AppInterface = {
  isSearchmodalVisible: false,
  isEditModalVisible: false,
  isAboutModalVisible: false,
  resultPanel: {
    isVisible: false,
    mode: 'LIST'
  },
}; 

class State {
  loading = false;
  map?: Map;
  doctors?: Feature[] | FeatureLike[];
  interface = defaultInterface; 
  resultPanelHeader: ResultPanelHeader = {
    title: '',
    title2: '',
  };
  featureList: Feature[] = [];
  currentDoctor?: Feature;
  sites: Site[] = [];
  currentFilter = '';

  resetInterface() {
    this.interface = defaultInterface;
    this.currentDoctor = undefined;
    this.currentFilter = '';
  }
}

export default State;
