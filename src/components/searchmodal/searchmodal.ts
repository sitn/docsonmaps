import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';
import { Modal } from 'bootstrap';
import { SPECIALITIES } from '../doctors/doctorsmanager';

class SearchModal extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #modal?: Modal;
  #modalElement?: HTMLDivElement;
  #searchText = '';
  #specialities: string[];
  #resetFilterText = 'Afficher tous les médecins';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
    this.#specialities = [this.#resetFilterText].concat(SPECIALITIES);
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

    this.#modalElement!.addEventListener('shown.bs.modal', () => {
      const inputElement = this.#modalElement!.querySelector('#search-input') as HTMLInputElement;
      inputElement.focus();
    });

    this.#modalElement!.querySelector('#close-button')!.addEventListener('click', () => this.closeModal());
  }

  closeModal() {
    this.stateManager.state.interface.isSearchmodalVisible = false;
  }

  clickSpecialityHandler(speciality: string) {
    if(speciality === this.#resetFilterText) {
      this.stateManager.state.currentFilter = '';
    } else {
      this.stateManager.state.currentFilter = speciality;
    }
    this.closeModal();
  }

  connectedCallback() {
    this.update();
    this.#modalElement = this.shadowRoot?.getElementById('search-modal') as HTMLDivElement;
    this.#modal = new Modal(this.#modalElement)
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
    this.shadowRoot!.adoptedStyleSheets = sheets;
  }
}

export default SearchModal;
