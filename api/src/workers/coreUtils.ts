import { Tags, Users } from '../db/models';
import { generatePronoun } from './utils';

export const prepareCoreDocs = async (
  result,
  properties,
  contentType,
  scopeBrandIds,
  bulkDoc
) => {
  for (const fieldValue of result) {
    const doc: any = {
      scopeBrandIds,
      customFieldsData: []
    };

    let colIndex: number = 0;

    // Iterating through detailed properties
    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();

      if (contentType === 'customer') {
        doc.state = 'customer';
      }
      if (contentType === 'lead') {
        doc.state = 'lead';
      }

      switch (property.type) {
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

        case 'tag':
          {
            const tagName = value;

            let tag = await Tags.findOne({
              name: new RegExp(`.*${tagName}.*`, 'i')
            }).lean();

            if (!tag) {
              const tagType = contentType === 'lead' ? 'customer' : contentType;

              tag = await Tags.createTag({ name: tagName, type: tagType });
            }

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
      }

      colIndex++;
    }

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

    bulkDoc.push(doc);
  }

  return bulkDoc;
};
