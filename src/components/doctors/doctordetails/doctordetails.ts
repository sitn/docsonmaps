import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../../state/statemanager';
import { Feature } from 'ol';


class DoctorDetails extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Feature;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('currentDoctor', (_oldValue, newValue) => {
      const currentDoctor = newValue as Feature;
      if (currentDoctor) {
        this.#doctor = currentDoctor;
        this.update();
      }
    });
  }

  callModifiy() {
    this.stateManager.state.interface.isEditModalVisible = true;
  }

  callShare() {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(
      "currentDoctor",
      this.#doctor?.get("id_person_address")
    );
    if (navigator.share) {
      navigator.share({
        url: "currentUrl",
      });
    } else {
      navigator.clipboard.writeText(currentUrl.toString());
      alert("Le lien vers cette fiche a été copié dans le presse-papiers");
    }
  }

  connectedCallback() {
    this.update();
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default DoctorDetails;
