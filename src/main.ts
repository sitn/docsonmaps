import './style.css';
import SitnMap from './components/map/map';
import Loading from './components/loading/loading';
import SearchBar from './components/searchbar/searchbar';
import DoctorsManager from './doctors/doctorsmanager';
import DoctorsLayerManager from './doctors/doctorslayer';
import sheets from './utils/stylemanager';
import SearchModal from './components/searchmodal/searchmodal';
import ResultPanel from './components/resultpanel/resultpanel';

customElements.define('custom-loading', Loading);
customElements.define('sitn-map', SitnMap);
customElements.define('search-bar', SearchBar);
customElements.define('search-modal', SearchModal);
customElements.define('result-panel', ResultPanel);

const doctorsLayerManager = new DoctorsLayerManager();
doctorsLayerManager.addLayer();
new DoctorsManager();

document.adoptedStyleSheets = sheets;
