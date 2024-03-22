import GeoJSON from 'ol/format/GeoJSON';
import StateManager from '../../state/statemanager';
import { Feature } from 'ol';

const API_URL = import.meta.env.VITE_API_URL;

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
    const doctorsData = await fetch(`${API_URL}/doctors/as_geojson/`, {
      headers: {
        Accept: 'application/json',
      },
    }).then((response) => response.json());
    const doctors = new GeoJSON().readFeatures(doctorsData);
    return doctors;
  }

  static async getDoctorByToken(guid: string) {
    const doctorData = await fetch(`${API_URL}/doctors/edit/${guid}/`, {
      headers: {
        Accept: 'application/json',
      },
    }).then((response) => {
        if (response.status === 404) {
          alert(
            "Le lien utilisé n'est plus valable ou a déjà été utilisé. "
            + "Demandez-en un autre si vous souhaitez modifier vos informations.");
          window.location.href = '/';
        }
        return response.json();
      })
    return doctorData;
  }

  static async submitDoctorChanges(guid: string, data: FormData) {
    const doctorData = Object.fromEntries(data.entries()) as Record<string, string | boolean | string[]>;
    const spokenLanguagesString = doctorData['spoken_languages'].toString();
    doctorData['spoken_languages'] = spokenLanguagesString.split(',').map(lang => lang.trim());
    console.log(doctorData)
    await fetch(`${API_URL}/doctors/edit/${guid}/`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorData)
    }).then((response) => {
      if (response.ok) {
        // TODO : snack
        alert("Modifications apportées avec succès.");
        return true;
      }
      alert("Une erreur s'est produite, merci de nous contacter.")
      return true;
    })
  }

  private prepareDoctor(doctorFeature: Feature) {
    doctorFeature.set('specialites', (doctorFeature.get('specialites') || 'Médecin').replaceAll('<br>', ' · '));
    const availability = doctorFeature.get('availability');
    const conditions = doctorFeature.get('availability_conditions');
    switch (availability) {
      case 'Available':
        doctorFeature.set('availability_fr', 'Accepte de nouveaux patients');
        doctorFeature.set('text_color', 'primary');
        break;
      case 'Available with conditions':
        doctorFeature.set('text_color', 'warning');
        if (conditions) {
          doctorFeature.set('availability_fr', conditions);
          break;
        }
        doctorFeature.set('availability_fr', 'Accepte de nouveaux patients sous conditions');
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
