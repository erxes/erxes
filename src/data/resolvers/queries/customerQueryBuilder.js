import _ from 'underscore';
import moment from 'moment';
import { Integrations, Segments, Forms } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder';

export default class Builder {
  constructor(params, user = null) {
    this.params = params;
    this.user = user;
  }

  defaultFilters() {
    const emptySelector = { $in: [null, ''] };

    return {
      $nor: [
        {
          firstName: emptySelector,
          lastName: emptySelector,
          email: emptySelector,
          visitorContactInfo: null,
        },
      ],
    };
  }

  // filter by segment
  async segmentFilter(segmentId) {
    const segment = await Segments.findOne({ _id: segmentId });
    const query = QueryBuilder.segments(segment);

    return query;
  }

  // filter by brand
  async brandFilter(brandId) {
    const integrations = await Integrations.find({ brandId });

    return { integrationId: { $in: integrations.map(i => i._id) } };
  }

  // filter by integration kind
  async integrationTypeFilter(kind) {
    const integrations = await Integrations.find({ kind });

    return { integrationId: { $in: integrations.map(i => i._id) } };
  }

  // filter by integration
  async integrationFilter(integration) {
    const integrations = await Integrations.find({
      kind: integration,
    });
    /**
     * Since both of brand and integration filters use a same integrationId field
     * we need to intersect two arrays of integration ids.
     */
    const ids = integrations.map(i => i._id);

    const intersectionedIds = this.queries.integrationId
      ? _.intersection(ids, this.queries.integrationId.$in)
      : ids;

    return { integrationId: { $in: intersectionedIds } };
  }

  // filter by tag
  async tagFilter(tag) {
    return { tagIds: [tag] };
  }

  // filter by search value
  async searchFilter(value) {
    const fields = [
      { firstName: new RegExp(`.*${value}.*`, 'i') },
      { lastName: new RegExp(`.*${value}.*`, 'i') },
      { email: new RegExp(`.*${value}.*`, 'i') },
      { phone: new RegExp(`.*${value}.*`, 'i') },
    ];

    return { $or: fields };
  }

  // filter by id
  async idsFilter(ids) {
    return { _id: { $in: ids } };
  }

  // filter by form
  async formFilter(formId, startDate, endDate) {
    const formObj = await Forms.findOne({ _id: formId });
    const { submissions = [] } = formObj;
    const ids = [];

    for (let submission of submissions) {
      const { customerId, submittedAt } = submission;

      // Collecting customerIds inbetween dates only
      if (startDate && endDate && !ids.includes(customerId)) {
        if (moment(submittedAt).isBetween(startDate, endDate)) {
          ids.push(customerId);
        }

        // If date is not specified collecting all customers
      } else {
        ids.push(customerId);
      }
    }

    return { _id: { $in: ids } };
  }
  /*
   * prepare all queries. do not do any action
   */
  async buildAllQueries() {
    this.queries = {
      default: this.defaultFilters(),
      segment: {},
      tag: {},
      ids: {},
      searchValue: {},
      brand: {},
      integration: {},
      form: {},
      integrationType: {},
    };

    // filter by segment
    if (this.params.segment) {
      this.queries.segment = await this.segmentFilter(this.params.segment);
    }

    // filter by tag
    if (this.params.tag) {
      this.queries.tag = await this.tagFilter(this.params.tag);
    }

    // filter by ids
    if (this.params.ids) {
      this.queries.ids = await this.idsFilter(this.params.ids);
    }

    // filter by searchValue
    if (this.params.segment) {
      this.queries.segment = await this.segmentFilter(this.params.segment);
    }

    // filter by brand
    if (this.params.brand) {
      this.queries.brand = await this.brandFilter(this.params.brand);
    }

    // filter by integration kind
    if (this.params.integrationType) {
      this.queries.integrationType = await this.integrationTypeFilter(this.params.integrationType);
    }

    // filter by form
    if (this.params.form) {
      this.queries.form = await this.formFilter(this.params.form);

      if (this.params.startDate && this.params.endDate) {
        this.queries.form = await this.formFilter(
          this.params.form,
          this.params.startDate,
          this.params.endDate,
        );
      }
    }

    // filter by integration
    if (this.params.integration) {
      this.queries.integration = await this.integrationFilter(this.params.integration);
    }

    // filter by search value
    if (this.params.searchValue) {
      this.queries.searchValue = await this.searchFilter(this.params.searchValue);
    }
  }

  mainQuery() {
    return {
      ...this.queries.default,
      ...this.queries.segment,
      ...this.queries.tag,
      ...this.queries.ids,
      ...this.queries.segment,
      ...this.queries.brand,
      ...this.queries.integrationType,
      ...this.queries.form,
      ...this.queries.integration,
      ...this.queries.searchValue,
    };
  }
}
