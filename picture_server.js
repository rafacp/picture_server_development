//node.js websocket server script

//const http = require('https');
const http = require('http');
const WebSocketServer = require('websocket').server;
const fs = require('fs');

//ports
const websocketport = 7777; //ue4 default
const port = 7778;
/*
const wsserver = http.createServer({
    //cert: fs.readFileSync('fullchain.pem'),
    //key: fs.readFileSync('privkey.pem')
});

wsserver.listen(websocketport);

const word = "word";

const wsServer = new WebSocketServer({
    httpServer: wsserver
});

//setup server error handling

wsServer.on('error', (err)=>{
    console.log('wsServer.on error:',err);
});

console.log('WEBSOCKET server is running on port ' + websocketport + '.');

wsServer.on('get', (get)=>{
    console.log('wsServer.on get:',get);
});

wsServer.on('request', function(request){
    console.log('wsServer.on request:',request);
    const connection = request.accept(null, request.origin);
    let originAddress = "empty address";
    if(request.origin)
    {
        originAddress = request.origin.toString();
    }

    let originIP = request.origin.remoteAddress;

    setTimeout(function(){
        console.log('setTimeout fired');
        connection.sendUTF('BYE');
        connection.close();
    }, 500);

    connection.on('message', function(message){
        console.log('connection.on message');
        console.log('--------------------------------');

        let errorCode = 1;

        connection.sendUTF('You said: ' + message.utf8Data);
        if(!message.utf8Data.includes('-'))
        {
            errorCode = 0;
        }

        console.log('IN:', message.utf8Data);
        console.log('TIP:', errorCode);
        console.log('Origin:', originAddress);
        console.log('Origin IP:', originIP);

        connection.sendUTF('OK');

        try{
            var test = JSON.parse(message.utf8Data);
            console.log('Valid JSON');
        }
        catch(e){
            console.log('JSON **NOT** Valid');
            errorCode = 0;
        }

        if(errorCode != 0)
        {
            sockets.forEach(function(sock, index, array){
                let serverMessage = message.utf8Data;
                sock.write(serverMessage);
                console.log('SERVER SENT: ', serverMessage);
            });
        }
        else
        {
            console.log('FAILED');
        }
    });

    //handle websocket close
    connection.on('close', function(reasonCode, description){
        console.log('Client disconnected: reason code = ', reasonCode);
        console.log('\r');
    });
});
*/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.get('/',(req,res)=>{
    console.log('app.get /')
    res.send('Hi');
});

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
        var is_kernel_buffer_full = sock.write(picture, ()=>{
            sock.write('PICTURE_END');
        });
        /*if(is_kernel_buffer_full){
            console.log('Data was flushed - ok');
        }else{
            sock.pause();
            sock.on('drain', ()=>{
                console.log('Now the buffer is empty');
                sock.resume();
            });
        }
        */
        //sock.write('END');
    });
};

app.listen(websocketport, ()=>{
//app.listen(process.env.PORT, process.env.IP, ()=>{
    console.log('Web Socket Server started on port ' + websocketport);
});
//virtual audience socket client servers

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

//when connected by virtual audience server
server.on('connection', function(sock){
    console.log('server.on connection:');
    sockets.push(sock);
    sock.write('WELCOME');
    //console.log('server.on connection:',sock);
    //timeout
    //sock.setTimeout(10000, ()=>{
    //    sock.destroy();
    //});

    //socket error handling
    sock.on('error', function(err){
        console.log('server.on sock.on error:', err);
    });

    sock.on('close', function(data){
        console.log('server.on sock.on close:', data);
    });
});

