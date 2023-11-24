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
    const doctorsData = await fetch('sample_data/data.json', {
      headers: {
        Accept: 'application/geo+json',
      },
    }).then((response) => response.json());
    const doctors = new GeoJSON().readFeatures(doctorsData);
    return new Doctors(doctors);
  }

  get doctorFeatures() { return this.#doctorFeatures; }
}

export default Doctors;
