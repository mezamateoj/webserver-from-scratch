TCP provides:
 • Byte streams instead of packets.
 • Reliable and ordered delivery.
 Abyte stream is simply an ordered sequence of bytes. A protocol, rather than the application,
 is used to make sense of these bytes. Protocols are like file formats, except that the total
 length is unknown and the data is read in one pass

TCP simply has no mechanism for preserving boundaries.
 1. TCPsend buffer: This is where data is stored before transmission. Multiple writes
 are indistinguishable from a single write.
 2. Data is encapsulated as one or more IP packets, IP boundaries have no relationship to
 the original write boundaries.
 3. TCPreceive buffer: Data is available to applications as it arrives.

The No. 1 beginner trap in socket programming is “concatenating & splitting TCP packets”
because there is no such thing as “TCP packets”. Protocols are required to interpret TCP
data by imposing boundaries within the byte stream.

When you send data over a TCP socket, it’s just a stream of bytes under the hood. For example:

```bash

sock.send(b"Hello")
sock.send(b"World")

# Those two send() calls could be received as:

b"HelloWorld" (combined into one)
b"Hel" then later b"loWor" then b"ld" (split randomly)

```

or any other weird combo depending on timing, buffers, and the OS

TCP doesn’t care — it just promises to deliver the bytes in order, not in chunks.

### TCP Start with a Handshake
To establish a TCP connection, there should be a client and a server (ignoring the simul
taneous case). 

The server waits for the client at a specific address (IP + port), this step is
 called bind & listen. Then the client can connect to that address. The “connect” operation
 involves a 3-step handshake (SYN, SYN-ACK, ACK), but this is not our concern because
 the OS does it transparently. After the OS completes the handshake, the connection can be
 accepted by the server.

## TCP is Bidirectional & Full-Duplex
 Once established, the TCP connection can be used as a bi-directional byte stream, with 2
 channels for each direction. Many protocols are request-response like HTTP/1.1, where a
 peer is either sending a request/response or receiving a response/request. But TCP isn’t
 restricted to this mode of communication. Each peer can send and receive at the same time
 (e.g. WebSocket), this is called full-duplex communication.

## TCP End with 2 Handshakes
 Apeer tells the other side that no more data will be sent with the FIN flag, then the other
 side ACKs the FIN. The remote application is notified of the termination when reading
 from the channel.
 Each direction of channels can be terminated independently, so the other side also performs
 the same handshake to fully close the connection


# Socker Primitives

When you create a TCP connection, the connection is managed by your operating system,
and you use the socket handle to refer to the connection in the socket API

Think of a server like a receptionist at a company:
The Listening Socket: This is like the company's main phone number (IP address + port) listed in the directory. The receptionist (server) constantly listens on this line for incoming calls (client connections). This main line itself is represented by a "listening socket".

The Connection Socket: When a client actually calls (connects), the receptionist doesn't tie up the main line. Instead, they transfer the call to a direct extension for that specific conversation. This direct line, dedicated to one specific client, is the "connection socket". You get a new one of these for each client that connects.
So, you have two types of sockets:
* Listening Socket: Used only to wait for new incoming connections on the main address.
* Connection Socket: Used for the actual back-and-forth communication (sending/receiving data) with a single, specific client after they've connected.

Now, about ending the conversation (sending/receiving data):
Sending Data (Writing): When you're done sending your part of the conversation:
close the socket: This is like hanging up the phone completely. The call ends for both sides, you can't talk or listen anymore, and the extension (connection socket) is gone. It sends a "goodbye" signal (TCP FIN).
shutdown sending: This is like saying, "Okay, I'm done talking, but I'll stay on the line to hear if you have anything else to say." You stop sending, but you can still receive. It also sends the "goodbye" signal (TCP FIN) for your side of the sending, creating a "half-open" connection.
Receiving Data (Reading): How do you know when the other person has hung up or finished talking?
When the other side either closes their socket or shutdowns their sending, they send that "goodbye" signal (TCP FIN).
Your end receives this signal. When you try to read data after this, you'll get an indication that there's nothing more coming. This "end of transmission" signal is often called End Of File (EOF). It tells you the other side is finished sending data.

In short: You listen with one socket, talk with another (per client). You can end the talk completely (close) or just stop talking while still listening (shutdown). You know the other side is done talking when you detect an EOF.

### List of Socket Primitives
In summary, there are several socket primitives that you need to know about.
• Listening socket: bind & listen, accept, close
• Connection socket: read, write, close


### Callbacks 
callbacks are needed to do anything in our echo server. This is how an event
loop works. It’s a mechanism of the Node.js runtime, The event loop is single-threaded

Concurrency in Node.JS is Event-Based
 To help you understand the implication of the event loop, let’s now consider concurrency.
 A server can have multiple connections simultaneously, and each connection can emit
 events.
 While an event handler is running, the single-threaded runtime cannot do anything for the
 other connections until the handler returns. The longer you process an event, the longer
 everything else is delayed.