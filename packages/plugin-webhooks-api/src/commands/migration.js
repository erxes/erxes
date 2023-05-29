const { generateModels } = require('../connectionResolver.js');

const switchContentType = (contentType) => {
  let changedContentType = contentType;

  switch (contentType) {
    case 'deal':
      changedContentType = `cards:${contentType}`;
      break;
    case 'purchase':
      changedContentType = `cards:${contentType}`;
      break;

    case 'task':
      changedContentType = `cards:${contentType}`;
      break;

    case 'ticket':
      changedContentType = `cards:${contentType}`;
      break;

    case 'userMessages':
      changedContentType = `inbox:${contentType}`;
      break;

    case 'conversation':
      changedContentType = `inbox:${contentType}`;
      break;

    case 'customerMessages':
      changedContentType = `inbox:${contentType}`;
      break;

    case 'popupSubmitted':
      changedContentType = `inbox:${contentType}`;
      break;

    case 'engageMessages':
      changedContentType = `engages:${contentType}`;
      break;

    case 'customer':
      changedContentType = `contacts:${contentType}`;
      break;

    case 'company':
      changedContentType = `contacts:${contentType}`;
      break;

    case 'knowledgeBaseArticle':
      changedContentType = `knowledgebase:${contentType}`;
      break;
  }

  return changedContentType;
};

const command = async () => {
  const models = await generateModels('os');

  const webhooks = await models.Webhooks.find({});

  for (const webhook of webhooks) {
    const actions = webhook.actions || [];
    let fixedActions = [];

    for (const action of actions) {
      const type = switchContentType(action.type);

      fixedActions.push({
        ...action,
        type
      });
    }

    await models.Webhooks.updateOne(
      { _id: webhook._id },
      {
        $set: {
          actions: fixedActions
        }
      }
    );
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
