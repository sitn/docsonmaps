import ModalComponent from '../modalcomponent';
import { Feature } from 'ol';
import { ToastAlertData } from '../../state/state';

const API_URL = import.meta.env.VITE_API_URL;

class EditModal extends ModalComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  protected get modalElementId() { return 'edit-modal'; }
  protected get statePropertyPath() { return 'interface.isEditModalVisible'; }
  #modalPage = 'MAIN';

  toggleModal(shouldBeVisible: boolean) {
    if (shouldBeVisible) {
      this.modal?.show();
    } else {
      this.#modalPage = 'MAIN';
      this.modal?.hide();
    }
  }

  protected registerEvents() {
    super.registerEvents();
    this.modalElement!.querySelector('#submit')!.addEventListener('click', () => this.handleSubmit());
    this.modalElement!.querySelector('#suggest')!.addEventListener('click', () => this.handleSuggest());
    this.modalElement!.querySelector('#cancel-button')!.addEventListener('click', () => this.handleCancel());
    this.modalElement!.querySelector('#close-button')!.addEventListener('click', () => this.handleCancel());
  }

  #getCurrentDoctorId() {
    const state = this.stateManager.state;
    const currentDoctor = state.currentDoctor as Feature;
    return currentDoctor.get('id_person_address');
  }

  handleSubmit() {
    const doctorId = this.#getCurrentDoctorId();
    const inputEmailEl = this.modalElement!.querySelector('#input-email') as HTMLInputElement;
    const submitFormEl = this.modalElement!.querySelector('#submit-form') as HTMLFormElement;
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
        this.stateManager.state.interface.toast = new ToastAlertData(
          "Un email vous a été envoyé."
        );
      } else if (response.status == 429) {
        alert("Un email vous a déjà été envoyé récemment.\n"
          + "Veuillez attendre 10 minutes avant de redemander un lien unique.\n"
          + "Si vous pensez que c'est une erreur, merci de nous contacter à:\n"
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
    const availabilityEl = this.modalElement!.querySelector('#availability') as HTMLSelectElement;
    const commentsEl = this.modalElement!.querySelector('#comments') as HTMLTextAreaElement;
    const requestorEl = this.modalElement!.querySelector('#requestor') as HTMLTextAreaElement;
    const suggestFormEl = this.modalElement!.querySelector('#suggest-form') as HTMLFormElement;
    if (!suggestFormEl.checkValidity()) {
      suggestFormEl.reportValidity();
      return;
    }
    if (!availabilityEl.value && !commentsEl.value) {
      this.stateManager.state.interface.toast = new ToastAlertData(
        "ERREUR: Le formulaire de suggestion de modification est vide.",
        "danger"
      );
      return;
    }

    const data: { [key: string]: string } = {
      doctor: doctorId,
      comments: commentsEl.value,
      requestor: requestorEl.value ?? ''
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
        this.stateManager.state.interface.toast = new ToastAlertData(
          "Merci pour votre suggestion. Une fois vérifiées les informations seront mises à jour."
        );
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
    super.closeModal();
  }

  showPage(pageName: string) {
    this.#modalPage = pageName;
    this.update();
  }
}

export default EditModal;
