const urlParams = new URLSearchParams(window.location.search);
const apiURL = urlParams.get('apiUrl') || '';
const room = urlParams.get('room');

export const API_URL = apiURL;
export const ROOM = room;