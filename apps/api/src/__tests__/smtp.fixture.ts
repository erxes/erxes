import { createServer, type Server } from 'node:net';

interface Received {
  from: string;
  to: string[];
  data: string;
}

export interface FakeSmtp {
  server: Server;
  received: Received[];
  port: number;
}

/** Just enough SMTP to take mail (no TLS, no sign-in): what each message said. */
export const startSmtp = async (): Promise<FakeSmtp> => {
  const received: Received[] = [];

  const server = createServer((socket) => {
    let mail: Received = { from: '', to: [], data: '' };
    let inData = false;

    socket.write('220 test ESMTP\r\n');
    socket.on('data', (chunk) => {
      for (const line of chunk.toString().split('\r\n').filter(Boolean)) {
        if (inData) {
          if (line === '.') {
            inData = false;
            received.push(mail);
            mail = { from: '', to: [], data: '' };
            socket.write('250 queued\r\n');
          } else mail.data += `${line}\n`;
        } else if (/^EHLO/i.test(line)) socket.write('250 test\r\n');
        else if (/^MAIL FROM:/i.test(line)) {
          mail.from = line.slice(10);
          socket.write('250 ok\r\n');
        } else if (/^RCPT TO:/i.test(line)) {
          mail.to.push(line.slice(8));
          socket.write('250 ok\r\n');
        } else if (/^DATA/i.test(line)) {
          inData = true;
          socket.write('354 go on\r\n');
        } else if (/^QUIT/i.test(line)) socket.end('221 bye\r\n');
        else socket.write('250 ok\r\n');
      }
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  return { server, received, port: typeof address === 'object' && address ? address.port : 0 };
};
