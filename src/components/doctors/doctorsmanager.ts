import GeoJSON from 'ol/format/GeoJSON';
import StateManager from '../../state/statemanager';
import { Feature } from 'ol';
import { FeatureLike } from 'ol/Feature';

const API_URL = import.meta.env.VITE_API_URL;
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

export const BANNED_TRAININGS = [
  'Cytopathologie',
  'Pratique du laboratoire au cabinet médical',
  'Qualification pour les ex. radiologiques à fortes doses en cardiologie',
  'Qualification pour les examens radiologiques à fortes doses'
]

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
    const state = this.stateManager.state;
    state.loading = true;
    this.getDoctors().then((docs) => {
      docs.map((doctor) => this.prepareDoctor(doctor as Feature));
      state.doctors = docs;
      state.loading = false;
      // TODO: refactor this, repetition of featurelist
      const currentDoctorId = new URLSearchParams(window.location.search).get('currentDoctor');
      if (currentDoctorId) {
        const currentDoctor = docs.find(doctor => doctor.get('id_person_address') === currentDoctorId);
        if (currentDoctor) {
          state.resultPanelHeader = {
            title: `${currentDoctor.get('nom')} ${currentDoctor.get('first_name')}`,
            title2: `${currentDoctor.get('specialites')}`,
          };
          state.currentDoctor = currentDoctor as Feature;
          this.stateManager.state.interface.resultPanel = {
            isVisible: true,
            mode: 'DOCTOR'
          }
        }
        window.history.pushState({}, document.title, window.location.pathname);
      }
    });
  }

  /**
   * This function is meant to be used as a param of Array.sort()
   * @param doctorA first doctor as an ol Feature or FeatureLike
   * @param doctorB second doctor as an ol Feature or FeatureLike
   * @returns positive integer if doctorA should appear after doctorB,
   * negative if before, and zero if they are equivalent
   */
  static compareByAvailabilityAndName(doctorA: FeatureLike, doctorB: FeatureLike): number {
    // idx is availability casted into an integer
    const idxComparison = doctorA.get('idx') - doctorB.get('idx');
    if (idxComparison !== 0) {
      return idxComparison;
    }
    const nameA = doctorA.get('nom');
    const nameB = doctorB.get('nom');
    return nameA.localeCompare(nameB);
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
          window.location.href = VITE_BASE_URL;
        }
        return response.json();
      })
    return doctorData;
  }

  static async submitDoctorChanges(guid: string, data: FormData) {
    const doctorData = Object.fromEntries(data.entries()) as Record<string, string | boolean | string[]>;
    const spokenLanguagesString = doctorData['spoken_languages'].toString();
    doctorData['spoken_languages'] = spokenLanguagesString.split(',').map(lang => lang.trim());
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

  /**
   * Each doctor is prepared for the app.
   * @param doctorFeature 
   */
  private prepareDoctor(doctorFeature: Feature) {
    // specialities are separated with a ·
    doctorFeature.set('specialites', (doctorFeature.get('specialites') || 'Médecin').replaceAll('<br>', ' · '));
    
    // some additionnal trainings are banned because irrelevant in this app
    const compl_formations = doctorFeature.get('compl_formation');
    const clean_formations: string[] = [];
    if (compl_formations) {
      const formations: string[] = compl_formations.split('<br>')
      formations.forEach(formation => {
        if (!BANNED_TRAININGS.includes(formation)) {
          clean_formations.push(formation)
        }
      });
      doctorFeature.set('compl_formation', clean_formations.join(' · '));
    }
    
    // in case doctor set its preferred first_name, we give priority to it.
    let first_name = doctorFeature.get('prenoms');
    if (doctorFeature.get('public_first_name')?.length > 1) {
      first_name = doctorFeature.get('public_first_name')
    }
    doctorFeature.set('first_name', first_name);

    // availability are matched with a translation, priority index and a color
    const availability = doctorFeature.get('availability');
    const conditions = doctorFeature.get('availability_conditions');
    switch (availability) {
      case 'Available':
        doctorFeature.set('availability_fr', 'Accepte de nouveaux patients');
        // idx is an index based on availability for sorting
        doctorFeature.set('idx', 0);
        doctorFeature.set('text_color', 'primary');
        break;
      case 'Available with conditions':
        doctorFeature.set('idx', 1);
        doctorFeature.set('text_color', 'warning');
        if (conditions) {
          doctorFeature.set('availability_fr', conditions);
          break;
        }
        doctorFeature.set('availability_fr', 'Accepte de nouveaux patients sous conditions');
        break;
      case 'Not available':
        doctorFeature.set('availability_fr', 'Ne prend plus de nouveaux patients');
        doctorFeature.set('idx', 3);
        doctorFeature.set('text_color', 'danger');
        break;
      default:
        doctorFeature.set('availability', 'Unknown');
        doctorFeature.set('availability_fr', 'Accepte peut-être des nouveaux patients');
        doctorFeature.set('idx', 2);
        doctorFeature.set('text_color', 'light');
    }
  }
}

export default DoctorsManager;
