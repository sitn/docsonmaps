import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';
import { Modal } from 'bootstrap';

class SearchModal extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #modal?: Modal;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isSearchmodalVisible', (_oldValue, newValue) => {
      if (newValue) {
        this.#modal?.show();
      } else {
        this.#modal?.hide();
      }
      this.update();
    });
  }

  closeModal() {
    this.stateManager.state.interface.isSearchmodalVisible = false;
  }

  connectedCallback() {
    this.update();
    this.#modal = new Modal(this.shadowRoot?.getElementById('search-modal') as Element)
    this.shadowRoot!.getElementById('close-button')?.addEventListener('click', () => this.closeModal());
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
    this.shadowRoot!.adoptedStyleSheets = sheets;
  }
}

export default SearchModal;
