import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../../state/statemanager';
import { Feature } from 'ol';


class DoctorDetails extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Feature;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('currentDoctor', (_oldValue, newValue) => {
      const currentDoctor = newValue as Feature;
      if (currentDoctor) {
        this.#doctor = currentDoctor;
        this.update();
      }
    });
  }

  callModifiy() {
    this.stateManager.state.interface.isEditModalVisible = true;
  }

  connectedCallback() {
    this.update();
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default DoctorDetails;
