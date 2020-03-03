import { Shapes } from '../../models';
import { IShapeDocument } from '../../models/definitions/Automations';

export const checkDealField = (shape: IShapeDocument, data: any) => {
  if (shape.toArrow && data) {
    return Shapes.getShape(shape.toArrow[0]);
  }

  return null;
};
