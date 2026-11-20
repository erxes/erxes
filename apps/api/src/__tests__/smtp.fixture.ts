import { createServer, type Server } from 'node:net';
import { afterAll, beforeAll } from 'vite-plus/test';

interface Received {
  from: string;
  to: string[];
  /** The message as sent: headers, a blank line, the body. */
  data: string;
}

/** The only password `AUTH PLAIN` takes, until a test changes it; any user name goes. */
const PASSWORD = 'pa55word';

/** `AUTH PLAIN <base64 of \0user\0password>`: whether the password is the server's. */
const signsIn = (line: string, password: string) =>
  Buffer.from(line.slice(11), 'base64').toString().split('\0')[2] === password;

/** Just enough SMTP to take mail (no TLS; signing in is optional): what each message said. */
const startSmtp = async (accepts: { password: string }) => {
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
        } else if (/^EHLO/i.test(line)) socket.write('250-test\r\n250 AUTH PLAIN\r\n');
        else if (/^AUTH PLAIN /i.test(line)) {
          socket.write(
            signsIn(line, accepts.password)
              ? '235 ok\r\n'
              : '535 Authentication Credentials Invalid\r\n',
          );
        } else if (/^MAIL FROM:/i.test(line)) {
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

/**
 * A fake SMTP server for the file's tests: its port, the messages it took, and
 * the password it takes (a test changes it to see sign-ins refused).
 */
export const useSmtp = () => {
  const smtp = { port: 0, received: [] as Received[], password: PASSWORD };
  let server: Server | undefined;

  beforeAll(async () => {
    const started = await startSmtp(smtp);

    server = started.server;
    smtp.port = started.port;
    smtp.received = started.received;
  });

  afterAll(() => {
    server?.close();
  });

  return smtp;
};
