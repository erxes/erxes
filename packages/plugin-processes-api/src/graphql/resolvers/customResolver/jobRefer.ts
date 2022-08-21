import { IJobReferDocument } from '../../../models/definitions/jobs';
import { IContext } from '../../../connectionResolver';
import { JOB_CATEGORY_STATUSES } from '../../../models/definitions/constants';
import { sendProductsMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.JobRefers.findOne({ _id });
  },

  async needProducts(
    jobRefer: IJobReferDocument,
    {},
    { models, subdomain }: IContext
  ) {
    const jobRefers = await models.JobRefers.findOne({
      _id: jobRefer._id,
      status: { $ne: JOB_CATEGORY_STATUSES.ARCHIVED }
    });

    const needProducts = jobRefers?.needProducts || [];

    for await (const need of needProducts) {
      const uom =
        (await sendProductsMessage({
          subdomain,
          action: 'findOneUom',
          data: { _id: need.uomId || '' },
          isRPC: true
        })) || null;

      const product =
        (await sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: { _id: need.productId || '' },
          isRPC: true
        })) || null;

      need.product = product;
      need.uom = uom;
    }

    return needProducts;
  },
  async resultProducts(
    jobRefer: IJobReferDocument,
    {},
    { models, subdomain }: IContext
  ) {
    const jobRefers = await models.JobRefers.findOne({
      _id: jobRefer._id,
      status: { $ne: JOB_CATEGORY_STATUSES.ARCHIVED }
    });

    const resultProducts = jobRefers?.resultProducts || [];

    for await (const result of resultProducts) {
      const uom =
        (await sendProductsMessage({
          subdomain,
          action: 'findOneUom',
          data: { _id: result.uomId || '' },
          isRPC: true
        })) || null;

      const product =
        (await sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: { _id: result.productId || '' },
          isRPC: true
        })) || null;

      result.product = product;
      result.uom = uom;
    }

    return resultProducts;
  }
};
