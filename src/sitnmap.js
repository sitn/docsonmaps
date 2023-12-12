/* eslint-disable no-restricted-syntax */
import proj4 from 'proj4';
import { Map, View } from 'ol';
import { getTopLeft, boundingExtent } from 'ol/extent';
import Projection from 'ol/proj/Projection';
import { register } from 'ol/proj/proj4';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Cluster } from 'ol/source';
import { Offcanvas, Modal } from 'bootstrap';
import {
  Icon,
  Style,
} from 'ol/style';
import Doctors from './doctors';
import SitesProvider from './sites';

proj4.defs(
  'EPSG:2056',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
);

register(proj4);
const extent = [2420000, 1030000, 2900000, 1360000];
const projection = new Projection({
  code: 'EPSG:2056',
  extent,
});

const projectionExtent = projection.getExtent();

const resolutions = [250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.125, 0.0625];

const matrixIds = [];
for (let i = 0; i < resolutions.length; i += 1) {
  matrixIds.push(i);
}

const sitnWMTSLayer = new TileLayer({
  source: new WMTS({
    attributions:
      '© <a href="https://sitn.ne.ch/web/conditions_utilisation/contrat_SITN_MO.htm"'
      + ' target="_blank">SITN</a>',
    url: 'https://sitn.ne.ch/mapproxy95/service?',
    layer: 'plan_ville',
    matrixSet: 'EPSG2056',
    format: 'image/png',
    projection,
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(projectionExtent),
      resolutions,
      matrixIds,
    }),
    style: 'default',
    wrapX: false,
  }),
});

const SitnMap = new Map({
  layers: [
    sitnWMTSLayer,
  ],
  controls: [],
  view: new View({
    center: [2550000, 1205150],
    zoom: 1,
    projection,
    resolutions,
    constrainResolution: true,
  }),
});

const doctorSource = new VectorSource({
  attributions: `&copy; SITN ${(new Date()).getFullYear()}`,
});

const clusterSource = new Cluster({
  distance: 10,
  minDistance: 25,
  source: doctorSource,
});

function availabilityBasedColor(feature) {
  let color = '#FF0000';
  if (feature.get('is_available')) {
    color = '#228B22';
  } else if (feature.get('is_available') === null) {
    color = '#666666';
  }
  return color;
}

const styleCache = {};
const clusters = new VectorLayer({
  source: clusterSource,
  style(feature) {
    const features = feature.get('features');
    let color = '#f8f9fa';
    let src = 'map_icon_white.svg';
    if (features.find((f) => f.get('availability') === 'Available')) {
      src = 'map_icon_green.svg';
    } else if (features.find((f) => f.get('availability') === 'Available with conditions')) {
      color = '#f6c8c8';
      src = 'map_icon_pink.svg';
    } else if (features.find((f) => f.get('availability') === 'Not available')) {
      color = '#e24848';
      src = 'map_icon_red.svg';
    }

    let style = styleCache[src];
    if (!style) {
      style = new Style({
        image: new Icon({
          displacement: [0, 15],
          src: `static/${src}`,
        }),
      });
      styleCache[color] = style;
    }
    return style;
  },
});

SitnMap.addLayer(clusters);
const sites = await SitesProvider.getSites();
const specialities = [
  'Afficher tous les médecins',
  'Médecin généraliste',
  'Gynécologie et obstétrique',
  'Pédiatrie',
  'Psychiatrie et psychothérapie',
  "Psychiatrie et psychothérapie d'enfants et d'adolescents",
  'Ophtalmologie',
  'Médecine tropicale et médecine des voyages',
  'Neurologie',
  'Pneumologie',
  'Médecine du travail',
  'Dermatologie et vénéréologie',
  'Neurologie',
  'Pneumologie',
  "Chirurgie orthopédique et traumatologie de l'appareil locomoteur",
  'Allergologie et immunologie clinique',
  'Chirurgie plastique, reconstructive et esthétique',
  'Chirurgie cardiaque et vasculaire thoracique',
  'Cardiologie',
  'Orthodontie',
  'Anesthésiologie',
  'Oto-rhino-laryngologie',
  'Angiologie',
  'Médecine légale',
  'Gastroentérologie',
  'Rhumatologie',
  'Médecine dentaire reconstructive',
  'Chirurgie',
  'Médecine physique et réadaptation',
  'Urologie',
  'Oncologie médicale',
  'Endocrinologie-diabétologie',
  'Chirurgie orale',
  'Neurochirurgie',
  'Chirurgie maxillo-faciale',
  'Hématologie',
  'Médecine nucléaire',
  'Radiologie',
  'Soins intensifs',
  'Néphrologie',
  'Prévention et santé publique',
  'Chirurgie de la main',
  'Infectiologie',
  'Radio-oncologie/radiothérapie',
  'Génétique médicale',
  'Pathologie',
  'Pharmacologie et toxicologie cliniques',
];

