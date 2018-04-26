import _ from 'underscore';
import moment from 'moment';
import { Integrations, Segments, Forms } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder';

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

  let ids = [];

  // filter directly using ids
  if (params.ids) {
    ids = [...params.ids];
  }

  // filter customers by submitted form
  if (params.form) {
    const formObj = await Forms.findOne({ _id: params.form });

    for (let submission of formObj.submissions) {
      const { customerId, submittedAt } = submission;

      // Collecting customerIds inbetween dates only
      if (params.startDate && params.endDate) {
        if (moment(submittedAt).isBetween(moment(params.startDate), moment(params.endDate))) {
          if (!ids.includes(customerId)) {
            ids.push(customerId);
          }
        }

        // If date is not specified collecting all customers
      } else {
        ids.push(customerId);
      }
    }
  }

  if (params.ids || params.form) {
    selector._id = { $in: ids };
  }

  return selector;
};
