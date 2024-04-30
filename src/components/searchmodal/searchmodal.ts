import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import { Modal } from 'bootstrap';
import DoctorsManager, { SPECIALITIES } from '../doctors/doctorsmanager';
import { Feature } from 'ol';

class SearchModal extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #modal?: Modal;
  #modalElement?: HTMLDivElement;
  #isVisible: boolean;
  #searchText = '';
  #specialities: string[];
  #resetFilterText = 'Afficher tous les médecins';
  #contentType: 'SPECIALITIES' | 'DOCTORS' = 'SPECIALITIES';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
    this.#specialities = [this.#resetFilterText].concat(SPECIALITIES);
    this.#isVisible = false;
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isSearchmodalVisible', (_oldValue, newValue) => this.toggleModal(newValue as boolean));

    this.stateManager.subscribe('interface.resultPanel', (_oldValue, newValue) => {
      const isResultPanelVisible = newValue as boolean;
      if(this.#isVisible && isResultPanelVisible) {
        this.stateManager.state.interface.isSearchmodalVisible = false;
      }
    });

    this.#modalElement!.addEventListener('shown.bs.modal', () => {
      const inputElement = this.#modalElement!.querySelector('#search-input') as HTMLInputElement;
      inputElement.focus();
    });

    // Handle search modal is closed by ESC key or other event
    this.#modalElement!.addEventListener('hidden.bs.modal', () => {
      if (this.stateManager.state.interface.isSearchmodalVisible === true) {
        this.stateManager.state.interface.isSearchmodalVisible = false;
      }
    });

    this.#modalElement!.querySelector('#close-button')!.addEventListener('click', () => this.closeModal());
  }

  toggleModal(isVisible: boolean) {
    this.#isVisible = isVisible;
    if (isVisible) {
      this.#modal?.show();
    } else {
      this.#modal?.hide();
    }
  }

  closeModal() {
    this.stateManager.state.interface.isSearchmodalVisible = false;
  }

  clickSpecialityHandler(speciality: string) {
    const currentDisponibility = this.stateManager.state.currentFilter.doctorDisponibility;
    if(speciality === this.#resetFilterText) {
      this.stateManager.state.currentFilter = {
        doctorType: '',
        doctorDisponibility: currentDisponibility,
      };
    } else {
      this.stateManager.state.currentFilter = {
        doctorType: speciality,
        doctorDisponibility: currentDisponibility,
      }
    }
    this.closeModal();
  }

  handleInput(e: Event) {
    const value = (e.target! as HTMLInputElement).value
    if (value.length <= 2) {
      this.#contentType = 'SPECIALITIES';
    } else {
      this.#contentType = 'DOCTORS';
      const doctors = this.stateManager.state.doctors! as Feature[];
      const results = doctors.filter((feature) => {
        const searchFields = [
          feature.get('nom'),
          feature.get('first_name'),
          feature.get('specialites'),
          feature.get('localite'),
        ];
        const searchString = searchFields.join(' ').replace('-', ' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        const searchTerm = value.replace('-', ' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        if (searchString.includes(searchTerm)) {
          return feature;
        }
        return null;
      });
      this.stateManager.state.featureList = results.sort(DoctorsManager.compareByAvailabilityAndName);
    }
    this.update()
  }

  connectedCallback() {
    this.update();
    this.#modalElement = this.shadowRoot?.getElementById('search-modal') as HTMLDivElement;
    this.#modal = new Modal(this.#modalElement);
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default SearchModal;
