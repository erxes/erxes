import * as moment from 'moment';
import { Segments } from '../../../db/models';
import { ICondition, ISegment, ISegmentDocument } from '../../../db/models/definitions/segments';

export default {
  async segments(segment?: ISegment | null, headSegment?: ISegmentDocument | null): Promise<any> {
    const query: any = { $and: [] };

    if (!segment || !segment.connector || !segment.conditions) {
      return {};
    }

    const childQuery = {
      [segment.connector === 'any' ? '$or' : '$and']: segment.conditions.map(condition => ({
        [condition.field]: convertConditionToQuery(condition),
      })),
    };

    if (segment.conditions.length) {
      query.$and.push(childQuery);
    }

    // Fetching parent segment
    const embeddedParentSegment = await Segments.findOne({ _id: segment.subOf });
    const parentSegment = headSegment || embeddedParentSegment;

    if (parentSegment) {
      const parentQuery = {
        [parentSegment.connector === 'any' ? '$or' : '$and']: parentSegment.conditions.map(condition => ({
          [condition.field]: convertConditionToQuery(condition),
        })),
      };

      if (parentSegment.conditions.length) {
        query.$and.push(parentQuery);
      }
    }

    return query.$and.length ? query : {};
  },
};

function convertConditionToQuery(condition: ICondition) {
  const { operator, type, dateUnit = '', value = '' } = condition;

  let transformedValue;

  switch (type) {
    case 'string':
      transformedValue = value.toLowerCase();
      break;
    case 'number':
    case 'date':
      transformedValue = parseInt(value, 10);
      break;
    default:
      transformedValue = value;
      break;
  }

  switch (operator) {
    case 'e':
    case 'et':
    default:
      return transformedValue;
    case 'dne':
      return { $ne: transformedValue };
    case 'c':
      return {
        $regex: new RegExp(`.*${escapeRegExp(transformedValue)}.*`, 'i'),
      };
    case 'dnc':
      return {
        $regex: new RegExp(`^((?!${escapeRegExp(transformedValue)}).)*$`, 'i'),
      };
    case 'igt':
      return { $gt: transformedValue };
    case 'ilt':
      return { $lt: transformedValue };
    case 'it':
      return true;
    case 'if':
      return false;
    case 'wlt':
      return {
        $gte: moment()
          .subtract(transformedValue, dateUnit)
          .toDate(),
        $lte: new Date(),
      };
    case 'wmt':
      return {
        $lte: moment()
          .subtract(transformedValue, dateUnit)
          .toDate(),
      };
    case 'wow':
      return {
        $lte: moment()
          .add(transformedValue, dateUnit)
          .toDate(),
        $gte: new Date(),
      };
    case 'woa':
      return {
        $gte: moment()
          .add(transformedValue, dateUnit)
          .toDate(),
      };
    case 'is':
      return { $exists: true, $ne: '' };
    case 'ins':
      return { $exists: false };
  }
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
