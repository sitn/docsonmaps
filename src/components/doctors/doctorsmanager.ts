import GeoJSON from 'ol/format/GeoJSON';
import StateManager from '../../state/statemanager';
import { Feature } from 'ol';


class DoctorsManager {
  stateManager: StateManager;

  /**
   * @private
   */
  constructor() {
    this.stateManager = StateManager.getInstance();
    this.stateManager.state.loading = true;
    this.getDoctors().then((docs) => {
      docs.map((doctor) => this.prepareDoctor(doctor as Feature));
      this.stateManager.state.doctors = docs;
      this.stateManager.state.loading = false;
    });
  }

  private async getDoctors() {
    const doctorsData = await fetch('../sample_data/data.json', {
      headers: {
        Accept: 'application/geo+json',
      },
    }).then((response) => response.json());
    const doctors = new GeoJSON().readFeatures(doctorsData);
    return doctors;
  }

  private prepareDoctor(doctorFeature: Feature) {
    doctorFeature.set('specialites', doctorFeature.get('specialites') || 'Médecin');
    const availability = doctorFeature.get('availability');
    const conditions = doctorFeature.get('availability_conditions');
    switch (availability) {
      case 'Available':
        doctorFeature.set('availability_fr', 'Accepte des nouveaux patients');
        doctorFeature.set('text_color', 'primary');
        break;
      case 'Available with conditions':
        doctorFeature.set('text_color', 'warning');
        if (conditions) {
          doctorFeature.set('availability_fr', conditions);
          break;
        }
        doctorFeature.set('availability_fr', 'Accepte des nouveaux patients sous conditions');
        break;
      case 'Not available':
        doctorFeature.set('availability_fr', 'Ne prend plus de nouveaux patients');
        doctorFeature.set('text_color', 'danger');
        break;
      default:
        doctorFeature.set('availability_fr', 'Accepte peut-être des nouveaux patients');
        doctorFeature.set('text_color', 'light');
    }
  }
}

export default DoctorsManager;
