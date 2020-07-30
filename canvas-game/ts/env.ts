const urlParams = new URLSearchParams(window.location.search);
const apiURL = urlParams.get('apiUrl') || '';

export const API_URL = apiURL;