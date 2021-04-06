const path = require('path');
const util = require('util');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 7777;

const clients = [];

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json({ limit: '50mb' }));
app.use(helmet());

app.get('/', (req,res) => {
  console.log('app.get /')
  res.status(200).send({
    success: true,
    data: '/ GET OK'
  });
});

app.use(express.static(path.join(__dirname, 'www')));

//kill gamelift server path
app.post('/disconnect', (req, res) => {
  console.log('session_id:' + req.body.session_id);
  var data_to_send = {};
  data_to_send['session_id'] = req.body.session_id;
  io.emit('kill_gamelift_server' + req.body.session_id, JSON.stringify(data_to_send)); //replicate using emit 'disconnect'
  
  res.status(200).send({
    success: true,
    data: '/ POST OK'
  });
});

//receive image thru post request
app.post('/image', (req, res) => {
  console.log('image size ' + req.body.picture.length);
  console.log('session_id:' + req.body.session_id);
  console.log('display_id:' + req.body.display_id);
  var data_to_send = {};
  data_to_send['display_id'] = req.body.display_id;
  data_to_send['image'] = req.body.picture;
  io.emit('image' + req.body.session_id, JSON.stringify(data_to_send)); //replicate using emit 'image'

  res.status(200).send({
    success: true,
    data: '/ POST OK'
  });
});

const server = http.listen(PORT, () => {
  console.log(`Listening @ ${PORT}`);
});

io.on('connection', socket => {
  clients.push(socket.id);
  const clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
  io.emit('iologs', clientConnectedMsg);
  console.log(clientConnectedMsg);

  socket.on('disconnect', ()=>{
    clients.pop(socket.id);
    const clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
    io.emit('iologs', clientDisconnectedMsg);
    console.log(clientDisconnectedMsg);
  });
});

