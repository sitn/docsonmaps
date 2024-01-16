import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';
import { Modal } from 'bootstrap';


class EditModal extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #modalEdit?: Modal;
  #modalElement?: HTMLDivElement;
  #modalPage = 'MAIN';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isEditModalVisible', (_oldValue, newValue) => this.toggleModal(newValue as boolean));
    this.#modalElement!.querySelector('#cancel-button')!.addEventListener('click', () => this.handleCancel());
    this.#modalElement!.addEventListener('hidden.bs.modal', () => this.closeModal());
  }

  toggleModal(isVisible: boolean) {
    if (isVisible) {
      this.#modalEdit?.show();
    } else {
      this.#modalEdit?.hide();
    }
  }

  handleCancel() {
    if (this.#modalPage === 'MAIN') {
      this.closeModal();
    } else {
      this.#modalPage = 'MAIN';
      this.update();
    }
  }

  closeModal() {
    this.#modalPage = 'MAIN';
    this.stateManager.state.interface.isEditModalVisible = false;
  }

  showPage(pageName: string) {
    this.#modalPage = pageName;
    this.update();
  }

  connectedCallback() {
    this.update();
    this.#modalElement = this.shadowRoot?.getElementById('edit-modal') as HTMLDivElement;
    this.#modalEdit = new Modal(this.#modalElement)
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
    this.shadowRoot!.adoptedStyleSheets = sheets;
  }
}

export default EditModal;
