import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';

class Loading extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  get isLoading() {
    return this.stateManager.state.loading
  }

  get displayClass() {
    if (this.isLoading) {
      return "lds-ring";
    }
    return "d-none";
  }

  registerEvents() {
    this.stateManager.subscribe('loading', (_oldValue, _newValue) => {
      this.update();
    });
  }

  connectedCallback() {
    this.update();
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default Loading;
