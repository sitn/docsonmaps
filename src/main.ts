import './style.css';
import SitnMap from './components/map/map';
import Loading from './components/loading/loading';
import SearchBar from './components/searchbar/searchbar';
import DoctorsManager from './components/doctors/doctorsmanager';
import DoctorsLayerManager from './components/doctors/doctorslayer';
import SearchModal from './components/searchmodal/searchmodal';
import AboutModal from './components/aboutmodal/aboutmodal';
import ToastAlert from './components/toastalert/toastalert';
import FilterModal from './components/filtermodal/filtermodal';
import ResultPanel from './components/resultpanel/resultpanel';
import FeatureList from './components/featurelist/featurelist';
import DoctorDetails from './components/doctors/doctordetails/doctordetails';
import EditModal from './components/editmodal/editmodal';
import getSites from './components/sites/sitesmanager';
import StateManager from './state/statemanager';
import { Site, iSite, DoctorFilter } from './state/state';

customElements.define('custom-loading', Loading);
customElements.define('sitn-map', SitnMap);
customElements.define('search-bar', SearchBar);
customElements.define('search-modal', SearchModal);
customElements.define('result-panel', ResultPanel);
customElements.define('feature-list', FeatureList);
customElements.define('doctor-details', DoctorDetails);
customElements.define('edit-modal', EditModal);
customElements.define('about-modal', AboutModal);
customElements.define('toast-alert', ToastAlert);
customElements.define('filter-modal', FilterModal);

const doctorsLayerManager = new DoctorsLayerManager();
doctorsLayerManager.addLayer();
new DoctorsManager();

const stateManager = StateManager.getInstance();
const state = stateManager.state;
getSites().then((sitesData) => {
  state.sites = sitesData.map((sitedata: iSite) => new Site(sitedata));
  document.getElementById('initially-hidden')!.style.visibility = 'visible';
});

const about_button = document.querySelector("#about-button");
about_button?.addEventListener("click", () => {
  state.interface.isAboutModalVisible = !state.interface.isAboutModalVisible;
});

const filter_button = document.querySelector("#filter-button")!;
const filter_button_text = document.querySelector("#filter-button-text")!;
filter_button.addEventListener("click", () => {
  state.interface.isFilterModalVisible = !state.interface.isFilterModalVisible;
});
stateManager.subscribe('currentFilter', (_oldValue, newValue) => {
  // if selected disponibilities are less than 4
  if ((newValue as DoctorFilter).doctorDisponibilities.length < 4) {
    filter_button.classList.remove('btn-primary');
    filter_button.classList.add('btn-danger');
    filter_button_text.textContent = 'La carte est filtrée';
  } else {
    filter_button.classList.remove('btn-danger');
    filter_button.classList.add('btn-primary');
    filter_button_text.textContent = 'Filtrer la carte';
  }
});