import '../style.css';
import Loading from '../components/loading/loading';
import DoctorEdit from '../components/doctors/doctoredit/doctoredit';
import StateManager from '../state/statemanager';
import DoctorsManager from '../components/doctors/doctorsmanager';

customElements.define('custom-loading', Loading);
customElements.define('doctor-edit', DoctorEdit);

const stateManager = StateManager.getInstance();

stateManager.state.loading = true;

const guid = new URLSearchParams(window.location.search).get('guid');

if (!guid) {
  alert("Le lien n'est pas valide. Si vous pensez qu'il s'agit d'une erreur, merci de contacter le SITN.");
  window.location.href = '/';
}

DoctorsManager.getDoctorByToken(guid as string).then((doctor) => {
  stateManager.state.loading = false;
  stateManager.state.editDoctor = doctor;
  document.getElementById('initially-hidden')!.style.visibility = 'visible';
});
