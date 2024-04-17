import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
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
    this.#modalElement!.querySelector('#submit')!.addEventListener('click', () => this.handleSubmit());
    this.#modalElement!.querySelector('#suggest')!.addEventListener('click', () => this.handleSuggest());
    this.#modalElement!.querySelector('#cancel-button')!.addEventListener('click', () => this.handleCancel());
    this.#modalElement!.querySelector('#close-button')!.addEventListener('click', () => this.handleCancel());
  }

  toggleModal(shouldBeVisible: boolean) {
    if (shouldBeVisible) {
      this.#modalEdit?.show();
    } else {
      this.#modalPage = 'MAIN';
      this.#modalEdit?.hide();
    }
  }

  #getCurrentDoctorId() {
    const state = this.stateManager.state;
    const currentDoctor = state.currentDoctor as Feature;
    return currentDoctor.get('id_person_address');
  }

  handleSubmit() {
    const doctorId = this.#getCurrentDoctorId();
    const inputEmailEl = this.#modalElement!.querySelector('#input-email') as HTMLInputElement;
    const submitFormEl = this.#modalElement!.querySelector('#submit-form') as HTMLFormElement;
    submitFormEl.reportValidity();
    if (!submitFormEl.checkValidity()) {
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
        alert("Un email vous a déjà été envoyé récemment.\n"
        + "Veuillez attendre 10 minutes avant de redemander un lien unique.\n" 
        + "Si vous pensez que c’est une erreur, merci de nous contacter à:\n"
        + "sitn@ne.ch")
      } else {
        alert("Une erreur s'est produite, merci de nous contacter.")
      }
      submitFormEl.reset();
      this.#modalPage = 'MAIN';
      this.update();
      this.closeModal();
    })
  }

  handleSuggest() {
    const doctorId = this.#getCurrentDoctorId();
    const availabilityEl = this.#modalElement!.querySelector('#availability') as HTMLSelectElement;
    const commentsEl = this.#modalElement!.querySelector('#comments') as HTMLTextAreaElement;
    const suggestFormEl = this.#modalElement!.querySelector('#suggest-form') as HTMLFormElement;
    if (!availabilityEl.value && !commentsEl.value) {
      alert('Le formulaire de suggestion de modification est vide.')
      return;
    }

    const data: { [key: string]: string } = {
      doctor: doctorId,
      comments: commentsEl.value
    }
    if (availabilityEl.value) {
      data.availability = availabilityEl.value;
    }

    fetch(`${API_URL}/doctors/suggest`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    }).then((response) => {
      if (response.ok) {
        // TODO : snack
        alert("Merci pour votre suggestion. Une fois vérifiées les informations seront mises à jour.");
      } else if (response.status == 429) {
        alert("Plusieurs suggestions on déjà été signalées sur ce médecin récemment, merci de patienter.")
      } else {
        alert("Une erreur s'est produite, merci de contacter le SITN: sitn@ne.ch.")
      }
      suggestFormEl.reset();
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
  }
}

export default EditModal;
