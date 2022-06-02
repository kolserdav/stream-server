import type { connection as Connection } from 'websocket';

export const log = (type: 'info' | 'warn' | 'error', text: string, data?: any) => {
  console[type](type, text, data);
};

export function sendMessage({ data, connection }: { data: any; connection: Connection }) {
  connection.sendUTF(JSON.stringify(data));
}
