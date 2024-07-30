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
  #checkBoxes?: NodeListOf<HTMLInputElement>;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isFilterModalVisible', (_oldValue, newValue) => this.toggleModal(newValue as boolean));
    this.#checkBoxes?.forEach((checkBox) => {
      checkBox.addEventListener('change', () => this.callFilterState());
    });
    this.#modalElement!.addEventListener('hidden.bs.modal', () => this.closeModal());
    this.#modalElement!.querySelector('#close-button')!.addEventListener('click', () => this.closeModal());
  }

  /**
   * Gets selected disponibilites from checkboxes and put them in the state.
   */
  callFilterState() {
    const doctor_type = this.stateManager.state.currentFilter.doctorType;
    const selectedDisponibilities: string[] = [];
    this.#checkBoxes?.forEach((checkBox) => {
      if (checkBox.checked) {
        selectedDisponibilities.push(checkBox.value);
      }
    });
    this.stateManager.state.currentFilter = {
      doctorType: doctor_type,
      doctorDisponibilities: selectedDisponibilities,
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
    this.#modalFilter = new Modal(this.#modalElement);
    this.#checkBoxes = this.shadowRoot!.querySelectorAll('input[name="filterCheckBox"]') as NodeListOf<HTMLInputElement>;
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }

}

export default FilterModal;
