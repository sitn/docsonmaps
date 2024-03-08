import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import { Offcanvas } from 'bootstrap';
import { ResultPanelHeader } from '../../state/state';
import { Feature } from 'ol';
import { ResultPanelMode } from '../../state/state';
import { ResultPanelInterface } from '../../state/state';

class ResultPanel extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #title = '';
  #title2 = '';
  #offcanvas?: Offcanvas;
  #offcanvasElement?: HTMLDivElement;
  #contentType: ResultPanelMode = 'LIST';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
  }

  registerEvents() {
    this.stateManager.subscribe('interface.resultPanel', (_oldValue, newValue) => {
      const panelInterface = newValue as ResultPanelInterface
      if (panelInterface.isVisible) {
        this.#contentType = panelInterface.mode;
        this.#title = this.stateManager.state.resultPanelHeader.title;
        this.#title2 = this.stateManager.state.resultPanelHeader.title2;
        this.#offcanvas?.show();
      } else {
        if (this.#offcanvasElement!.classList.contains('show')) {
          this.#offcanvas?.hide();
        }
      }
      this.update();
    });

    this.stateManager.subscribe('resultPanelHeader', (_oldValue, newValue) => {
      const titles = newValue as ResultPanelHeader;
      this.#title = titles.title;
      this.#title2 = titles.title2;
    });

    this.stateManager.subscribe('featureList', (_oldValue, newValue) => {
      const featureList = newValue as Feature[];
      if (featureList.length > 0) {
        this.#contentType = 'LIST';
        this.update();
      }
    });

    this.stateManager.subscribe('currentDoctor', (_oldValue, newValue) => {
      if (newValue) {
        this.#contentType = 'DOCTOR';
        this.update();
      }
    });

    this.#offcanvasElement!.querySelector('#offcanvas-close')!.addEventListener('click', () => this.closeOffcanvas());
    this.#offcanvasElement!.addEventListener('hidden.bs.offcanvas', () => this.closeOffcanvas());
  }

  closeOffcanvas() {
    this.stateManager.state.interface.resultPanel.isVisible = false;
    this.stateManager.state.featureList = [];
    this.#offcanvas?.hide();
  }

  connectedCallback() {
    this.update();
    this.#offcanvasElement = this.shadowRoot?.getElementById('offcanvas-panel') as HTMLDivElement;
    this.#offcanvas = new Offcanvas(this.#offcanvasElement)
    this.registerEvents();
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default ResultPanel;
