import * as dotenv from 'dotenv';
import * as faker from 'faker';
import * as fs from 'fs';
import { disconnect } from 'mongoose';
import * as shelljs from 'shelljs';
import * as XlsxStreamReader from 'xlsx-stream-reader';
import { EngagesAPI, HelpersApi, IntegrationsAPI } from '../data/dataSources';

import { MESSAGE_KINDS } from '../data/constants';
import { checkFieldNames } from '../data/modules/fields/utils';
import widgetMutations from '../data/resolvers/mutations/widgets';
import { getEnv } from '../data/utils';
import { connect } from '../db/connection';
import {
  Boards,
  Brands,
  Channels,
  Companies,
  Configs,
  Conformities,
  Conversations,
  Customers,
  Deals,
  EmailTemplates,
  EngageMessages,
  Fields,
  FieldsGroups,
  Forms,
  ImportHistory,
  Integrations,
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics,
  Pipelines,
  PipelineTemplates,
  ProductCategories,
  Products,
  Segments,
  Stages,
  Tags,
  Tasks,
  Tickets,
  Users,
  UsersGroups
} from '../db/models';
import { IPipelineStage } from '../db/models/definitions/boards';
import { METHODS } from '../db/models/definitions/constants';
import {
  LEAD_LOAD_TYPES,
  MESSAGE_TYPES,
  TAG_TYPES
} from '../db/models/definitions/constants';
import { debugWorkers } from '../debuggers';
import { initMemoryStorage, set } from '../inmemoryStorage';
import {
  clearEmptyValues,
  generatePronoun,
  updateDuplicatedValue
} from '../workers/utils';

dotenv.config();

export const icons = [
  { value: 'alarm', label: 'alarm' },
  { value: 'briefcase', label: 'briefcase' },
  { value: 'earthgrid', label: 'earthgrid' },
  { value: 'compass', label: 'compass' },
  { value: 'idea', label: 'idea' },
  { value: 'diamond', label: 'diamond' },
  { value: 'piggybank', label: 'piggybank' },
  { value: 'piechart', label: 'piechart' },
  { value: 'scale', label: 'scale' },
  { value: 'megaphone', label: 'megaphone' },
  { value: 'tools', label: 'tools' },
  { value: 'umbrella', label: 'umbrella' },
  { value: 'bar-chart', label: 'bar-chart' },
  { value: 'star', label: 'star' },
  { value: 'head-1', label: 'head-1' },
  { value: 'settings', label: 'settings' },
  { value: 'users', label: 'users' },
  { value: 'paintpalette', label: 'paintpalette' },
  { value: 'flag', label: 'flag' },
  { value: 'phone-call', label: 'phone-call' },
  { value: 'laptop', label: 'laptop' },
  { value: 'home', label: 'home' },
  { value: 'puzzle', label: 'puzzle' },
  { value: 'medal', label: 'medal' },
  { value: 'like', label: 'like' },
  { value: 'book', label: 'book' },
  { value: 'clipboard', label: 'clipboard' },
  { value: 'computer', label: 'computer' },
  { value: 'paste', label: 'paste' },
  { value: 'folder-1', label: 'folder' }
];

