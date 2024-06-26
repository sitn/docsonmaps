import { render } from 'uhtml';
import { Hole } from 'uhtml/keyed';
import StateManager from '../../state/statemanager';
import { Offcanvas } from 'bootstrap';
import State from '../../state/state';
import { Feature } from 'ol';
import { ResultPanelMode } from '../../state/state';
import { ResultPanelInterface } from '../../state/state';

class ResultPanel extends HTMLElement {
  template?: () => Hole;
  stateManager: StateManager;
  templateUrl = './template.html';
  styleUrl = './style.css';
  #title = '';
  #title2Element?: HTMLHeadingElement;
  #offcanvas?: Offcanvas;
  #offcanvasElement?: HTMLDivElement;
  #contentType: ResultPanelMode = 'LIST';
  #state: State;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stateManager = StateManager.getInstance();
    this.#state = this.stateManager.state;
  }

  private setTitles() {
    if (this.#title2Element) {
      this.#title = this.#state.resultPanelHeader.title;
      this.#title2Element.innerHTML = this.#state.resultPanelHeader.title2;
      return
    }
    console.error('setTitles() called before DOM is ready')
  }

  registerEvents() {
    this.stateManager.subscribe('interface.resultPanel', (_oldValue, newValue) => {
      const panelInterface = newValue as ResultPanelInterface
      if (panelInterface.isVisible) {
        this.#contentType = panelInterface.mode;
        this.setTitles()
        this.#offcanvas?.show();
      } else {
        if (this.#offcanvasElement!.classList.contains('show')) {
          this.#offcanvas?.hide();
        }
      }
      this.update();
    });

    this.stateManager.subscribe('resultPanelHeader', (_oldValue, _newValue) => {
      this.setTitles();
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

    window.addEventListener('resize', () => this.resizePanel());
  }

  closeOffcanvas() {
    this.stateManager.state.interface.resultPanel.isVisible = false;
    this.stateManager.state.featureList = [];
    this.#offcanvas?.hide();
  }

  connectedCallback() {
    this.update();
    this.#offcanvasElement = this.shadowRoot?.getElementById('offcanvas-panel') as HTMLDivElement;
    this.#offcanvas = new Offcanvas(this.#offcanvasElement);
    this.#title2Element = this.shadowRoot?.getElementById('title2') as HTMLHeadingElement;
    this.resizePanel();
    this.registerEvents();
  }

  resizePanel() {
    if (window.innerWidth > 560 && this.#offcanvasElement!.classList.contains("offcanvas-bottom")) {
      this.#offcanvasElement!.classList.remove("offcanvas-bottom");
      this.#offcanvasElement!.classList.add("offcanvas-start");
      this.update();
    } else if (window.innerWidth <= 560 && this.#offcanvasElement!.classList.contains("offcanvas-start")) {
      this.#offcanvasElement!.classList.remove("offcanvas-start");
      this.#offcanvasElement!.classList.add("offcanvas-bottom");
      this.update();
    }
  }

  update() {
    render(this.shadowRoot, this.template!);
  }
}

export default ResultPanel;
