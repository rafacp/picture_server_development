/*//node.js websocket server script

const path = require('path');
const util = require('util');
//const http = require('http');
const express = require('express');
const helmet = require('helmet');
var bodyParser = require('body-parser');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const WebSocketServer = require('websocket').server;
//const fs = require('fs');

//ports
const websocketport = process.env.SOCKETPORT || 7777; //ue4 default
const port = process.env.PORT || 7778;

//const clients = [];

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(express.json({limit:'50mb'}));

app.get('/', (req,res)=>{
    console.log('app.get /')
    res.status(200).send({
        success:true,
        data:'/ GET OK'
    });
});

app.use(express.static(path.join(__dirname, 'www')));

app.post('/', (req,res)=>{
    console.log('app.post /');
    var picture = req.body.picture;
    //var json = '{picture:'+picture+'}';
    //console.log('picture:', picture);
    sendPicture(picture);
});

function sendPicture(picture){
    console.log('sending picture');
    console.log('sockets count:'+sockets.length);
    sockets.forEach(sock => {
        sock.write(picture, ()=>{
            sock.write('PICTURE_END');
        });
    });
};

app.listen(websocketport, ()=>{
//app.listen(process.env.PORT, process.env.IP, ()=>{
    console.log('Web Socket Server started on port ' + websocketport);
});

const net = require('net');
const host = '0.0.0.0';
const server = net.createServer();

let sockets = [];

//setup listening tcp server
server.listen(port, host, ()=>{
    console.log('TCP server is running on port ' + port + '.');
});

//setup error handling
server.on('error',(err)=>{
    console.log('server.on error:',err);
});


server.on('connection', function(sock){
    console.log('server.on connection:');
    sockets.push(sock);
    sock.write('WELCOME');
   
    sock.on('error', function(err){
        console.log('server.on sock.on error:', err);
    });

    sock.on('close', function(data){
        console.log('server.on sock.on close:', data);
    });
});
*/

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

app.post('/', (req, res) => {
  console.log('image size ' + req.body.picture.length);
  io.emit('image', req.body.picture);

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