const main = async () => {
  const MONGO_URL = getEnv({ name: 'MONGO_URL' });

  await shelljs.exec(`mongo "${MONGO_URL}" --eval 'db.killOp()'`, {
    silent: true
  });

  const connection = await connect();

  initMemoryStorage();

  const dbName = connection.connection.db.databaseName;

  console.log(`drop and create database: ${dbName}`);

  await connection.connection.dropDatabase();

  const userGroup = await UsersGroups.create({ name: 'admin' });
  const groups = ['support', 'development', 'management'];

  console.log('Creating: UserGroups');

  groups.forEach(async group => {
    await UsersGroups.create({ name: group });
  });

  console.log('Finished: UserGroups');

  const brand = await Brands.create({
    name: faker.random.word(),
    description: faker.lorem.lines()
  });

  const generator = require('generate-password');

  const newPwd = generator.generate({
    length: 10,
    numbers: true,
    lowercase: true,
    uppercase: true,
    strict: true
  });

  const path = require('path');
  const jsonPath = '../../../ui/cypress.json';
  const cypressSettings = require(jsonPath);

  cypressSettings.env.userPassword = newPwd;
  const newJson = JSON.stringify(cypressSettings, null, 2);

  fs.writeFile(path.resolve(__dirname, jsonPath), newJson, err => {
    if (err) {
      return console.log(err);
    }
    console.log(JSON.stringify(cypressSettings, null, 2));
    console.log('writing to ' + jsonPath);
  });

  await FieldsGroups.createSystemGroupsFields();

  const userDoc = {
    createdAt: faker.date.recent(),
    username: faker.internet.userName(),
    password: newPwd,
    isOwner: true,
    email: 'admin@erxes.io',
    getNotificationByEmail: true,
    details: {
      avatar: faker.image.avatar(),
      fullName: faker.name.findName(),
      shortName: faker.name.firstName(),
      position: faker.name.jobTitle(),
      location: faker.address.streetAddress(),
      description: faker.name.title(),
      operatorPhone: faker.phone.phoneNumber()
    },
    links: {
      link: faker.internet.url()
    },
    brandIds: [brand.id],
    groupIds: [userGroup.id],
    isActive: true
  };

  console.log('Creating: Users');

  const admin = await Users.createUser(userDoc);

  for (let i = 0; i < 10; i++) {
    const randomGroup = await UsersGroups.aggregate([{ $sample: { size: 1 } }]);
    const fakeUserDoc = {
      createdAt: faker.date.recent(),
      username: faker.internet.userName(),
      password: newPwd,
      isOwner: false,
      email: faker.internet.email(),
      getNotificationByEmail: true,
      details: {
        avatar: faker.image.avatar(),
        fullName: faker.name.findName(),
        shortName: faker.name.firstName(),
        position: faker.name.jobTitle(),
        location: faker.address.streetAddress(),
        description: faker.name.title(),
        operatorPhone: faker.phone.phoneNumber()
      },
      links: {
        link: faker.internet.url()
      },
      brandIds: [brand.id],
      groupIds: [randomGroup[0].id],
      isActive: true
    };
    await Users.createUser(fakeUserDoc);
  }
  console.log('Finished: Users');

  console.log('Creating: Channels');
  const channel = await Channels.createChannel(
    {
      name: faker.random.word(),
      description: faker.lorem.sentence(),
      memberIds: [admin._id]
    },
    admin._id
  );

  console.log('Finished: Channels');

  console.log('Creating: Messenger Integration');

  const integration = await Integrations.createMessengerIntegration(
    {
      kind: 'messenger',
      languageCode: 'en',
      channelIds: [channel._id],
      name: faker.random.word(),
      brandId: brand._id
    },
    admin._id
  );

  await Channels.updateMany(
    { _id: { $in: [channel._id] } },
    { $push: { integrationIds: integration._id } }
  );

  console.log('Finished: Messenger Integration');

  // popup

  console.log('Creating: Popups');

  const form = await createForms('lead', admin);

  let loadType =
    LEAD_LOAD_TYPES.ALL[Math.floor(Math.random() * LEAD_LOAD_TYPES.ALL.length)];

  if (loadType.length === 0) {
    loadType = LEAD_LOAD_TYPES.DROPDOWN;
  }

  await Tags.createTag({
    name: 'happy',
    type: TAG_TYPES.CUSTOMER,
    colorCode: '#4BBF6B'
  });
  await Tags.createTag({
    name: 'angry',
    type: TAG_TYPES.CUSTOMER,
    colorCode: '#CD5A91'
  });
  await Tags.createTag({
    name: 'other',
    type: TAG_TYPES.CUSTOMER,
    colorCode: '#F7CE53'
  });

  await Tags.createTag({
    name: 'happy',
    type: TAG_TYPES.CONVERSATION,
    colorCode: '#4BBF6B'
  });
  await Tags.createTag({
    name: 'angry',
    type: TAG_TYPES.CONVERSATION,
    colorCode: '#CD5A91'
  });
  await Tags.createTag({
    name: 'other',
    type: TAG_TYPES.CONVERSATION,
    colorCode: '#F7CE53'
  });
  await Tags.createTag({
    name: 'happy',
    type: TAG_TYPES.COMPANY,
    colorCode: '#4BBF6B'
  });
  await Tags.createTag({
    name: 'angry',
    type: TAG_TYPES.COMPANY,
    colorCode: '#CD5A91'
  });

  await Configs.createOrUpdateConfig({
    code: 'UPLOAD_SERVICE_TYPE',
    value: ['local']
  });

  await Integrations.createLeadIntegration(
    {
      languageCode: 'en',
      formId: form._id,
      kind: 'lead',
      brandId: brand._id,
      name: faker.random.word(),
      leadData: {
        loadType,
        successAction: 'redirect',
        redirectUrl: faker.internet.url(),
        thankTitle: faker.random.word(),
        thankContent: faker.lorem.sentence()
      }
    },
    admin._id
  );

  console.log('Finished: Popups');

  // Knowledgebase
  console.log('Creating: KnowledgeBase');

  const kbTopic = await KnowledgeBaseTopics.createDoc(
    {
      brandId: brand._id,
      title: 'Get expert help from Erxes',
      description: faker.lorem.sentence(),
      languageCode: 'en',
      color: faker.internet.color(),
      backgroundImage: faker.image.abstract()
    },
    admin._id
  );

  for (let i = 0; i < 3; i++) {
    const kbCategory = await KnowledgeBaseCategories.createDoc(
      {
        title: faker.random.word(),
        description: faker.lorem.sentence(),
        icon:
          icons[
            faker.random.number({
              min: 0,
              max: 29
            })
          ].value,
        topicIds: [kbTopic._id]
      },
      admin._id
    );

    for (let j = 0; j < 4; j++) {
      await KnowledgeBaseArticles.createDoc(
        {
          title: faker.lorem.sentence(),
          summary: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(),
          reactionChoices: [
            'https://erxes.s3.amazonaws.com/icons/sad.svg',
            'https://erxes.s3.amazonaws.com/icons/neutral.svg',
            'https://erxes.s3.amazonaws.com/icons/grinning.svg',
            'https://erxes.s3.amazonaws.com/icons/like.svg',
            'https://erxes.s3.amazonaws.com/icons/dislike.svg'
          ],
          status: 'publish',
          categoryIds: [kbCategory._id]
        },
        admin._id
      );
    }
  }
  console.log('Finished: Knowledgebase');

  // Contacts

  console.log('Creating: Contacts');

  for (let i = 0; i < 10; i++) {
    await Customers.createVisitor();
  }

  const xlsDatas = [
    { fileName: 'fakeCompanies.xlsx', type: 'company' },
    { fileName: 'fakeCustomers.xlsx', type: 'customer' }
  ];

  for (const data of xlsDatas) {
    const { properties, result, type, importHistoryId } = await readXlsFile(
      data.fileName,
      data.type,
      admin
    );

    await insertToDB({
      user: admin,
      scopeBrandIds: [brand._id],
      result,
      contentType: type,
      properties,
      importHistoryId
    });
  }

  console.log('Finished: Contacts');

  // Sales PipeLine
  console.log('Creating: Sales & Pipelines');

  const productCategory = await ProductCategories.createProductCategory({
    name: 'Vehicles',
    code: 'code001',
    description: faker.lorem.sentence(),
    order: '0'
  });

  for (let i = 0; i < 10; i++) {
    await Products.createProduct({
      name: faker.random.word(),
      categoryId: productCategory._id,
      unitPrice: faker.random.number({ min: 100000, max: 1000000 }),
      type: 'product',
      description: faker.lorem.sentence(),
      sku: faker.random.number(),
      code: faker.random.number()
    });
  }

  const dealStages = await populateStages('deal');
  for (let i = 0; i < 3; i++) {
    const board = await Boards.createBoard({
      name: faker.random.word(),
      type: 'deal',
      userId: admin._id
    });

    for (let j = 0; j < 2; j++) {
      await Pipelines.createPipeline(
        { name: faker.random.word(), type: 'deal', boardId: board._id },
        dealStages
      );
    }
  }

  console.log('Finished: Sales & PipeLines');

  // Conversation

  console.log('Creating: Conversations');

  const context: any = {
    dataSources: {
      IntegrationsAPI: new IntegrationsAPI(),
      EngagesAPI: new EngagesAPI(),
      HelpersApi: new HelpersApi()
    }
  };

  for (let i = 0; i < 5; i++) {
    const randomCustomer = await Customers.aggregate([
      { $sample: { size: 1 } }
    ]);

    if (randomCustomer[0]) {
      set(`customer_last_status_${randomCustomer[0]._id}`, 'left');
      await widgetMutations.widgetsInsertMessage(
        {},
        {
          contentType: MESSAGE_TYPES.TEXT,
          integrationId: integration._id,
          customerId: randomCustomer[0]._id || '',
          message: faker.lorem.sentence()
        },
        context
      );
    }
  }

  console.log('Finished: Conversations');

  // Ticket

  console.log('Creating: Tickets');

  const customerId = await Customers.createVisitor();

  const randomConversation =
    (await Conversations.findOne()) ||
    (await Conversations.createConversation({
      customerId,
      integrationId: integration._id
    }));

  const ticketBoard = await Boards.createBoard({
    name: faker.random.word(),
    type: 'ticket',
    userId: admin._id
  });

  const ticketStages = await populateStages('ticket');

  for (let j = 0; j < 2; j++) {
    await Pipelines.createPipeline(
      { name: faker.random.word(), type: 'ticket', boardId: ticketBoard._id },
      ticketStages
    );
  }

  const selectedTicketStage = await Stages.findOne({ type: 'ticket' });

  await Tickets.createTicket({
    name: faker.random.word(),
    userId: admin._id,
    initialStageId: (selectedTicketStage && selectedTicketStage._id) || '',
    sourceConversationIds: [randomConversation._id || ''],
    stageId: (selectedTicketStage && selectedTicketStage._id) || ''
  });

  console.log('Finished: Tickets');

  // Task

  console.log('Created: Tasks');

  const randomUser = await Users.aggregate([{ $sample: { size: 1 } }]);
  const taskBoard = await Boards.createBoard({
    name: faker.random.word(),
    type: 'task',
    userId: admin._id
  });
  const taskStages = await populateStages('task');

  for (let j = 0; j < 2; j++) {
    await Pipelines.createPipeline(
      { name: faker.random.word(), type: 'task', boardId: taskBoard._id },
      taskStages
    );
  }

  const selectedTaskStage = await Stages.findOne({ type: 'task' });

  await Tasks.createTask({
    name: faker.random.word(),
    userId: admin._id,
    initialStageId: selectedTaskStage?._id,
    assignedUserIds: [randomUser[0]._id || admin._id],
    stageId: selectedTicketStage?._id || ''
  });

  console.log('Finished: Tasks');

  // Segment
  console.log('Creating: Segments');

  const template = await EmailTemplates.create({
    name: faker.random.word(),
    content: `<p>${faker.lorem.sentences()}</p>\n`
  });

  const segment = await Segments.createSegment({
    name: 'Happy customers',
    description: faker.lorem.sentence(),
    contentType: 'customer',
    color: faker.internet.color(),
    subOf: '',
    conditions: []
  });

  const docAutoMessage = {
    kind: MESSAGE_KINDS.VISITOR_AUTO,
    title: 'Visitor auto message',
    fromUserId: randomUser[0]._id,
    segmentIds: [segment._id],
    brandIds: [brand._id],
    tagIds: [],
    isLive: false,
    isDraft: true,
    method: METHODS.EMAIL
  };

  const docAutoEmail = {
    kind: 'auto',
    title: 'Auto email every friday',
    fromUserId: randomUser[0]._id,
    segmentIds: [segment._id],
    brandIds: [brand._id],
    tagIds: [],
    isLive: false,
    isDraft: true,
    email: {
      subject: faker.lorem.sentence(),
      sender: faker.internet.email(),
      replyTo: faker.internet.email(),
      content: faker.lorem.paragraphs(),
      attachments: [],
      templateId: template._id
    },
    scheduleDate: {
      type: '5',
      month: '',
      day: ''
    },
    method: 'email'
  };

  await EngageMessages.createEngageMessage(docAutoMessage);
  await EngageMessages.createEngageMessage(docAutoEmail);

  console.log('Finished: Engages');

  // Growth Hack

  console.log('Creating: Growth Hack');

  const growthForm = await createForms('growthHack', admin);
  const growthBoard = await Boards.createBoard({
    name: faker.random.word(),
    type: 'growthHack',
    userId: admin._id
  });

  const pipelineTemplate = await PipelineTemplates.createPipelineTemplate(
    {
      name: faker.random.word(),
      description: faker.lorem.sentence(),
      type: 'growthHack'
    },
    [
      {
        _id: faker.unique,
        name: faker.random.word(),
        formId: growthForm._id
      }
    ]
  );

  const growthHackDock = {
    name: faker.random.word(),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    visibility: 'public',
    type: 'growthHack',
    boardId: growthBoard._id,
    memberIds: [],
    bgColor: faker.internet.color(),
    templateId: pipelineTemplate._id,
    hackScoringType: 'rice',
    metric: 'monthly-active-users'
  };
  await Pipelines.createPipeline(growthHackDock);

  console.log('Finished: Growth Hack');

  await disconnect();

  console.log('admin email: admin@erxes.io');
  console.log('admin password: ', newPwd);

  process.exit();
};

