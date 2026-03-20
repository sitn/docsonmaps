import BaseComponent from '../basecomponent';

class Loading extends BaseComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
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
}

export default Loading;