const offcanvasPanelEl = document.getElementById('offcanvas-panel');
const offcanvasPanel = new Offcanvas(offcanvasPanelEl);
let doctors;
let filteredDoctors = [];
const resetSearchButton = document.getElementById('reset-search-input');

function showOffcanvasView(offcanvasViewId) {
  const toBeShownTitle = document.getElementById(`${offcanvasViewId}-title`);
  const toBeShownBody = document.getElementById(`${offcanvasViewId}-body`);
  const toBeHiddenTitle = document.querySelectorAll('#offcanvas-panel > .offcanvas-header > div');
  const toBeHiddenBody = document.querySelectorAll('#offcanvas-panel > .offcanvas-body > :is(div, ul)');
  if (toBeShownTitle.hidden) {
    for (const divEl of toBeHiddenTitle) {
      divEl.hidden = true;
    }
    for (const divEl of toBeHiddenBody) {
      divEl.hidden = true;
    }
    toBeShownTitle.hidden = false;
    toBeShownBody.hidden = false;
  }
}

const myModal = document.getElementById('search-modal');

myModal.addEventListener('shown.bs.modal', () => {
  document.getElementById('search-input').focus();
});

function renderDoctorDetails(feature) {
  const doctorDetailsTitle = document.getElementById('doctor-details-title');
  const doctorDetailsBody = document.getElementById('doctor-details-body');

  doctorDetailsTitle.innerHTML = `
    <h5 class="card-title">${feature.get('nom')} ${feature.get('prenoms')}</h5>
    <h6 class="card-subtitle mb-2 text-muted">
    ${feature.get('specialites')}</h6>
  `;

  doctorDetailsBody.innerHTML = Doctors.getDoctorHTML(feature);
}

function handleQueryResultClick(feature) {
  showOffcanvasView('doctor-details');
  renderDoctorDetails(feature);
}

function zoomToFeature(feature) {
  const view = SitnMap.getView();
  const zoomCoordinates = feature.getGeometry().flatCoordinates;
  view.setCenter([zoomCoordinates[0], zoomCoordinates[1] - 20]);
  view.setZoom(12);
}

function handleSearchResultClick(feature) {
  zoomToFeature(feature);
  offcanvasPanel.toggle();
  showOffcanvasView('doctor-details');
  renderDoctorDetails(feature);
}

function doctorListElement(feature) {
  const liEl = document.createElement('LI');
  liEl.classList = 'list-group-item list-group-item-action';
  liEl.innerHTML = `
    <div class="row justify-content-between align-items-center">
      <div class="col-8">
        <h6>${feature.get('nom')} ${feature.get('prenoms')}</h6>
        <span class="fw-light">${feature.get('specialites').replace('<br>', ' · ')}</span><br>
      </div>
      <div class="col-4">
        <span class="badge rounded-pill text-bg-${feature.get('text_color')} text-wrap w-100">
          ${feature.get('availability_fr')}
        </span>
      </div>
    </div>`;
  return liEl;
}

function showQueryTitle(firstFeature) {
  const titleEl = document.getElementById('query-result-title');
  const address = `${firstFeature.get('sitn_address')}, ${firstFeature.get('nopostal')} ${firstFeature.get('localite')}`;

  const currentSite = sites.find((site) => site.address === address);
  if (currentSite) {
    titleEl.innerHTML = `
    <h5 class="card-title">${currentSite.name}</h5>
    <h6 class="card-subtitle mb-2 text-muted">
      ${firstFeature.get('sitn_address')} <br>
      ${firstFeature.get('nopostal')} ${firstFeature.get('localite')}
    </h6>
    <a href="${currentSite.link}">Voir les prestations détaillées</a>`;
  } else {
    titleEl.innerHTML = `
    <h5 class="card-title">${firstFeature.get('sitn_address')}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${firstFeature.get('nopostal')} ${firstFeature.get('localite')}</h6>`;
  }
}

function showQueryResults(features) {
  const queryResultBodyEl = document.getElementById('query-result-body');
  showOffcanvasView('query-result');
  showQueryTitle(features[0]);

  const orderedList = {
    Available: [],
    'Available with conditions': [],
    Unknown: [],
    'Not available': [],
  };

  features.forEach((feature) => {
    const availability = feature.get('availability');
    if (!orderedList[availability]) {
      orderedList[availability] = [];
    }
    const liEl = doctorListElement(feature);
    liEl.addEventListener('click', () => handleQueryResultClick(feature));
    orderedList[availability].push(liEl);
  });
  queryResultBodyEl.innerHTML = '';
  queryResultBodyEl.append(...Object.values(orderedList).flat());
  offcanvasPanel.toggle();
}