const createXlsStream = async (
  fileName: string
): Promise<{ fieldNames: string[]; datas: any[] }> => {
  return new Promise(async (resolve, reject) => {
    let rowCount = 0;

    const usedSheets: any[] = [];

    const xlsxReader = XlsxStreamReader();

    try {
      const stream = fs.createReadStream(`./src/initialData/xls/${fileName}`);

      stream.pipe(xlsxReader);

      xlsxReader.on('worksheet', workSheetReader => {
        if (workSheetReader > 1) {
          return workSheetReader.skip();
        }

        workSheetReader.on('row', row => {
          if (rowCount > 100000) {
            return reject(
              new Error('You can only import 100000 rows one at a time')
            );
          }

          if (row.values.length > 0) {
            usedSheets.push(row.values);
            rowCount++;
          }
        });

        workSheetReader.process();
      });

      xlsxReader.on('end', () => {
        const compactedRows: any = [];

        for (const row of usedSheets) {
          if (row.length > 0) {
            row.shift();

            compactedRows.push(row);
          }
        }

        const fieldNames = usedSheets[0];

        // Removing column
        compactedRows.shift();

        return resolve({ fieldNames, datas: compactedRows });
      });

      xlsxReader.on('error', error => {
        return reject(error);
      });
    } catch (e) {
      reject(e);
    }
  });
};

