class SitesProvider {
  static async getSites() {
    const response = await fetch('sample_data/sites.json', {
      headers: {
        Accept: 'application/geo+json',
      },
    });
    const data = await response.json();
    return data;
  }
}

export default SitesProvider;
