import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';

class SearchBar extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #searchText = 'Rechercher';
  #classList = ' fake-input-placeholder'

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.shadowRoot!.getElementById('searchbar')?.addEventListener('click', () => this.toggle());

    this.stateManager.subscribe('currentFilter', (_oldValue, newValue) => {
      if (newValue !== '') {
        this.#searchText = newValue as string;
        this.#classList = '';
        this.update();
      } else {
        this.resetSearchBar();
      }
    });
  }

  resetSearchBar() {
    this.#searchText = 'Rechercher';
    this.#classList = ' fake-input-placeholder';
    this.update();
  }

  connectedCallback() {
    this.update();
    this.registerEvents();
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
