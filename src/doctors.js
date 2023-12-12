import GeoJSON from 'ol/format/GeoJSON';

class Doctors {
  /**
   * @type {Feature[]}
   */
  #doctorFeatures;

  /**
   * @private
   */
  constructor(doctorFeatures) {
    this.#doctorFeatures = doctorFeatures;
  }

  static async getDoctors() {
    return fetch('sample_data/data.json', {
      headers: {
        Accept: 'application/geo+json',
      },
    }).then((response) => response.json())
      .then((doctorsData) => new GeoJSON().readFeatures(doctorsData));
  }

  get doctorFeatures() { return this.#doctorFeatures; }

  static getDoctorHTML(feature) {
    return `
    <div class="alert alert-${feature.get('text_color')}">${feature.get('availability_fr')}</div>
    <div class="row">
      <div class="col-8">
        <address>
          ${feature.get('sitn_address')}<br>
          ${feature.get('nopostal')} ${feature.get('localite')}
        </address>
      </div>
      <div class="col-4 text-end">
        <a class="btn" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${feature.get('sitn_address')}, ${feature.get('nopostal')} ${feature.get('localite')}
        "><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-sign-turn-left-fill" viewBox="0 0 16 16">
          <path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098L9.05.435ZM7 8.466a.25.25 0 0 1-.41.192L4.23 6.692a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V6h1.5A2.5 2.5 0 0 1 11 8.5V11h-1V8.5A1.5 1.5 0 0 0 8.5 7H7z"/>
        </svg></a>
      </div>
    </div>
    <div class="row mt-2">
      <div class="col-8">
        Tél ${feature.get('notel')}
      </div>
      <div class="col-4 text-end">
        <a class="btn" target="_blank" href="tel:${feature.get('notel')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
        </svg></a>
      </div>
    </div>`;
  }
}

export default Doctors;
