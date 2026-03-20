import BaseComponent from '../../basecomponent';
import { Doctor } from '../../../state/state';
import DoctorsManager from '../doctorsmanager';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

class DoctorEdit extends BaseComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Doctor;
  #formElement?: HTMLFormElement;
  #spokenLanguagesEl?: HTMLInputElement;

  registerEvents() {
    this.stateManager.subscribe('editDoctor', (_oldValue, newValue) => {
      this.#doctor = newValue as Doctor;
      this.update();
    });

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
  }

  handleAvailabilityChange(e: Event) {
    this.#doctor!.availability = (e.target as HTMLSelectElement).value as "Available" | "Available with conditions" | "Not available" | "Unknown";
    if (this.#doctor!.availability !== 'Available with conditions') {
      this.#doctor!.availability_conditions = "";
    }
    this.update();
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
      DoctorsManager.submitDoctorChanges(guid, formData).then(() => {
        window.location.href = `${VITE_BASE_URL}/?currentDoctor=${this.#doctor!.id_person_address}`;
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
