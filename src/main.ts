import './style.css';
import SitnMap from './components/map/map';
import Loading from './components/loading/loading';
import SearchBar from './components/searchbar/searchbar';
import DoctorsManager from './components/doctors/doctorsmanager';
import DoctorsLayerManager from './components/doctors/doctorslayer';
import sheets from './utils/stylemanager';
import SearchModal from './components/searchmodal/searchmodal';
import AboutModal from './components/aboutmodal/aboutmodal';
import FilterModal from './components/filtermodal/filtermodal';
import ResultPanel from './components/resultpanel/resultpanel';
import FeatureList from './components/featurelist/featurelist';
import DoctorDetails from './components/doctors/doctordetails/doctordetails';
import EditModal from './components/editmodal/editmodal';
import getSites from './components/sites/sitesmanager';
import StateManager from './state/statemanager';
import { Site, iSite } from './state/state';

customElements.define('custom-loading', Loading);
customElements.define('sitn-map', SitnMap);
customElements.define('search-bar', SearchBar);
customElements.define('search-modal', SearchModal);
customElements.define('result-panel', ResultPanel);
customElements.define('feature-list', FeatureList);
customElements.define('doctor-details', DoctorDetails);
customElements.define('edit-modal', EditModal);
customElements.define('about-modal', AboutModal);
customElements.define('filter-modal', FilterModal);

const doctorsLayerManager = new DoctorsLayerManager();
doctorsLayerManager.addLayer();
new DoctorsManager();

const state = StateManager.getInstance().state;
getSites().then((sitesData) => {
  state.sites = sitesData.map((sitedata: iSite) => new Site(sitedata));
});

const about_button = document.querySelector("#about-button");
about_button?.addEventListener("click", () => {
  if (state.interface.isAboutModalVisible === true) {
    state.interface.isAboutModalVisible = false
  } else {
    state.interface.isAboutModalVisible = true
  }
});

const filter_button = document.querySelector("#filter-button");
filter_button?.addEventListener("click", () => {
  if (state.interface.isFilterModalVisible === true) {
    state.interface.isFilterModalVisible = false
  } else {
    state.interface.isFilterModalVisible = true
  }
});

document.adoptedStyleSheets = sheets;
