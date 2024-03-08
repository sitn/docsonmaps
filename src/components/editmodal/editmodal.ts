import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';
import { Modal } from 'bootstrap';
import { Feature } from 'ol';

const API_URL = import.meta.env.VITE_API_URL;

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
    this.#modalElement!.querySelector('#submit')!.addEventListener('click', () => this.handleSubmit());
    this.#modalElement!.addEventListener('hidden.bs.modal', () => this.closeModal());
  }

  toggleModal(isVisible: boolean) {
    if (isVisible) {
      this.#modalEdit?.show();
    } else {
      this.#modalEdit?.hide();
    }
  }

  handleSubmit() {
    const state = this.stateManager.state;
    const currentDoctor = state.currentDoctor as Feature;
    const doctorId = currentDoctor.get('id_person_address');
    const inputEmailEl = this.#modalElement!.querySelector('#input-email') as HTMLInputElement;
    if (!inputEmailEl.validity.valid) {
      return;
    }
    fetch(`${API_URL}/doctors/${doctorId}/request_change/`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_email: inputEmailEl.value
      })
    }).then((response) => {
      if (response.ok) {
        // TODO : snack
        alert("Un email vous a été envoyé.");
      } else if (response.status == 429) {
        alert("Un email vous a déjà été envoyé récement. Si vous pensez que c'est une erreur merci de nous contacter.")
      } else {
        alert("Une erreur s'est produite, merci de nous contacter.")
      }
      this.#modalPage = 'MAIN';
      this.update();
      this.closeModal();
    })
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
