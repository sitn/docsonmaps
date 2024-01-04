import Feature, { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import StateManager from '../state/statemanager';


class DoctorsManager {
  stateManager: StateManager;

  /**
   * @private
   */
  constructor() {
    this.stateManager = StateManager.getInstance();
    this.getDoctors().then((docs) => this.stateManager.state.doctors = docs);
  }

  private async getDoctors() {
    const doctorsData = await fetch('../sample_data/data.json', {
      headers: {
        Accept: 'application/geo+json',
      },
    }).then((response) => response.json());
    const doctors = new GeoJSON().readFeatures(doctorsData);
    return doctors;
  }
}

export default DoctorsManager;
