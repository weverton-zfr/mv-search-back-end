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
    timeout: 30000,
    validateStatus: () => true
  });

  return response.data;
}