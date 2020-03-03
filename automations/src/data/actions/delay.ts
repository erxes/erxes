import { IShapeDocument } from '../../models/definitions/Automations';

const delay = (shape: IShapeDocument, data: any, result: object) => {
  console.log('-------------', shape, data);

  return result;
};

export default delay;
