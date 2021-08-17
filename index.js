require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '/client/build')));

const {
  getLocations,
  addLocation,
  removeLocation,
} = require('./location-service');

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
});
const util = require('@google/maps').util;
const token = util.placesAutoCompleteSessionToken();

//autocomplete locations search results from googlemaps
app.get('/api/autocomplete/:id', (req, res) => {
  googleMapsClient.placesAutoComplete(
    {
      input: req.params.id,
      language: 'en',
      sessiontoken: token,
    },
    (_, result) => {
      res.send(result.json.predictions);
    }
  );
});

//get location by id from googlemaps
app.get('/api/place/:id', (req, res) => {
  googleMapsClient.place(
    {
      placeid: req.params.id,
      language: 'en',
    },
    (_, result) => {
      res.send(result.json.result);
    }
  );
});


//Routes to DB

//get locations from db
app.get('/api/locations', async (req, res) => {
  const locations = await getLocations();
  res.send(locations);
});

//add new location to db
app.post('/api/locations', async (req, res) => {
  const newLocation = req.body;
  const response = await addLocation(newLocation);
  res.send(response);
});

//remove location by id
app.delete('/api/locations', async (req, res) => {
  const idObj = req.body;
  const response = await removeLocation(idObj);
  res.send(response);
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});


//SocketIo connention

io.on('connection', async socket => {
  console.log('a user connected');

  socket.on('disconnect', reason => {
    console.log('user disconnected: ', reason);
  });

  socket.on('action', async action => {
    if (action.type === 'server/add') {
      const newLocation = action.payload;
      addLocation(newLocation)
        .then(response => {
          socket.broadcast.emit('action', {
            type: 'ADD_LOCATION',
            payload: newLocation,
          });
        }).catch(err => {
          console.log('addLocation err: ', err);
      })
    }

    if (action.type === 'server/remove') {
      const id = action.payload;
      removeLocation(id)
        .then(response => {
          socket.broadcast.emit('action', {
            type: 'REMOVE_LOCATION',
            payload: id,
          });
        }).catch(err => {
          console.log('addLocation err: ', err);
      })
    }
  });

});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
