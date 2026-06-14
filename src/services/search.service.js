import axios from "axios";

export async function executeSearch(params) {
  const baseURL =
    params.modulo === "name"
      ? process.env.SEARCH_API_NAME_URL
      : process.env.SEARCH_API_URL;

  console.log("MODULO:", params.modulo);
  console.log("BASE URL:", baseURL);
  console.log("SEARCH_API_URL existe:", !!process.env.SEARCH_API_URL);
  console.log("SEARCH_API_NAME_URL existe:", !!process.env.SEARCH_API_NAME_URL);
  console.log("SEARCH_API_TOKEN existe:", !!process.env.SEARCH_API_TOKEN);

  const response = await axios.get(baseURL, {
    params: {
      token: process.env.SEARCH_API_TOKEN,
      ...params
    },
    timeout: 30000,
    validateStatus: () => true
  });

  console.log("STATUS API EXTERNA:", response.status);
  console.log("RESPOSTA API EXTERNA:", response.data);

  return response.data;
}