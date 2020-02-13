import * as dotenv from 'dotenv';
import { Segments } from '../db/models';
import { ICondition } from '../db/models/definitions/segments';

dotenv.config();

module.exports.up = async () => {
  const segments = await Segments.find();

  for (const segment of segments) {
    const { conditions = [] } = segment;
    const newConditions: ICondition[] = [];

    for (const condition of conditions) {
      const cond: any = condition;

      newConditions.push({
        ...condition,
        type: 'property',
        propertyName: cond.field,
        propertyOperator: cond.operator,
        propertyValue: cond.value,
      });
    }

    await Segments.updateOne({ _id: segment._id }, { $set: { conditions: newConditions } });
  }
};
