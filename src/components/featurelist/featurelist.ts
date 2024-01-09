import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';
import { Feature } from 'ol';


class FeatureList extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #doctorsList: Feature[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isResultPanelVisible', (_oldValue, _newValue) => {
      const resultPanelContent = this.stateManager.state.resultPanelContent.content;
      if (Array.isArray(resultPanelContent)) {
        this.#doctorsList = this.prepareOrderedList(resultPanelContent);
        this.update();
      }
    });
  }

  connectedCallback() {
    this.shadowRoot!.adoptedStyleSheets = sheets;
    this.update();
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }

  private prepareOrderedList(doctors: Feature[]) {
    const orderedList: Record<string, Feature[]> = {
      'Available': [],
      'Available with conditions': [],
      'Unknown': [],
      'Not available': [],
    };
    doctors.forEach((feature) => {
      const availability = feature.get('availability');
      orderedList[availability].push(feature);
    });
    return Object.values(orderedList).flat();
  }

  clickDoctorHandler(doctor: Feature) {
    this.stateManager.state.resultPanelContent = {
      title: `${doctor.get('nom')} ${doctor.get('prenoms')}`,
      title2: `${doctor.get('sitn_address')}, ${doctor.get('nopostal')} ${doctor.get('localite')}`,
      content: doctor
    };
  }
}

export default FeatureList;
