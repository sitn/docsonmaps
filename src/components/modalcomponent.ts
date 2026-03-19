import BaseComponent from './basecomponent';
import { Modal } from 'bootstrap';

/**
 * Abstract base class for modal components.
 * Subclasses must implement `modalElementId` and `statePropertyPath`
 * to configure which DOM element is the modal and which state property
 * controls its visibility.
 */
export default abstract class ModalComponent extends BaseComponent {
    protected modal?: Modal;
    protected modalElement?: HTMLDivElement;

    /** The ID of the modal element in the shadow DOM (e.g. 'about-modal') */
    protected abstract get modalElementId(): string;

    /** The state property path to subscribe to (e.g. 'interface.isAboutModalVisible') */
    protected abstract get statePropertyPath(): string;

    toggleModal(isVisible: boolean) {
        if (isVisible) {
            this.modal?.show();
        } else {
            this.modal?.hide();
        }
    }

    closeModal() {
        this.stateManager.setPropertyByPath(this.stateManager.state, this.statePropertyPath, false);
    }

    connectedCallback() {
        this.update();
        this.modalElement = this.shadowRoot?.getElementById(this.modalElementId) as HTMLDivElement;
        this.modal = new Modal(this.modalElement);
        this.registerEvents();
    }

    protected registerEvents() {
        this.stateManager.subscribe(this.statePropertyPath, (_oldValue, newValue) => this.toggleModal(newValue as boolean));
        this.modalElement!.addEventListener('hidden.bs.modal', () => this.closeModal());
    }
}
