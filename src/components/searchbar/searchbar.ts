import BaseComponent from '../basecomponent';
import State, { DoctorFilter } from "../../state/state";

class SearchBar extends BaseComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #searchText = 'Rechercher';
  #classList = ' fake-input-placeholder'
  #state: State;

  constructor() {
    super();
    this.#state = this.stateManager.state;
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
    const currentDisponibilities = this.#state.currentFilter.doctorDisponibilities;
    this.#state.currentFilter = {
      doctorType: '',
      doctorDisponibilities: currentDisponibilities,
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
}

export default SearchBar;
