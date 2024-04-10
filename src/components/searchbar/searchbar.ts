import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import { DoctorFilter } from "../../state/state";

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
    this.stateManager.subscribe('currentFilter', (_old, newValue) => this.handleFilterChange(newValue));
  }

  handleFilterChange(newValue: unknown) {
    const currentFilter = newValue as DoctorFilter;
    if (currentFilter.doctorType !== '') {
      this.setSearchText(currentFilter.doctorType);
    } else {
      this.resetSearchBar();
    }
  }

  setSearchText(searchText: string) {
    this.#searchText = searchText;
    this.#classList = '';
    this.update();
  }

  resetSearchBar() {
    this.#searchText = 'Rechercher';
    this.#classList = ' fake-input-placeholder';
    this.stateManager.state.currentFilter = {
      doctorType: '',
      doctorDisponibility: false,
    };
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
  }
}

export default SearchBar;
