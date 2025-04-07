// TCP server that reads data from
// clients and writes the same data back. an “echo server”.

import net from 'node:net';

// callback function
// the runtime will automatically perform the accept operation and invoke the callback
// with the new connection as an argument of type net.Socket
function newConn(socket: net.Socket): void {
    console.log('new connection', socket.remoteAddress, socket.remotePort);

    socket.on('end', () => {
        // FIN. the connection will be closed
        console.log('EOF.')
    })

    socket.on('data', (data: Buffer) => {
        console.log('data', data);
        socket.write(data); // echo back the data


        if (data.includes('q')) {
            console.log('closing')
            socket.end();  // sends FIN and close connection
        }
    })
}


// creates a listening socket
let server = net.createServer();

// register the callback function
// will be called for each new connection
server.on('error', (err: Error) => {throw err;})
server.on('connection', newConn)

server.listen({
    host: "127.0.0.1",
    port: 1234
})