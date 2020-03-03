import { Shapes } from '../models';
import { IShapeDocument } from '../models/definitions/Automations';
import { ACTION_KIND, CONDITION_KIND, QUEUE_STATUS } from '../models/definitions/constants';
import { Queues } from '../models/Queue';
import {
  companyToErxes,
  customerToErkhet,
  customerToErxes,
  delay,
  erkhetPostData,
  inventoryToErxes,
  productToErkhet,
  sendNotification,
  workerToErxes,
} from './actions';
import { checkCompanyValidEbarimt } from './conditions/checkCompanyValidEbarimt';
import { checkCustomerIsEbarimtCompany } from './conditions/checkCustomerIsEbarimtCompany';

const actionRun = async (shape: IShapeDocument, data: any, parentId: string, result: object) => {
  switch (shape.kind) {
    case ACTION_KIND.DELAY:
      result = delay(shape, data, result);
      break;

    case ACTION_KIND.ERKHET_POST_DATA:
      result = await erkhetPostData(shape, data, result);
      break;

    case ACTION_KIND.PRODUCT_TO_ERKHET:
      await productToErkhet(shape, data, result);
      break;

    case ACTION_KIND.INVENTORY_TO_ERXES:
      await inventoryToErxes(shape, data, result);
      break;

    case ACTION_KIND.COMPANY_TO_ERXES:
      await companyToErxes(shape, data, result);
      break;

    case ACTION_KIND.CUSTOMER_TO_ERXES:
      await customerToErxes(shape, data, result);
      break;

    case ACTION_KIND.CUSTOMER_TO_ERKHET:
      await customerToErkhet(shape, data, result);
      break;

    case ACTION_KIND.SEND_NOTIFICATION:
      await sendNotification(shape, data, result);
      break;

    case ACTION_KIND.WORKER_TO_ERXES:
      await workerToErxes(shape, data, result);
      break;
  }

  if (!shape.toArrow) {
    await Queues.createQueue({ shapeId: shape._id, postData: data, status: QUEUE_STATUS.COMPLETE, parentId });
    return result;
  }

  for (const nextShapeId of shape.toArrow) {
    const nextShape = await Shapes.getShape(nextShapeId);

    await sequencing(nextShape, data, parentId, result);
  }

  return result;
};

const conditionRun = async (shape: IShapeDocument, data: any, parentId: string, result: object) => {
  let conditionShape: IShapeDocument = null;
  switch (shape.kind) {
    case CONDITION_KIND.CHECK_CUSTOMER_IS_EBARIMT_COMPANY:
      conditionShape = await checkCustomerIsEbarimtCompany(shape, data);
      break;

    case CONDITION_KIND.CHECK_COMPANY_VALID_EBARIMT:
      conditionShape = await checkCompanyValidEbarimt(shape, data);
      break;

    default:
      conditionShape = null;
  }

  if (conditionShape) {
    sequencing(conditionShape, data, parentId, result);
  }
};

const sequencing = async (shape: IShapeDocument, data: any, parentId: string, result: object) => {
  await Queues.createQueue({ shapeId: shape._id, postData: data, status: QUEUE_STATUS.WORKING, parentId });

  if (shape.type === 'action') {
    result = await actionRun(shape, data, parentId, result);
  }

  if (shape.type === 'condition') {
    await conditionRun(shape, data, parentId, result);
  }

  return result;
};

export const asyncAutomationRunner = async (trigger: IShapeDocument, data: any) => {
  let result = {};

  const queue = await Queues.createQueue({ shapeId: trigger._id, postData: data, status: QUEUE_STATUS.WORKING });

  for (const nextShapeId of trigger.toArrow) {
    const nextShape = await Shapes.getShape(nextShapeId);
    result = await sequencing(nextShape, data, queue._id, result);
  }
  return result;
};

export const bgAutomationRunner = async (trigger, data: any) => {
  const queue = await Queues.createQueue({ shapeId: trigger._id, postData: data, status: QUEUE_STATUS.WORKING });

  for (const nextShapeId of trigger.toArrow) {
    const nextShape = await Shapes.getShape(nextShapeId);
    sequencing(nextShape, data, queue._id, {});
  }
};
