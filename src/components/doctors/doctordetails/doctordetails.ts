import BaseComponent from '../../basecomponent';
import { Feature } from 'ol';
import { ToastAlertData } from '../../../state/state';

class DoctorDetails extends BaseComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctor?: Feature;

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
        url: currentUrl.toString(),
      });
    } else {
      navigator.clipboard.writeText(currentUrl.toString());
      this.stateManager.state.interface.toast = new ToastAlertData(
        "Le lien vers cette fiche a été copié dans le presse-papiers"
      );
    }
  }

  connectedCallback() {
    this.update();
    this.registerEvents();
  }
}

export default DoctorDetails;
