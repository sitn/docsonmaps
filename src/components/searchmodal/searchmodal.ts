import ModalComponent from '../modalcomponent';
import DoctorsManager, { SPECIALITIES } from '../doctors/doctorsmanager';
import { Feature } from 'ol';

class SearchModal extends ModalComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  protected get modalElementId() { return 'search-modal'; }
  protected get statePropertyPath() { return 'interface.isSearchmodalVisible'; }
  #isVisible = false;
  #searchText = '';
  #specialities: string[];
  #resetFilterText = 'Afficher tous les médecins';
  #contentType: 'SPECIALITIES' | 'DOCTORS' = 'SPECIALITIES';

  constructor() {
    super();
    this.#specialities = [this.#resetFilterText].concat(SPECIALITIES);
  }

  toggleModal(isVisible: boolean) {
    this.#isVisible = isVisible;
    super.toggleModal(isVisible);
  }

  protected registerEvents() {
    super.registerEvents();

    this.stateManager.subscribe('interface.resultPanel', (_oldValue, newValue) => {
      const isResultPanelVisible = newValue as boolean;
      if (this.#isVisible && isResultPanelVisible) {
        this.stateManager.state.interface.isSearchmodalVisible = false;
      }
    });

    this.modalElement!.addEventListener('shown.bs.modal', () => {
      const inputElement = this.modalElement!.querySelector('#search-input') as HTMLInputElement;
      inputElement.focus();
    });

    this.modalElement!.querySelector('#close-button')!.addEventListener('click', () => this.closeModal());
  }

  clickSpecialityHandler(speciality: string) {
    const currentDisponibilities = this.stateManager.state.currentFilter.doctorDisponibilities;
    if (speciality === this.#resetFilterText) {
      this.stateManager.state.currentFilter = {
        doctorType: '',
        doctorDisponibilities: currentDisponibilities,
      };
    } else {
      this.stateManager.state.currentFilter = {
        doctorType: speciality,
        doctorDisponibilities: currentDisponibilities,
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
      const searchTerm = value.replace('-', ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      const results = doctors.filter((feature) => {
        const searchFields = [
          feature.get('nom'),
          feature.get('first_name'),
          feature.get('specialites'),
          feature.get('compl_formation'),
          feature.get('localite'),
        ];
        const searchString = searchFields.join(' ').replace('-', ' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        return searchString.includes(searchTerm);
      });
      this.stateManager.state.featureList = results.sort(DoctorsManager.compareByAvailabilityAndName);
    }
    this.update()
  }
}

export default SearchModal;
