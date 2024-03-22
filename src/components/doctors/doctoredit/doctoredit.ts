import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../../state/statemanager';
import { Doctor } from '../../../state/state';
import DoctorsManager from '../doctorsmanager';

class DoctorEdit extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Doctor;
  #formElement?: HTMLFormElement;
  #spokenLanguagesEl?: HTMLInputElement; 

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

    this.#spokenLanguagesEl?.addEventListener('focusout', (e) => this.handleSpokenLanguages(e))
  }

  handleSpokenLanguages(e: FocusEvent) {
    const initialValue = this.#spokenLanguagesEl?.value as string;
    const spoken_languages = initialValue?.split(',').map(lang => lang.trim());
    this.#spokenLanguagesEl!.value = spoken_languages.join(', ');
  }

  handleSubmit(e: MouseEvent) {
    e.preventDefault();
    this.#formElement?.reportValidity();
    if (this.#formElement?.checkValidity()) {
      const guid = new URLSearchParams(window.location.search).get('guid') as string;
      const formData = new FormData(this.#formElement);
      DoctorsManager.submitDoctorChanges(guid, formData).then(() => {
        window.location.href = `/?currentDoctor=${this.#doctor!.id_person_address}`;
      });
    }
  }

  connectedCallback() {
    this.update();
    this.#formElement = this.shadowRoot?.querySelector('#editData') as HTMLFormElement;
    this.#spokenLanguagesEl = this.shadowRoot?.querySelector('#spoken_languages') as HTMLInputElement;
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default DoctorEdit;
