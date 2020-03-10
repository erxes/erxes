import { connect, disconnect } from '../connection';
import { Automations, Shapes } from '../models';

connect()
  .then(async () => {
    // add 2 automations
    const automation1Data = {
      name: 'Ебаримт хэвлэх',
      description: 'Deal won болоход Ебаримт хэвлэхэд зориулсан',
      status: 'publish',
    };

    const automation2Data = {
      name: 'sync erkhet - erxes',
      description: 'erkhet болон erxes системүүдийн хооронд бараа харилцагч мэдээлэл солих',
      status: 'publish',
    };

    const auto1 = await Automations.create(automation1Data);
    const auto2 = await Automations.create(automation2Data);

    const diffConfig = [
      { destStageId: 'TXTWcArmdeufDR6JN', userEmail: 'gtsolmon992@gmail.com' }, // gandan1
      { destStageId: 'oc549YKHuvLwgidFi', userEmail: 'Odgerelurgamal@gmail.com' }, // dragon
      { destStageId: 'W85fZkmhSqmMzDTbC', userEmail: 'b.odko097@gmail.com' }, // 32
      { destStageId: 'GnjZsFeY8LuJZE7vX', userEmail: 'munhtsetsegamgalan1@gmail.com' }, // amgalan
      { destStageId: 'XiJj4rCAa4y3PwGW7', userEmail: 'baasanjawotgonbayar74@gmail.com' }, // gandan2
      { destStageId: 'xfswjv4hMwetM52DM', userEmail: 'solongootgonsajhan@gmail.com	' }, // zuragt
      { destStageId: 'o6ySYpemjXKg6eQyS', userEmail: 'zagdbazarj@gmail.com' }, // tsaiz
    ];

    for (const item of diffConfig) {
      const acErkhetPost = await Shapes.create({
        automationId: auto1._id,
        type: 'action',
        kind: 'erkhetPostData',
        toArrow: [],
        config: {
          url: 'https://erkhet.biz/pos-api/call-put-data/',
          apiKey: '0.8431401582170264',
          apiSecret: '0.7485473226321913',
          apiToken: 'erxes',
          userEmail: item.userEmail,
          hasVat: true,
          hasCitytax: false,
          checkCompanyUrl: 'http://43.231.113.245:4030/',
        },
      });

      await Shapes.create({
        automationId: auto1._id,
        type: 'trigger',
        kind: 'changeDeal',
        async: true,
        position: {},
        size: {},
        toArrow: [acErkhetPost._id],
        config: {
          destinationStageId: item.destStageId,
        },
      });
    }

    const acCustomerToErkhet = await Shapes.create({
      automationId: auto2._id,
      type: 'action',
      kind: 'customerToErkhet',
      async: false,
      position: {},
      size: {},
      toArrow: [],
      config: {
        categoryCode: '2',
        defaultName: 'from erxes',
        apiKey: '0.8431401582170264',
        apiSecret: '0.7485473226321913',
        apiToken: 'erxes',
      },
    });

    await Shapes.create({
      automationId: auto2._id,
      type: 'trigger',
      kind: 'changeListCustomer',
      async: false,
      position: {},
      size: {},
      toArrow: [acCustomerToErkhet._id],
      config: {},
    });

    const customerToErkhet = await Shapes.create({
      automationId: auto2._id,
      type: 'action',
      kind: 'customerToErkhet',
      async: false,
      position: {},
      size: {},
      toArrow: [],
      config: {
        categoryCode: '7',
        defaultName: 'from erxes company',
        apiKey: '0.8431401582170264',
        apiSecret: '0.7485473226321913',
        apiToken: 'erxes',
      },
    });

    const sendNotif = await Shapes.create({
      iddi: 'send0notification2erxes0',
      automationId: auto2._id,
      type: 'action',
      kind: 'sendNotification',
      async: false,
      position: {},
      size: {},
      toArrow: [customerToErkhet._id],
      config: {
        title: 'wrong company code',
        content: 'Байгууллагын код буруу бөглөсөн байна.',
        notifType: 'companyMention',
        link: '/contacts/companies/details/',
        action: 'update',
        contentType: 'company',
      },
    });

    const conCompanyValidEb = await Shapes.create({
      automationId: auto2._id,
      type: 'condition',
      kind: 'checkCompanyValidEbarimt',
      async: false,
      position: {},
      size: {},
      toArrow: [customerToErkhet._id, sendNotif._id],
      config: {
        url: 'http://43.231.113.245:4030/',
        true: customerToErkhet._id,
        false: sendNotif._id,
      },
    });

    await Shapes.create({
      automationId: auto2._id,
      type: 'trigger',
      kind: 'changeListCompany',
      async: false,
      position: {},
      size: {},
      toArrow: [conCompanyValidEb._id],
      config: {},
    });

    const acProductToErkhet = await Shapes.create({
      automationId: auto2._id,
      type: 'action',
      kind: 'productToErkhet',
      async: false,
      position: {},
      size: {},
      toArrow: [],
      config: {
        costAccount: '610101',
        saleAccount: '510101',
        categoryCode: '1',
        apiKey: '0.8431401582170264',
        apiSecret: '0.7485473226321913',
        apiToken: 'erxes',
      },
    });

    await Shapes.create({
      automationId: auto2._id,
      type: 'trigger',
      kind: 'changeListProduct',
      async: false,
      position: {},
      size: {},
      toArrow: [acProductToErkhet._id],
      config: {},
    });

    const inventoryToErxes = await Shapes.create({
      automationId: auto2._id,
      type: 'action',
      kind: 'inventoryToErxes',
      async: false,
      position: {},
      size: {},
      toArrow: [],
      config: {
        categoryCode: '1',
      },
    });

    await Shapes.create({
      automationId: auto2._id,
      type: 'trigger',
      kind: 'changeListInventory',
      async: false,
      position: {},
      size: {},
      toArrow: [inventoryToErxes._id],
      config: {},
    });

    const customerToErxes = await Shapes.create({
      automationId: auto2._id,
      type: 'action',
      kind: 'customerToErxes',
      async: false,
      position: {},
      size: {},
      toArrow: [],
      config: {
        categoryCode: '1',
      },
    });

    const companyToErxes = await Shapes.create({
      automationId: auto2._id,
      type: 'action',
      kind: 'companyToErxes',
      async: false,
      position: {},
      size: {},
      toArrow: [],
      config: {
        categoryCode: '1',
      },
    });

    const checkCustomerIsEbarimtCompany = await Shapes.create({
      automationId: auto2._id,
      type: 'condition',
      kind: 'checkCustomerIsEbarimtCompany',
      async: false,
      position: {},
      size: {},
      toArrow: [companyToErxes._id, customerToErxes._id],
      config: {
        url: 'http://43.231.113.245:4030/',
        true: companyToErxes._id,
        false: customerToErxes._id,
      },
    });

    await Shapes.create({
      automationId: auto2._id,
      type: 'trigger',
      kind: 'changeListCustomerErkhet',
      async: false,
      position: {},
      size: {},
      toArrow: [checkCustomerIsEbarimtCompany._id],
      config: {},
    });

    const workerToErxes = await Shapes.create({
      automationId: auto2._id,
      type: 'action',
      kind: 'workerToErxes',
      async: false,
      position: {},
      size: {},
      toArrow: [],
      config: {
        pass: 'PR1u$',
      },
    });

    await Shapes.create({
      automationId: auto2._id,
      type: 'trigger',
      kind: 'changeListWorker',
      async: false,
      position: {},
      size: {},
      toArrow: [workerToErxes._id],
      config: {},
    });

    await Shapes.updateMany({ config: { $exists: false } }, { $set: { config: {} } });
  })

  .then(() => {
    return disconnect();
  })

  .then(() => {
    process.exit();
  });
