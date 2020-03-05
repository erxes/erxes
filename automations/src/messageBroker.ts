import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import * as uuid from 'uuid';
import { debugBase } from './debuggers';

dotenv.config();

const { RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let conn;
let channel;

export const sendRPCMessage = async (message, channelTxt = 'rpc_queue:erxes-automations'): Promise<any> => {
  const response = await new Promise((resolve, reject) => {
    const correlationId = uuid();

    return channel.assertQueue('', { exclusive: true }).then(q => {
      channel.consume(
        q.queue,
        msg => {
          if (!msg) {
            return reject(new Error('consumer cancelled by rabbitmq'));
          }

          if (msg.properties.correlationId === correlationId) {
            const res = JSON.parse(msg.content.toString());

            if (res.status === 'success') {
              resolve(res.data);
            } else if (res.status === 'notFound') {
              resolve();
            } else {
              reject(res.errorMessage);
            }

            channel.deleteQueue(q.queue);
          }
        },
        { noAck: true },
      );

      channel.sendToQueue(channelTxt, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: q.queue,
      });
    });
  });

  return response;
};

export const sendMessage = async (queueName: string, data?: any) => {
  await channel.assertQueue(queueName);
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
};

const consumerHelperCheckTrigger = async msg => {
  if (msg !== null) {
    debugBase(`Received rpc queue message ${msg.content.toString()}`);

    const parsedObject = JSON.parse(msg.content.toString());

    const { action } = parsedObject;

    let response = { status: 'error', data: {} };

    if (action === 'get-response-check-automation') {
      const triggerResponse = {
        bgTriggers: [],
        response: [
          '<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset="utf-8">\n        <link rel="stylesheet" href="http://erkhet.biz/static/css/seller_print.css" media="print">\n        <script src="http://erkhet.biz/static/js/jquery.js"></script>\n        <script src="http://erkhet.biz/static/js/qrcodegen.js"></script>\n        <script src="http://erkhet.biz/static/js/jsbarcode.js"></script>\n        <script src="http://erkhet.biz/static/js/code128.js"></script>\n    </head>\n    <body>\n        <div class="receipt">\n\n            <div class="center">\n                <img src="http://erkhet.biz/static/images/document/ebarimt.png">\n            </div>\n            <p class="center">\n                test 1\n            </p>\n\n            <p class="center">\n                \n                \n            </p>\n\n            <div>\n                <p>ТТД: 0000038</p>\n                \n                    <p>ДДТД: 000000000038000200210071406050047</p>\n                \n                <p>Огноо: 2020-02-10 13:54:07</p>\n                <p>Баримтын №: 200210 / 1</p>\n            </div>\n\n            \n\n            <table class="tb" cellpadding="0" cellspacing="0">\n                <thead>\n                    <tr class="text-center">\n                        <th>Нэгж үнэ</th>\n                        <th>Тоо</th>\n                        <th>НӨАТ</th>\n                        <th>Нийт үнэ</th>\n                    </tr>\n                </thead>\n                \n                    <tr class="inventory-info">\n                        <td colspan="4">\n                            1.\n                            erxesCloud - erxes Cloud\n                        </td>\n                    </tr>\n                    <tr>\n                        <td>1098900.00</td>\n                        <td colspan="1">1.00</td>\n                        <td>99900.00</td>\n                        <td>1098900.00</td>\n                    </tr>\n                \n            </table>\n\n            <div class="total">\n                <p><label>НӨАТ:</label> 99900.00</p>\n                <p><label>НХАТ:</label> 0.00</p>\n                <p><label>Бүгд үнэ:</label> 1098900.00</p>\n            </div>\n\n            <div class="center barcode">\n                <div class="lottery">\n                    \n                        Сугалаа: IR DEMO2771\n                    \n                </div>\n                <span>\n                    \n                </span>\n                \n                    <canvas id="qrcode"></canvas>\n                \n                <img id="barcode" width="90%" />\n                <p>Манайхаар үйлчлүүлсэн танд баярлалаа !!!</p>\n            </div>\n        </div>\n        <script>\n            window.onbeforeunload = function () {\n              return \'Уг цонхыг хаавал энэ баримтыг ахиж хэвлэх боломжгүй болохыг анхаарна уу\';\n            }\n\n            if (\'6216879364881831065678460161143765802321441157541212441198910082882857542740836020968548890957848472887768196232355685395785756949461191757128658875711142978374926630922358939280768279842106318656614219080025936480023199091639116394955637041757560551167887413176584803006939405336492806108862787777051643083965060317\'){\n                // QRCODE\n                var canvas = document.getElementById("qrcode");\n                var ecl = qrcodegen.QrCode.Ecc.LOW;\n                var text = \'6216879364881831065678460161143765802321441157541212441198910082882857542740836020968548890957848472887768196232355685395785756949461191757128658875711142978374926630922358939280768279842106318656614219080025936480023199091639116394955637041757560551167887413176584803006939405336492806108862787777051643083965060317\';\n                var segs = qrcodegen.QrSegment.makeSegments(text);\n                // 1=min, 40=max, mask=7\n                var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, 1, 40, 2, false);\n                // 4=Scale, 1=border\n                qr.drawCanvas(4, 0, canvas);\n            }\n\n            $("#barcode").JsBarcode(\'000000000038000200210071406050047\', {\n              width: 1,\n              height: 25,\n              quite: 0,\n              fontSize: 15,\n              displayValue: true,\n            });\n        </script>\n        <style type="text/css">\n            /*receipt*/\n            html {\n                color: #000;\n                font-size: 13px;\n                font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif;\n            }\n            body{\n                margin:0;\n            }\n            .receipt{\n                width: 270px;\n            }\n\n            table{\n                width: 100%;\n                max-width: 100%;\n\n            }\n\n            table tr:last-child td{\n                border-bottom:1px dashed #444;\n\n            }\n\n            table thead th{\n                padding: 5px;\n                border-top:1px dashed #444;\n                border-bottom:1px dashed #444;\n                text-align: left;\n            }\n\n            table tbody td{\n                padding: 5px;\n                text-align: left;\n            }\n\n            .center{\n                text-align: center;\n            }\n\n            .lottery{\n                font-weight: bold;\n                margin-top: 20px;\n            }\n\n            .barcode img {\n              margin: 10px auto;\n            }\n\n            .barcode p{\n                font-weight: bold;\n                font-size: 12px;\n            }\n\n            på{\n                margin-bottom: 10px;\n                margin-top: 5px;\n            }\n            .text-right{\n                text-align: right;\n            }\n\n            .inventory-info {\n                font-weight: bold;\n            }\n\n            .total {\n                margin-top: 30px;\n            }\n\n            .total label {\n                font-weight: bold;\n            }\n        </style>\n        <script>\n            window.print();\n        </script>\n    </body>\n</html>\n',
        ],
      };

      response = {
        status: 'success',
        data: triggerResponse,
      };
    }

    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
      correlationId: msg.properties.correlationId,
    });

    channel.ack(msg);
  }
};

const initConsumer = async () => {
  // Consumer
  try {
    conn = await amqplib.connect(RABBITMQ_HOST);
    channel = await conn.createChannel();

    // listen for rpc queue =========
    await channel.assertQueue('rpc_queue:erxes-api');
    channel.consume('rpc_queue:erxes-api', async msg => {
      consumerHelperCheckTrigger(msg);
    });

    await channel.assertQueue('rpc_queue:erkhet');
    channel.consume('rpc_queue:erkhet', async msg => {
      consumerHelperCheckTrigger(msg);
    });
  } catch (e) {
    debugBase(e.message);
  }
};

initConsumer();
