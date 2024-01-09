import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../../state/statemanager';
import sheets from '../../../utils/stylemanager';
import { Feature } from 'ol';
import { ResultPanelContent } from '../../../state/state';


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
    this.stateManager.subscribe('resultPanelContent', (_oldValue, _newValue) => {
      const resultPanelContent = _newValue as ResultPanelContent;
      if (!Array.isArray(resultPanelContent.content)) {
        this.#doctor = resultPanelContent.content;
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
}

export default DoctorDetails;
