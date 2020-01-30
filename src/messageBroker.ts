import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import * as uuid from 'uuid';
import { receiveIntegrationsNotification, receiveRpcMessage } from './data/modules/integrations/receiveMessage';
import { Customers, RobotEntries } from './db/models';
import { PRODUCT_TYPES } from './db/models/definitions/constants';
import { ProductCategories, Products } from './db/models/Products';
import { debugBase } from './debuggers';
import { graphqlPubsub } from './pubsub';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let connection;
let channel;

export const sendRPCMessage = async (message): Promise<any> => {
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
            } else {
              reject(res.errorMessage);
            }

            channel.deleteQueue(q.queue);
          }
        },
        { noAck: true },
      );

      channel.sendToQueue('rpc_queue:erxes-api', Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: q.queue,
      });
    });
  });

  return response;
};

export const sendMessage = async (queueName: string, data?: any) => {
  if (NODE_ENV === 'test') {
    return;
  }

  await channel.assertQueue(queueName);
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
};

const initConsumer = async () => {
  // Consumer
  try {
    connection = await amqplib.connect(RABBITMQ_HOST);
    channel = await connection.createChannel();

    // listen for rpc queue =========
    await channel.assertQueue('rpc_queue:erxes-integrations');

    channel.consume('rpc_queue:erxes-integrations', async msg => {
      if (msg !== null) {
        debugBase(`Received rpc queue message ${msg.content.toString()}`);

        const response = await receiveRpcMessage(JSON.parse(msg.content.toString()));

        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId: msg.properties.correlationId,
        });

        channel.ack(msg);
      }
    });

    // graphql subscriptions call =========
    await channel.assertQueue('callPublish');

    channel.consume('callPublish', async msg => {
      if (msg !== null) {
        const params = JSON.parse(msg.content.toString());

        graphqlPubsub.publish(params.name, params.data);

        channel.ack(msg);
      }
    });

    // listen for integrations api =========
    await channel.assertQueue('integrationsNotification');

    channel.consume('integrationsNotification', async msg => {
      if (msg !== null) {
        await receiveIntegrationsNotification(JSON.parse(msg.content.toString()));
        channel.ack(msg);
      }
    });

    // listen for engage api ===========
    await channel.assertQueue('engages-api:set-donot-disturb');

    channel.consume('engages-api:set-donot-disturb', async msg => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        await Customers.updateOne({ _id: data.customerId }, { $set: { doNotDisturb: 'Yes' } });

        channel.ack(msg);
      }
    });

    // listen for spark notification  =========
    await channel.assertQueue('sparkNotification');

    channel.consume('sparkNotification', async msg => {
      if (msg !== null) {
        debugBase(`Received spark notification ${msg.content.toString()}`);

        const data = JSON.parse(msg.content.toString());

        delete data.subdomain;

        RobotEntries.createEntry(data)
          .then(() => debugBase('success'))
          .catch(e => debugBase(e.message));

        channel.ack(msg);
      }
    });

    await channel.assertQueue('automation-api');
    channel.consume('automation-api', async msg => {
      if (msg !== null) {
        debugBase(`Received automation ${msg.content.toString()}`);

        const data = JSON.parse(msg.content.toString());
        console.log(data);
        channel.ack(msg);
      }
    });

    await channel.assertQueue('hook-queue:erxes');
    channel.consume('hook-queue:erxes', async msg => {
      if (msg !== null) {
        debugBase(`Received hook ${msg.content.toString()}`);

        const data = JSON.parse(msg.content.toString());
        const doc = JSON.parse(data.object)[0].fields;
        const kind = JSON.parse(data.object)[0].model;

        switch (kind) {
          case 'inventories.inventory':
            if ((data.action === 'update' && data.old_code) || data.action === 'create') {
              const product = await Products.findOne({ code: data.old_code });
              const productCategory = await ProductCategories.findOne({ code: doc.category_code });

              const document = {
                name: doc.name,
                type: doc.is_service ? PRODUCT_TYPES.SERVICE : PRODUCT_TYPES.PRODUCT,
                unitPrice: doc.unit_price,
                code: doc.code,
                productId: doc.id,
                sku: doc.measure_unit_code,
              };

              if (product) {
                await Products.updateProduct(product._id, {
                  ...document,
                  categoryId: productCategory ? productCategory._id : product.categoryId,
                  categoryCode: productCategory ? productCategory.code : product.categoryCode,
                });
              } else {
                await Products.createProduct({
                  ...document,
                  categoryId: productCategory ? productCategory._id : undefined,
                  categoryCode: productCategory ? productCategory.code : undefined,
                });
              }
            } else if (data.action === 'delete') {
              const product = await Products.getProduct({ code: doc.code });
              await Products.removeProducts([product._id]);
            }

            break;
          case 'inventories.category':
            if ((data.action === 'update' && data.old_code) || data.action === 'create') {
              const productCategory = await ProductCategories.findOne({ code: data.old_code });
              const parentCategory = await ProductCategories.findOne({ code: doc.parent_code });

              const document = {
                code: doc.code,
                name: doc.name,
                order: doc.order,
              };

              if (productCategory) {
                await ProductCategories.updateProductCategory(productCategory._id, {
                  ...document,
                  parentId: parentCategory ? parentCategory._id : productCategory.parentId,
                });
              } else {
                await ProductCategories.createProductCategory({
                  ...document,
                  parentId: parentCategory ? parentCategory._id : undefined,
                });
              }
            } else if (data.action === 'delete') {
              const productCategory = await ProductCategories.getProductCatogery({ code: doc.code });
              await ProductCategories.removeProductCategory(productCategory._id);
            }
            break;
        }

        channel.ack(msg);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};

initConsumer();
