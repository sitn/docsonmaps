import './style.css';
import SitnMap from './components/map/map';
import Loading from './components/loading/loading';
import SearchBar from './components/searchbar/searchbar';
import DoctorsManager from './components/doctors/doctorsmanager';
import DoctorsLayerManager from './components/doctors/doctorslayer';
import sheets from './utils/stylemanager';
import SearchModal from './components/searchmodal/searchmodal';
import ResultPanel from './components/resultpanel/resultpanel';
import FeatureList from './components/featurelist/featurelist';
import DoctorDetails from './components/doctors/doctordetails/doctordetails';
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

const doctorsLayerManager = new DoctorsLayerManager();
doctorsLayerManager.addLayer();
new DoctorsManager();

const state = StateManager.getInstance().state;
getSites().then((sitesData) => {
  state.sites = sitesData.map((sitedata: iSite) => new Site(sitedata));
});

document.adoptedStyleSheets = sheets;
