import { Shapes } from '../../models';
import { IShapeDocument } from '../../models/definitions/Automations';
import { sendRequest } from '../actions/utils';

export const checkCustomerIsEbarimtCompany = async (shape: IShapeDocument, data: any) => {
  if (!shape.toArrow && !data) {
    return null;
  }

  const objectData = JSON.parse(data.object)[0];
  const doc = objectData.fields;

  if (objectData.model !== 'customers.customer') {
    return null;
  }

  let result = false;
  if (doc.code.length === 7) {
    const response = await sendRequest({ url: shape.config.url, method: 'GET', params: { ttd: doc.code } });

    if (response.found) {
      result = true;
    }
  }

  if (result) {
    return Shapes.getShape(shape.config.true);
  }

  return Shapes.getShape(shape.config.false);
};
