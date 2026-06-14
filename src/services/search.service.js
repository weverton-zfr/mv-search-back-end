import axios from "axios";

export async function executeSearch(params) {
  const baseURL =
    params.modulo === "name"
      ? process.env.SEARCH_API_NAME_URL
      : process.env.SEARCH_API_URL;

  const response = await axios.get(baseURL, {
    params: {
      token: process.env.SEARCH_API_TOKEN,
      ...params
    },
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    },
    timeout: 30000,
    validateStatus: () => true
  });

  console.log("STATUS API EXTERNA:", response.status);

  return response.data;
}