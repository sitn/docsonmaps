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
  #doctorsList: Feature[];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
    this.#doctorsList = this.stateManager.state.currentCluster.doctors;
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isResultPanelVisible', (_oldValue, _newValue) => {
      this.#doctorsList = this.prepareOrderedList(this.stateManager.state.currentCluster.doctors);
      this.update();
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
}

export default FeatureList;
