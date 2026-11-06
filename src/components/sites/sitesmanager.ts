import { iSite } from "../../state/state";
import { API_URL } from "../../config";

async function getSites(): Promise<iSite[]> {
  const sitesData = await fetch(`${API_URL}/sites/`, {
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => response.json());
  return sitesData;
}

export default getSites;