SitnMap.on('singleclick', (e) => {
  clusters.getFeatures(e.pixel).then((clickedFeatures) => {
    if (clickedFeatures.length) {
      // Get clustered Coordinates
      const features = clickedFeatures[0].get('features');
      const view = SitnMap.getView();
      if (features.length > 1 && view.getZoom() < 5) {
        const extentClicked = boundingExtent(
          features.map((r) => r.getGeometry().getCoordinates()),
        );
        view.fit(extentClicked, { duration: 250, padding: [50, 50, 50, 50] });
      } else {
        showQueryResults(features);
      }
    }
  });
});

function clearFilter() {
  const searchText = document.getElementById('search');
  searchText.innerText = 'Rechercher';
  searchText.classList.add('fake-input-placeholder');
  doctorSource.clear();
  doctorSource.addFeatures(doctors.doctorFeatures);
  resetSearchButton.hidden = true;
}
resetSearchButton.addEventListener('click', clearFilter);

function filterBySpeciality(event) {
  const typedSpeciality = event.target.innerText;
  if (typedSpeciality === 'Afficher tous les médecins') {
    clearFilter();
    return;
  }
  const searchText = document.getElementById('search');
  searchText.innerText = typedSpeciality;
  searchText.classList.remove('fake-input-placeholder');
  filteredDoctors = [];
  doctors.doctorFeatures.forEach((doctorFeature) => {
    if (typedSpeciality === 'Médecin généraliste') {
      if (doctorFeature.get('specialites').includes('Médecine interne générale')
         || doctorFeature.get('specialites').includes('Médecin praticien')) {
        filteredDoctors.push(doctorFeature);
      }
    } else if (doctorFeature.get('specialites').includes(typedSpeciality)) {
      filteredDoctors.push(doctorFeature);
    }
  });
  doctorSource.clear();
  doctorSource.addFeatures(filteredDoctors);
  resetSearchButton.hidden = false;
}

function createDoctorsList(targetId, features) {
  const target = document.getElementById(targetId);
  target.innerHTML = '';
  const liElements = [];
  features.forEach((doctorFeature) => {
    const liEl = doctorListElement(doctorFeature);
    liEl.addEventListener('click', () => handleSearchResultClick(doctorFeature));
    liEl.setAttribute('data-bs-dismiss', 'modal');
    liElements.push(liEl);
  });
  target.append(...liElements);
}

/**
 * Replaces search results with a pre-configured list of specialities
 * @param {String} targetId id of the UL element
 * @param {String[]} specialites list of specialities
 */
export function createSpectialitiesList(targetId, specialites) {
  const target = document.getElementById(targetId);
  target.innerHTML = '';
  const liElements = [];
  specialites.forEach((speciality) => {
    const liEl = document.createElement('LI');
    liEl.classList = 'list-group-item list-group-item-action';
    liEl.innerText = speciality;
    liEl.addEventListener('click', filterBySpeciality);
    liEl.setAttribute('data-bs-dismiss', 'modal');
    liElements.push(liEl);
  });
  target.append(...liElements);
}

Doctors.getDoctors().then((doctorsJSONFeatures) => {
  doctors = new Doctors(doctorsJSONFeatures);
  doctorSource.addFeatures(doctors.doctorFeatures);
  doctorSource.getFeatures().forEach((doctorFeature) => {
    doctorFeature.set('specialites', doctorFeature.get('specialites') || 'Médecin');
    const availability = doctorFeature.get('availability');
    const conditions = doctorFeature.get('availability_conditions');
    switch (availability) {
      case 'Available':
        doctorFeature.set('availability_fr', 'Accepte des nouveaux patients');
        doctorFeature.set('text_color', 'primary');
        break;
      case 'Available with conditions':
        doctorFeature.set('text_color', 'warning');
        if (conditions) {
          doctorFeature.set('availability_fr', conditions);
          break;
        }
        doctorFeature.set('availability_fr', 'Accepte des nouveaux patients sous conditions');
        break;
      case 'Not available':
        doctorFeature.set('availability_fr', 'Ne prend plus de nouveaux patients');
        doctorFeature.set('text_color', 'danger');
        break;
      default:
        doctorFeature.set('availability_fr', 'Accepte peut-être des nouveaux patients');
        doctorFeature.set('text_color', 'light');
    }
  });
});

function search(event) {
  const typedLength = event.target.value.length;
  if (typedLength <= 2) {
    createSpectialitiesList('search-results', specialities);
  } else if (typedLength > 2) {
    const results = doctors.doctorFeatures.filter((feature) => {
      const searchFields = [
        feature.get('nom'),
        feature.get('prenoms'),
        feature.get('specialites'),
      ];
      const searchString = searchFields.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const searchTerm = event.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (searchString.includes(searchTerm)) {
        return feature;
      }
      return null;
    });
    createDoctorsList('search-results', results);
  }
}

document.getElementById('search-input').onkeyup = search;

createSpectialitiesList('search-results', specialities);

export default SitnMap;
