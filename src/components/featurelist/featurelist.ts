import BaseComponent from '../basecomponent';
import { Feature } from 'ol';
import DoctorsManager from '../doctors/doctorsmanager';

class FeatureList extends BaseComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctorsList: Feature[] = [];

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
