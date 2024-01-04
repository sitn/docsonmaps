import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';

class SearchBar extends HTMLElement {
  template?: () => Hole;
  stateManager?: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  connectedCallback() {
    this.update();
    this.shadowRoot!.getElementById('searchbar')?.addEventListener('click', () => this.toggle())
  }

  toggle() {
    this.stateManager!.state.interface.isSearchmodalVisible = true;
  }

  update() {
    render(this.shadowRoot, this.template!);
    this.shadowRoot!.adoptedStyleSheets = sheets;
  }
}

export default SearchBar;
