import './style.css';
import SitnMap from './components/map/map';
import Loading from './components/loading/loading';
import DoctorsManager from './doctors/doctorsmanager';
import DoctorsLayerManager from './doctors/doctorsLayer';

customElements.define('custom-loading', Loading);
customElements.define('sitn-map', SitnMap);

const doctorsLayerManager = new DoctorsLayerManager();
doctorsLayerManager.addLayer();
new DoctorsManager();


