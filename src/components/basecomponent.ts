import { render } from 'uhtml';
import StateManager from '../state/statemanager';

export default abstract class BaseComponent extends HTMLElement {
    stateManager: StateManager;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.stateManager = StateManager.getInstance();
    }

    update() {
        render(this.shadowRoot, (this as any).template!());
    }
}
