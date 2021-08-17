require('dotenv').config();
const fetch = require('node-fetch');
const DB_API_URL = process.env.DB_API_URL;
const headers = {
  'Content-Type': 'application/json',
  'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
};

async function getLocations() {
  try {
    const response = await fetch(DB_API_URL, {
      method: 'GET',
      headers,
    });
    const data = response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

async function addLocation(location) {
  locationStr = JSON.stringify(location);
  try {
    const response = await fetch(DB_API_URL, {
      method: 'POST',
      headers,
      body: locationStr,
    });
    const data = response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

async function removeLocation(id) {
  idObjStr = JSON.stringify({ id });
  try {
    const response = await fetch(DB_API_URL, {
      method: 'DELETE',
      headers,
      body: idObjStr,
    });
    const data = response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getLocations,
  addLocation,
  removeLocation,
};
