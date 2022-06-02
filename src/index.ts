/* eslint-disable no-case-declarations */
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Stream from 'stream';
import { server as WebSocketServer, connection as Connection } from 'websocket';
dotenv.config();
import { log, sendMessage } from './utils';
import { WSTypes } from './client';

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  log('error', 'unhandledRejection', err);
});

const readable = new Stream.Readable({
  read(size) {
    /** */
  },
});

const {
  env: { SERVER_PORT },
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
{ env: Record<string, string> } = process as any;

const connections: Record<string, { id: number; connection: Connection }> = {};

const app = express();
app.use(cors());

app.get('/1', (req, res) => {
  readable.pipe(res);
});

const httpServer = http.createServer(app);

httpServer.listen(parseInt(SERVER_PORT, 10), function () {
  log('info', `Server is listening on port ${SERVER_PORT}`);
});

const wsServer = new WebSocketServer({
  httpServer,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 100000000,
  maxReceivedMessageSize: 100000000,
});

wsServer.on('request', function (request) {
  const { key } = request;
  console.log(key);
  const connection = request.accept('json', request.origin);
  connections[key] = {
    id: 0,
    connection,
  };
  connection.on('message', async function (message) {
    if (message.type === 'binary') {
      // readable.push(message.binaryData);
      connection.send(message.binaryData);
    } else if (message.type === 'utf8') {
      const msg = JSON.parse(message.utf8Data);
      sendMessage({ connection, data: { type: WSTypes.timeUpdate, data: msg.data } });
    } else {
      log('warn', 'Message is', message);
    }
  });

  connection.on('close', function (reason, description) {
    console.log('close', reason, description);
  });
});
