import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import { Modal } from 'bootstrap';


class FilterModal extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #modalFilter?: Modal;
  #modalElement?: HTMLDivElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isFilterModalVisible', (_oldValue, newValue) => this.toggleModal(newValue as boolean));
    this.shadowRoot!.getElementById('filterCheckBox')?.addEventListener('change', (e) => {
        let check = (e.target as HTMLInputElement).checked;
        this.callFilterState(check)
    });
    this.#modalElement!.addEventListener('hidden.bs.modal', () => this.closeModal());
  }

  callFilterState(filter: boolean) {
    const doctor_type = this.stateManager.state.currentFilter.doctorType;
    this.stateManager.state.currentFilter = {
      doctorType: doctor_type,
      doctorDisponibility: filter,
    };
  }

  toggleModal(isVisible: boolean) {
    if (isVisible) {
      this.#modalFilter?.show();
    } else {
      this.#modalFilter?.hide();
    }
  }

  closeModal() {
    this.stateManager.state.interface.isFilterModalVisible = false;
  }

  showPage() {
    this.update();
  }

  connectedCallback() {
    this.update();
    this.#modalElement = this.shadowRoot?.getElementById('filter-modal') as HTMLDivElement;
    this.#modalFilter = new Modal(this.#modalElement)
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }

}

export default FilterModal;
