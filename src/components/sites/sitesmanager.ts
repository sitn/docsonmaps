import { iSite } from "../../state/state";

async function getSites(): Promise<iSite[]> {
  const sitesData = await fetch('./sites.json', {
    headers: {
      Accept: 'application/geo+json',
    },
  }).then((response) => response.json());
  return sitesData;
}

export default getSites;
