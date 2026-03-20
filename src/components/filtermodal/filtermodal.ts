import ModalComponent from '../modalcomponent';

class FilterModal extends ModalComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  protected get modalElementId() { return 'filter-modal'; }
  protected get statePropertyPath() { return 'interface.isFilterModalVisible'; }
  #checkBoxes?: NodeListOf<HTMLInputElement>;

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

  connectedCallback() {
    super.connectedCallback();
    this.#checkBoxes = this.shadowRoot!.querySelectorAll('input[name="filterCheckBox"]') as NodeListOf<HTMLInputElement>;
  }

  protected registerEvents() {
    super.registerEvents();
    this.#checkBoxes?.forEach((checkBox) => {
      checkBox.addEventListener('change', () => this.callFilterState());
    });
    this.modalElement!.querySelector('#close-button')!.addEventListener('click', () => this.closeModal());
  }
}

export default FilterModal;
