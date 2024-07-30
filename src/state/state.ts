import Map from 'ol/Map';
import Feature, { FeatureLike } from 'ol/Feature';

export type ResultPanelHeader = {
  title: string;
  title2: string;
}

export interface iSite {
  site_name: string;
  public_link: string;
  address: string;
}

export class Site {
  site_name: string;
  public_link: string;
  address: string;

  constructor(jsonData: iSite) {
    this.site_name = jsonData['site_name'];
    this.public_link = jsonData['public_link'];
    this.address = jsonData['address'];
  }
}

export type Doctor = {
  id_person_address: string,
  spoken_languages: string[],
  availability: 'Available' | 'Available with conditions' | 'Not available' | 'Unknown',
  availability_conditions: string,
  public_phone: string,
  has_parking: boolean,
  has_disabled_access: boolean,
  has_lift: boolean,
  is_rsn_member: boolean,
}

export type DoctorFilter = {
  doctorType: string,
  doctorDisponibility: boolean,
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
  isFilterModalVisible: boolean,
  resultPanel: ResultPanelInterface
};

const defaultInterface: AppInterface = {
  isSearchmodalVisible: false,
  isEditModalVisible: false,
  isAboutModalVisible: false,
  isFilterModalVisible: false,
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
  editDoctor?: Doctor;
  sites: Site[] = [];
  currentFilter: DoctorFilter = {
    doctorType: '',
    doctorDisponibility: false,
  };

  resetInterface() {
    this.interface = defaultInterface;
    this.currentDoctor = undefined;
  }
}

export default State;
