import { iSite } from "../../state/state";
const API_URL = import.meta.env.VITE_API_URL;

async function getSites(): Promise<iSite[]> {
  const sitesData = await fetch(`${API_URL}/sites/`, {
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => response.json());
  return sitesData;
}

export default getSites;
