import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import { Modal } from 'bootstrap';

class AboutModal extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #modalAbout?: Modal;
  #modalElement?: HTMLDivElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isAboutModalVisible', (_oldValue, newValue) => this.toggleModal(newValue as boolean));
    this.#modalElement!.addEventListener('hidden.bs.modal', () => this.closeModal());
  }

  toggleModal(isVisible: boolean) {
    if (isVisible) {
      this.#modalAbout?.show();
    } else {
      this.#modalAbout?.hide();
    }
  }

  closeModal() {
    this.stateManager.state.interface.isAboutModalVisible = false;
  }

  showPage() {
    this.update();
  }

  connectedCallback() {
    this.update();
    this.#modalElement = this.shadowRoot?.getElementById('about-modal') as HTMLDivElement;
    this.#modalAbout = new Modal(this.#modalElement)
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }

}

export default AboutModal;
