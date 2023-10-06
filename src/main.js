import './style.scss';

// eslint-disable-next-line no-unused-vars
import { Modal } from 'bootstrap';
import SitnMap from './sitnmap';

SitnMap.setTarget('map');

const myModal = document.getElementById('searchModal');

myModal.addEventListener('shown.bs.modal', () => {
  document.getElementById('search-input').focus();
});
