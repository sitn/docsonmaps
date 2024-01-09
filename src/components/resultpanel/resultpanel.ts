import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import sheets from '../../utils/stylemanager';
import { Offcanvas } from 'bootstrap';
import { ResultPanelContent } from '../../state/state';

class ResultPanel extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #title = '';
  #title2 = '';
  #offcanvas?: Offcanvas;
  #offcanvasElement?: HTMLDivElement;
  #contentType: 'LIST' | 'DOCTOR' = 'LIST';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.isResultPanelVisible', (_oldValue, newValue) => {
      if (newValue) {
        this.#title = this.stateManager.state.resultPanelContent.title;
        this.#title2 = this.stateManager.state.resultPanelContent.title2;
        this.#offcanvas?.show();
      } else {
        if (this.#offcanvasElement!.classList.contains('show')) {
          this.#offcanvas?.hide();
        }
      }
      this.update();
    });

    this.stateManager.subscribe('resultPanelContent', (_oldValue, newValue) => {
      const panelContent = newValue as ResultPanelContent
      this.#title = panelContent.title;
      this.#title2 = panelContent.title2;
      if (Array.isArray(panelContent.content)) {
        this.#contentType = 'LIST';
      } else {
        this.#contentType = 'DOCTOR';
      }
      this.update();
    });

    this.#offcanvasElement!.querySelector('#offcanvas-close')!.addEventListener('click', () => this.closeOffcanvas());
    this.#offcanvasElement!.addEventListener('hidden.bs.offcanvas', () => this.closeOffcanvas());
  }

  closeOffcanvas() {
    this.stateManager.state.interface.isResultPanelVisible = false;
  }

  connectedCallback() {
    this.update();
    this.#offcanvasElement = this.shadowRoot?.getElementById('offcanvas-panel') as HTMLDivElement;
    this.#offcanvas = new Offcanvas(this.#offcanvasElement)
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
    this.shadowRoot!.adoptedStyleSheets = sheets;
  }
}

export default ResultPanel;