const readXlsFile = async (fileName: string, type: string, user: any) => {
  try {
    let fieldNames: string[] = [];
    let datas: any[] = [];
    let result: any = {};

    result = await createXlsStream(fileName);

    fieldNames = result.fieldNames;
    datas = result.datas;

    if (datas.length === 0) {
      throw new Error('Please import at least one row of data');
    }

    const properties = await checkFieldNames(type, fieldNames);

    const importHistoryId = await ImportHistory.create({
      contentType: type,
      total: datas.length,
      userId: user._id,
      date: Date.now()
    });

    return { properties, result: datas, type, importHistoryId };
  } catch (e) {
    debugWorkers(e.message);
    throw e;
  }
};

const insertToDB = async xlsData => {
  const {
    user,
    scopeBrandIds,
    result,
    contentType,
    properties,
    importHistoryId
  } = xlsData;
  let create: any = null;
  let model: any = null;

  const isBoardItem = (): boolean =>
    contentType === 'deal' ||
    contentType === 'task' ||
    contentType === 'ticket';

  switch (contentType) {
    case 'company':
      create = Companies.createCompany;
      model = Companies;
      break;
    case 'customer':
      create = Customers.createCustomer;
      model = Customers;
      break;
    case 'lead':
      create = Customers.createCustomer;
      model = Customers;
      break;
    case 'product':
      create = Products.createProduct;
      model = Products;
      break;
    case 'deal':
      create = Deals.createDeal;
      break;
    case 'task':
      create = Tasks.createTask;
      break;
    case 'ticket':
      create = Tickets.createTicket;
      break;
    default:
      break;
  }

  for (const fieldValue of result) {
    // Import history result statistics
    const inc: { success: number; failed: number; percentage: number } = {
      success: 0,
      failed: 0,
      percentage: 100
    };

    // Collecting errors
    const errorMsgs: string[] = [];

    const doc: any = {
      scopeBrandIds,
      customFieldsData: []
    };

    let colIndex: number = 0;
    let boardName: string = '';
    let pipelineName: string = '';
    let stageName: string = '';

    // Iterating through detailed properties
    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();

      switch (property.type) {
        case 'customProperty':
          {
            doc.customFieldsData.push({
              field: property.id,
              value: fieldValue[colIndex]
            });
          }
          break;

        case 'customData':
          {
            doc[property.name] = value;
          }
          break;

        case 'ownerEmail':
          {
            const userEmail = value;

            const owner = await Users.findOne({ email: userEmail }).lean();

            doc[property.name] = owner ? owner._id : '';
          }
          break;

        case 'pronoun':
          {
            doc.sex = generatePronoun(value);
          }
          break;

        case 'companiesPrimaryNames':
          {
            doc.companiesPrimaryNames = value.split(',');
          }
          break;

        case 'customersPrimaryEmails':
          doc.customersPrimaryEmails = value.split(',');
          break;

        case 'state':
          doc.state = value;
          break;

        case 'boardName':
          boardName = value;
          break;

        case 'pipelineName':
          pipelineName = value;
          break;

        case 'stageName':
          stageName = value;
          break;

        case 'tag':
          {
            const tagName = value;

            const tag = await Tags.findOne({
              name: new RegExp(`.*${tagName}.*`, 'i')
            }).lean();

            doc[property.name] = tag ? [tag._id] : [];
          }
          break;

        case 'basic':
          {
            doc[property.name] = value;

            if (property.name === 'primaryName' && value) {
              doc.names = [value];
            }

            if (property.name === 'primaryEmail' && value) {
              doc.emails = [value];
            }

            if (property.name === 'primaryPhone' && value) {
              doc.phones = [value];
            }

            if (property.name === 'phones' && value) {
              doc.phones = value.split(',');
            }

            if (property.name === 'emails' && value) {
              doc.emails = value.split(',');
            }

            if (property.name === 'names' && value) {
              doc.names = value.split(',');
            }

            if (property.name === 'isComplete') {
              doc.isComplete = Boolean(value);
            }
          }
          break;
      } // end property.type switch

      colIndex++;
    } // end properties for loop

    if (
      (contentType === 'customer' || contentType === 'lead') &&
      !doc.emailValidationStatus
    ) {
      doc.emailValidationStatus = 'unknown';
    }

    if (
      (contentType === 'customer' || contentType === 'lead') &&
      !doc.phoneValidationStatus
    ) {
      doc.phoneValidationStatus = 'unknown';
    }

    // set board item created user
    if (isBoardItem()) {
      doc.userId = user._id;

      if (boardName && pipelineName && stageName) {
        const board = await Boards.findOne({
          name: boardName,
          type: contentType
        });
        const pipeline = await Pipelines.findOne({
          boardId: board && board._id,
          name: pipelineName
        });
        const stage = await Stages.findOne({
          pipelineId: pipeline && pipeline._id,
          name: stageName
        });

        doc.stageId = stage && stage._id;
      }
    }

    await create(doc, user)
      .then(async cocObj => {
        if (
          doc.companiesPrimaryNames &&
          doc.companiesPrimaryNames.length > 0 &&
          contentType !== 'company'
        ) {
          const companyIds: string[] = [];

          for (const primaryName of doc.companiesPrimaryNames) {
            let company = await Companies.findOne({ primaryName }).lean();

            if (company) {
              companyIds.push(company._id);
            } else {
              company = await Companies.createCompany({ primaryName });
              companyIds.push(company._id);
            }
          }

          for (const _id of companyIds) {
            await Conformities.addConformity({
              mainType: contentType === 'lead' ? 'customer' : contentType,
              mainTypeId: cocObj._id,
              relType: 'company',
              relTypeId: _id
            });
          }
        }

        if (
          doc.customersPrimaryEmails &&
          doc.customersPrimaryEmails.length > 0 &&
          contentType !== 'customer'
        ) {
          const customers = await Customers.find(
            { primaryEmail: { $in: doc.customersPrimaryEmails } },
            { _id: 1 }
          );
          const customerIds = customers.map(customer => customer._id);

          for (const _id of customerIds) {
            await Conformities.addConformity({
              mainType: contentType === 'lead' ? 'customer' : contentType,
              mainTypeId: cocObj._id,
              relType: 'customer',
              relTypeId: _id
            });
          }
        }

        await ImportHistory.updateOne(
          { _id: importHistoryId },
          { $push: { ids: [cocObj._id] } }
        );

        // Increasing success count
        inc.success++;
      })
      .catch(async (e: Error) => {
        const updatedDoc = clearEmptyValues(doc);

        // Increasing failed count and pushing into error message

        switch (e.message) {
          case 'Duplicated email':
            inc.success++;
            await updateDuplicatedValue(model, 'primaryEmail', updatedDoc);
            break;
          case 'Duplicated phone':
            inc.success++;
            await updateDuplicatedValue(model, 'primaryPhone', updatedDoc);
            break;
          case 'Duplicated name':
            inc.success++;
            await updateDuplicatedValue(model, 'primaryName', updatedDoc);
            break;
          default:
            inc.failed++;
            errorMsgs.push(e.message);
            break;
        }
      });

    await ImportHistory.updateOne(
      { _id: importHistoryId },
      { $inc: inc, $push: { errorMsgs } }
    );

    let importHistory = await ImportHistory.findOne({ _id: importHistoryId });

    if (!importHistory) {
      throw new Error('Could not find import history');
    }

    if (importHistory.failed + importHistory.success === importHistory.total) {
      await ImportHistory.updateOne(
        { _id: importHistoryId },
        { $set: { status: 'Done', percentage: 100 } }
      );

      importHistory = await ImportHistory.findOne({ _id: importHistoryId });
    }

    if (!importHistory) {
      throw new Error('Could not find import history');
    }
  }
};

const populateStages = async type => {
  const stages: IPipelineStage[] = [];

  for (let i = 0; i < 5; i++) {
    const stage: IPipelineStage = {
      _id: faker.unique,
      name: faker.random.word(),
      type,
      pipelineId: ''
    };
    stages.push(stage);
  }
  return stages;
};

const createForms = async (type: string, user: any) => {
  const form = await Forms.createForm(
    {
      title: faker.random.word(),
      description: faker.lorem.sentence(),
      buttonText: faker.random.word(),
      type
    },
    user._id
  );

  const validations = ['datetime', 'date', 'email', 'number', 'phone'];

  let order = 0;

  for (const validation of validations) {
    let text = faker.random.word();

    if (validation === 'email') {
      text = 'email';
    } else if (validation === 'phone') {
      text = 'phone number';
    }

    await Fields.createField({
      contentTypeId: form._id,
      contentType: 'form',
      type: 'input',
      validation,
      text,
      description: faker.random.word(),
      order
    });
    order++;
  }

  return form;
};

main();
