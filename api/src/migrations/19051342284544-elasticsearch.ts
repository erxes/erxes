import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Segments } from '../db/models';
import { ICondition } from '../db/models/definitions/segments';

dotenv.config();

module.exports.up = async () => {
  await connect();

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
        propertyValue: cond.value
      });
    }

    try {
      await Segments.updateOne(
        { _id: segment._id },
        { $set: { conditions: newConditions } }
      );
    } catch (e) {
      console.log(e.message);
    }
  }
};
