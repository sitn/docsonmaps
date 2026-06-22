import BaseComponent from '../../basecomponent';
import { Feature } from 'ol';
import { ToastAlertData } from '../../../state/state';
import { APPOINTMENT_LINK_LABELS } from '../constants';

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

  openAddress() {
    const url = 'https://www.google.com/maps/search/?api=1&query='
      + this.#doctor?.get('address') + ', '
      + this.#doctor?.get('nopostal') + ' '
      + this.#doctor?.get('localite');
    window.open(url, '_blank');
  }

  openPhone() {
    window.open('tel:' + this.#doctor?.get('public_phone'));
  }

  openAppointment() {
    window.open(this.#doctor?.get('appointment_link'), '_blank');
  }

  appointmentLabel() {
    const link = this.#doctor?.get('appointment_link');
    if (!link) return 'Prendre un rendez-vous';
    try {
      const domain = new URL(link).hostname.replace(/^www\./, '');
      return APPOINTMENT_LINK_LABELS[domain] ?? 'Prendre un rendez-vous';
    } catch {
      return 'Prendre un rendez-vous';
    }
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
