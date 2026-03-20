import ModalComponent from '../modalcomponent';

class AboutModal extends ModalComponent {
  template;
  templateUrl = './template.html';
  styleUrl = './style.css';
  protected get modalElementId() { return 'about-modal'; }
  protected get statePropertyPath() { return 'interface.isAboutModalVisible'; }
}

export default AboutModal;
