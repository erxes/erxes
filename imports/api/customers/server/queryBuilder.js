import moment from 'moment';


export default {
  segments(segment) {
    const query = {};
    const anyOfConditions = segment.connector === 'any';

    if (anyOfConditions && segment.conditions.length) {
      query.$or = [];
    }

    segment.conditions.forEach(({ field, operator, type, dateUnit, value }) => {
      let op;
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
          op = transformedValue;
          break;
        case 'dne':
          op = { $ne: transformedValue };
          break;
        case 'c':
          op = { $regex: `.*${transformedValue}.*` };
          break;
        case 'dnc':
          op = { $not: `.*${transformedValue}.*` };
          break;
        case 'igt':
          op = { $gt: transformedValue };
          break;
        case 'ilt':
          op = { $lt: transformedValue };
          break;
        case 'it':
          op = true;
          break;
        case 'if':
          op = false;
          break;
        case 'wlt':
          op = {
            $gte: moment().subtract(transformedValue, dateUnit).toDate(),
            $lte: new Date(),
          };
          break;
        case 'wmt':
          op = {
            $lte: moment().subtract(transformedValue, dateUnit).toDate(),
          };
          break;
        case 'wow':
          op = {
            $lte: moment().add(transformedValue, dateUnit).toDate(),
            $gte: new Date(),
          };
          break;
        case 'woa':
          op = {
            $gte: moment().add(transformedValue, dateUnit).toDate(),
          };
          break;
        case 'is':
          op = { $exists: true };
          break;
        case 'ins':
          op = { $exists: false };
          break;
      }

      if (anyOfConditions) {
        query.$or.push({ [field]: op });
      } else {
        query[field] = op;
      }
    });

    return query;
  },
};
