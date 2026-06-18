import axios from "axios";

export async function executeSearch(params) {
  const baseURL =
    params.modulo === "name"
      ? process.env.SEARCH_API_NAME_URL
      : process.env.SEARCH_API_URL;

  const queryParams = {
    token: process.env.SEARCH_API_TOKEN,
    ...params
  };

  const queryString = Object.entries(queryParams)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join("&");

  const separator = baseURL.includes("?") ? "&" : "?";

  const finalURL = `${baseURL}${separator}${queryString}`;

  console.log("URL API EXTERNA:", finalURL);

  const response = await axios.get(finalURL, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json"
    },
    timeout: 30000,
    validateStatus: () => true
  });

  console.log("STATUS API EXTERNA:", response.status);
  console.log("RESPOSTA API EXTERNA:", response.data);

  return response.data;
}