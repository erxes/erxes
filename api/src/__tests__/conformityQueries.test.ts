import * as sinon from 'sinon';
import {
  companyFactory,
  conformityFactory,
  customerFactory
} from '../db/factories';
import { Conformities } from '../db/models';
import * as elk from '../elasticsearch';

import './setup.ts';

describe('conformitiesQueries', () => {
  let _company;
  let _customer;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory({});
    _customer = await customerFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Conformities.deleteMany({});
  });

  test('elk_syncer true', async () => {
    process.env.ELK_SYNCER = 'true';

    conformityFactory({
      mainType: 'company',
      mainTypeId: _company._id,
      relType: 'customer',
      relTypeId: _customer._id
    });

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        took: 0,
        timed_out: false,
        _shards: {
          total: 1,
          successful: 1,
          skipped: 0,
          failed: 0
        },
        hits: {
          total: {
            value: 1,
            relation: 'eq'
          },
          max_score: 10.735046,
          hits: [
            {
              _index: 'erxes__conformities',
              _type: '_doc',
              _id: '5z43cFaz3Az6ti8Bm',
              _score: 10.735046,
              _source: {
                mainType: 'company',
                mainTypeId: _company._id,
                relType: 'customer',
                relTypeId: _customer._id,
                __v: 0
              }
            }
          ]
        }
      });
    });

    Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relTypes: ['customer']
    });

    Conformities.filterConformity({
      mainType: 'company',
      mainTypeIds: [_company._id],
      relType: 'customer'
    });

    Conformities.getConformities({
      mainType: 'customer',
      mainTypeIds: [_customer._id],
      relTypes: ['company']
    });

    Conformities.relatedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relType: 'customer'
    });

    mock.restore();
  });
});
