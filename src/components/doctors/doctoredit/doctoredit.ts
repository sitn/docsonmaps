import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../../state/statemanager';
import { Doctor } from '../../../state/state';

class DoctorEdit extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Doctor;
  #formElement?: HTMLFormElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('editDoctor', (_oldValue, newValue) => {
      this.#doctor = newValue as Doctor;
      this.update();
    });
  }

  connectedCallback() {
    this.update();
    this.#formElement = this.shadowRoot?.querySelector('#editData') as HTMLFormElement;
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default DoctorEdit;
