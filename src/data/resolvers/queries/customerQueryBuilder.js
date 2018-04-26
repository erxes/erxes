import _ from 'underscore';
import { Integrations, Segments, Forms, Conversations } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder';
import { fixDate } from './insightUtils';

export const buildQuery = async params => {
  // exclude empty customers =========
  // for engage purpose we are creating this kind of customer
  const emptySelector = { $in: [null, ''] };

  let selector = {
    $nor: [
      {
        firstName: emptySelector,
        lastName: emptySelector,
        email: emptySelector,
        visitorContactInfo: null,
      },
    ],
  };

  // Filter by segments
  if (params.segment) {
    const segment = await Segments.findOne({ _id: params.segment });
    const query = QueryBuilder.segments(segment);
    Object.assign(selector, query);
  }

  // filter by brand
  if (params.brand) {
    const integrations = await Integrations.find({ brandId: params.brand });
    selector.integrationId = { $in: integrations.map(i => i._id) };
  }

  // filter by integration
  if (params.integration) {
    const integrations = await Integrations.find({
      kind: params.integration,
    });
    /**
     * Since both of brand and integration filters use a same integrationId field
     * we need to intersect two arrays of integration ids.
     */
    const ids = integrations.map(i => i._id);
    const intersectionedIds = selector.integrationId
      ? _.intersection(ids, selector.integrationId.$in)
      : ids;

    selector.integrationId = { $in: intersectionedIds };
  }

  // Filter by tag
  if (params.tag) {
    selector.tagIds = params.tag;
  }

  // search =========
  if (params.searchValue) {
    const fields = [
      { firstName: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { lastName: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { email: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { phone: new RegExp(`.*${params.searchValue}.*`, 'i') },
    ];

    selector = { $or: fields };
  }

  // filter directly using ids
  if (params.ids) {
    selector = { _id: { $in: params.ids } };
  }

  // filter customers by submitted form
  if (params.form) {
    const formObj = await Forms.findOne({ _id: params.form });

    selector = { _id: { $in: formObj.submittedCustomerIds || [] } };

    if (params.startDate && params.endDate) {
      const customerIds = [];

      const integrationObj = await Integrations.findOne({
        formId: formObj._id,
      });

      const conversations = await Conversations.find({
        integrationId: integrationObj._id,
        createdAt: {
          $gte: fixDate(params.startDate),
          $lte: fixDate(params.endDate),
        },
      });

      for (let conversation of conversations) {
        customerIds.push(conversation.customerId);
      }

      selector = { _id: { $in: customerIds } };
    }
  }

  return selector;
};
