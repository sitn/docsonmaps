import BaseComponent from '../basecomponent';
import { Toast } from 'bootstrap';
import { ToastAlertData } from '../../state/state';

class ToastAlert extends BaseComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  message?: string;
  #toast?: Toast;
  #toastElement?: HTMLDivElement;

  registerEvents() {
    this.stateManager.subscribe('interface.toast', (_oldValue, newValue) => this.showToast(newValue as ToastAlertData));
    this.#toastElement!.addEventListener('hidden.bs.toast', () => this.stateManager.state.interface.toast = undefined);
  }

  showToast(data: ToastAlertData) {
    if (data) {
      this.message = data.message;
      this.#toastElement!.className = [
        "toast",
        "align-items-center",
        "text-white",
        `bg-${data.level}`,
        "border-0",
        "position-fixed",
        "bottom-0",
        "end-0",
        "p-2",
        "m-md-2",
      ].join(" ");
      this.update();
      this.#toast?.show();
    }
  }

  connectedCallback() {
    this.update();
    this.#toastElement = this.shadowRoot?.getElementById('toast') as HTMLDivElement;
    this.#toast = new Toast(this.#toastElement);
    const closeButton = this.#toastElement!.querySelector('#close-button');
    closeButton!.addEventListener('click', () => this.#toast?.hide());
    this.registerEvents();
  }
}

export default ToastAlert;
