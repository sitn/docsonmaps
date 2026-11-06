import BaseComponent from '../../basecomponent';
import { Doctor } from '../../../state/state';
import DoctorsManager from '../doctorsmanager';
import { Modal } from 'bootstrap';

class DoctorEdit extends BaseComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Doctor;
  #formElement?: HTMLFormElement;
  #spokenLanguagesEl?: HTMLInputElement;
  #initialDoctor?: Doctor;
  #initialFormData = '';
  #isFormValid = false;
  #isFormDirty = false;

  registerEvents() {
    this.stateManager.subscribe('editDoctor', (_oldValue, newValue) => {
      this.#doctor = newValue as Doctor;
      // State objects are Proxies (on-change), which structuredClone can't handle
      this.#initialDoctor = JSON.parse(JSON.stringify(this.#doctor));
      this.update();
      this.#initialFormData = this.#serializeForm();
      this.#refreshFormState();
    });

    this.#formElement?.addEventListener('input', () => this.#refreshFormState());
    this.#formElement?.addEventListener('change', () => this.#refreshFormState());

    const buttonEl = this.shadowRoot?.querySelector('#submit-changes') as HTMLButtonElement;
    buttonEl.addEventListener('click', (e) => this.handleSubmit(e));

    this.#spokenLanguagesEl?.addEventListener('focusout', () => this.handleSpokenLanguages());

    const availabilityEl = this.shadowRoot?.querySelector('#availability') as HTMLSelectElement;
    availabilityEl.addEventListener('change', (e) => this.handleAvailabilityChange(e));
  }

  handleSpokenLanguages() {
    const initialValue = this.#spokenLanguagesEl?.value as string;
    const spoken_languages = initialValue?.split(',').map(lang => lang.trim());
    this.#spokenLanguagesEl!.value = spoken_languages.join(', ');
    this.#refreshFormState();
  }

  handleAvailabilityChange(e: Event) {
    this.#doctor!.availability = (e.target as HTMLSelectElement).value as "Available" | "Available with conditions" | "Not available" | "Unknown";
    if (this.#doctor!.availability !== 'Available with conditions') {
      this.#doctor!.availability_conditions = "";
    }
    this.update();
  }

  #serializeForm() {
    return JSON.stringify([...new FormData(this.#formElement)]);
  }

  #refreshFormState() {
    this.#isFormValid = this.#formElement!.checkValidity();
    this.#isFormDirty = this.#serializeForm() !== this.#initialFormData;
    this.update();
  }

  handleCancel() {
    this.#doctor = structuredClone(this.#initialDoctor);
    this.update();
    this.#formElement?.reset();
    this.#refreshFormState();
  }

  #validateForm() {
    this.#formElement?.reportValidity();
    return this.#formElement!.checkValidity();
  }

  handleSubmit(e: MouseEvent) {
    e.preventDefault();
    if (this.#validateForm()) {
      const guid = new URLSearchParams(window.location.search).get('guid') as string;
      const formData = new FormData(this.#formElement);
      DoctorsManager.submitDoctorChanges(guid, formData).then((isSuccess) => {
        if (!isSuccess) {
          alert("Une erreur s'est produite, merci de nous contacter.");
          return;
        }
        const thanksModalEl = this.shadowRoot?.querySelector('#thanks-modal') as HTMLDivElement;
        new Modal(thanksModalEl).show();
        setTimeout(() => {
          window.location.href = `/?currentDoctor=${this.#doctor!.id_person_address}`;
        }, 5000);
      });
    }
  }

  connectedCallback() {
    this.update();
    this.#formElement = this.shadowRoot?.querySelector('#editData') as HTMLFormElement;
    this.#spokenLanguagesEl = this.shadowRoot?.querySelector('#spoken_languages') as HTMLInputElement;
    this.registerEvents();
  }
}

export default DoctorEdit;
