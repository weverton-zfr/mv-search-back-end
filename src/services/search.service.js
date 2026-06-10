import axios from "axios";

const searchApi = axios.create({
  baseURL: process.env.SEARCH_API_URL,
  timeout: 30000
});

export async function executeSearch(params) {
  const response = await searchApi.get("/", {
    params: {
      token: process.env.SEARCH_API_TOKEN,
      ...params
    },
    validateStatus: () => true
  });

  return response.data;
}