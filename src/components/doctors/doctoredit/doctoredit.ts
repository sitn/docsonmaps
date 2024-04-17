import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../../state/statemanager';
import { Doctor } from '../../../state/state';
import DoctorsManager from '../doctorsmanager';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

class DoctorEdit extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Doctor;
  #formElement?: HTMLFormElement;
  #spokenLanguagesEl?: HTMLInputElement; 
  #inputEmail1El?: HTMLInputElement; 
  #inputEmail2El?: HTMLInputElement; 
  #changeEmail = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

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

    const changeEmailEl  = this.shadowRoot?.querySelector('#change-email') as HTMLInputElement;
    changeEmailEl.addEventListener('change', (e) => this.handleEmailChange(e));
  }

  handleSpokenLanguages() {
    const initialValue = this.#spokenLanguagesEl?.value as string;
    const spoken_languages = initialValue?.split(',').map(lang => lang.trim());
    this.#spokenLanguagesEl!.value = spoken_languages.join(', ');
  }

  handleAvailabilityChange(e: Event) {
    // #TODO: do a type for this
    this.#doctor!.availability = (e.target as HTMLSelectElement).value as "Available" | "Available with conditions" | "Not available" | "Unknown";
    if (this.#doctor!.availability !== 'Available with conditions') {
      this.#doctor!.availability_conditions = "";
    }
    this.update();
  }

  handleEmailChange(e: InputEvent) {
    const target = e.target as HTMLInputElement
    this.#changeEmail = target.checked;
    if (!this.#changeEmail) {
      this.#inputEmail1El!.value = "";
      this.#inputEmail2El!.value = "";
    }
    this.update();
  }

  #validateEmail() {
    if (this.#changeEmail) {
      const is_valid = this.#inputEmail1El!.value === this.#inputEmail2El!.value;
      if (!is_valid) {
        alert('Les deux emails saisis ne correspondent pas.')
      }
      return is_valid;
    }
    return true
  }

  #validateForm() {
    let isValid = this.#validateEmail();
    this.#formElement?.reportValidity();
    isValid = isValid && this.#formElement!.checkValidity()
    return isValid
  }

  handleSubmit(e: MouseEvent) {
    e.preventDefault();
    if (this.#validateForm()) {
      const guid = new URLSearchParams(window.location.search).get('guid') as string;
      const formData = new FormData(this.#formElement);
      if (!this.#changeEmail) {
        formData.delete('email1');
        formData.delete('email2');
      }
      DoctorsManager.submitDoctorChanges(guid, formData).then(() => {
        window.location.href = `${VITE_BASE_URL}/?currentDoctor=${this.#doctor!.id_person_address}`;
      });
    }
  }

  connectedCallback() {
    this.update();
    this.#formElement = this.shadowRoot?.querySelector('#editData') as HTMLFormElement;
    this.#spokenLanguagesEl = this.shadowRoot?.querySelector('#spoken_languages') as HTMLInputElement;
    this.#inputEmail1El = this.shadowRoot?.querySelector('#email1') as HTMLInputElement;
    this.#inputEmail2El  = this.shadowRoot?.querySelector('#email2') as HTMLInputElement;
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default DoctorEdit;
