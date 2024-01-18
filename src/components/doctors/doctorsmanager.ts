import GeoJSON from 'ol/format/GeoJSON';
import StateManager from '../../state/statemanager';
import { Feature } from 'ol';


export const SPECIALITIES = [
  'Médecin généraliste',
  'Gynécologie et obstétrique',
  'Pédiatrie',
  'Psychiatrie et psychothérapie',
  "Psychiatrie et psychothérapie d'enfants et d'adolescents",
  'Ophtalmologie',
  'Médecine tropicale et médecine des voyages',
  'Neurologie',
  'Pneumologie',
  'Médecine du travail',
  'Dermatologie et vénéréologie',
  'Neurologie',
  'Pneumologie',
  "Chirurgie orthopédique et traumatologie de l'appareil locomoteur",
  'Allergologie et immunologie clinique',
  'Chirurgie plastique, reconstructive et esthétique',
  'Chirurgie cardiaque et vasculaire thoracique',
  'Cardiologie',
  'Orthodontie',
  'Anesthésiologie',
  'Oto-rhino-laryngologie',
  'Angiologie',
  'Médecine légale',
  'Gastroentérologie',
  'Rhumatologie',
  'Médecine dentaire reconstructive',
  'Chirurgie',
  'Médecine physique et réadaptation',
  'Urologie',
  'Oncologie médicale',
  'Endocrinologie-diabétologie',
  'Chirurgie orale',
  'Neurochirurgie',
  'Chirurgie maxillo-faciale',
  'Hématologie',
  'Médecine nucléaire',
  'Radiologie',
  'Soins intensifs',
  'Néphrologie',
  'Prévention et santé publique',
  'Chirurgie de la main',
  'Infectiologie',
  'Radio-oncologie/radiothérapie',
  'Génétique médicale',
  'Pathologie',
  'Pharmacologie et toxicologie cliniques',
];

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
    const doctorsData = await fetch('./sample_data/data.json', {
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
