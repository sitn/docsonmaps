import './style.css';
import SitnMap from './components/map/map';
import Loading from './components/loading/loading';
import SearchBar from './components/searchbar/searchbar';
import DoctorsManager from './doctors/doctorsmanager';
import DoctorsLayerManager from './doctors/doctorsLayer';
import sheets from './utils/stylemanager';
import SearchModal from './components/searchmodal/searchmodal';

customElements.define('custom-loading', Loading);
customElements.define('sitn-map', SitnMap);
customElements.define('sitn-searchbar', SearchBar);
customElements.define('sitn-searchmodal', SearchModal);

const doctorsLayerManager = new DoctorsLayerManager();
doctorsLayerManager.addLayer();
new DoctorsManager();

document.adoptedStyleSheets = sheets;
