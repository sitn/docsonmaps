import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import { Feature } from 'ol';
import DoctorsManager from '../doctors/doctorsmanager';


class FeatureList extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctorsList: Feature[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('featureList', (_oldValue, newValue) => {
      const featureList = newValue as Feature[];
      if (featureList.length > 0) {
        this.#doctorsList = featureList.sort(DoctorsManager.compareByAvailabilityAndName);
        this.update();
      }
    });
  }

  connectedCallback() {
    this.update();
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }

  clickDoctorHandler(doctor: Feature) {
    const state = this.stateManager.state
    state.currentDoctor = doctor;
    state.resultPanelHeader.title = `${doctor.get('nom')} ${doctor.get('first_name')}`;
    state.resultPanelHeader.title2 = `${doctor.get('specialites')}`;
    state.interface.resultPanel = {
      isVisible: true,
      mode: 'DOCTOR'
    }
  }
}

export default FeatureList;
