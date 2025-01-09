import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { getConfig, returnResponse } from '../../../utils';

const ebarimtMutations = {
  async putResponseReturnBill(_root, args, { models, subdomain }: IContext) {
    const { _id } = args;

    const putResponse = await models.PutResponses.findOne({
      _id
    }).lean();

    if (!putResponse) {
      throw new Error('not found putResponse')
    }
    const config: any = await getConfig(subdomain, 'EBARIMT', {})
    const url = config.ebarimtUrl || '';

    const { id, date } = putResponse;

    if (!id || !date) {
      throw new Error('not found putResponses id or date')
    }

    const data = {
      id,
      date,
    };

    const resObj = await models.PutResponses.createPutResponse({
      sendInfo: { ...data },
      contentId: putResponse.contentId,
      contentType: putResponse.contentType,
      number: putResponse.number,
      inactiveId: id,
      type: putResponse.type
    });

    const delResponse = await returnResponse(url, data)

    if (delResponse.status === 200) {
      await models.PutResponses.updateOne(
        { _id: putResponse._id },
        { $set: { state: 'inactive' } },
      );
      await models.PutResponses.updateOne({ _id: resObj._id }, { $set: { status: 'SUCCESS', modifiedAt: new Date() } })
    } else {
      await models.PutResponses.updateOne({ _id: resObj._id }, { $set: { message: delResponse.message, date: delResponse.date, status: 'ERROR', modifiedAt: new Date() } })
    };

    return models.PutResponses.findOne({ _id: resObj._id })
      .lean();
  },

  async putResponseReReturn(_root, args, { models, subdomain }: IContext) {
    const { _id } = args;

    const putResponse = await models.PutResponses.findOne({ _id }).lean();
    if (!putResponse) {
      throw new Error('not found put response')
    }
    if (putResponse.id || !putResponse.inactiveId) {
      throw new Error('this response is not return bill')
    }

    const config = await getConfig(subdomain, 'EBARIMT', {});

    const url = config.ebarimtUrl || '';
    if (!url) {
      throw new Error('not found config')
    }

    const resObj = await models.PutResponses.createPutResponse({
      sendInfo: putResponse.sendInfo,
      contentId: putResponse.contentId,
      contentType: putResponse.contentType,
      number: putResponse.number,
      inactiveId: putResponse.inactiveId,
    });

    const delResponse = await returnResponse(url, putResponse.sendInfo)

    if (delResponse.status === 200) {
      await models.PutResponses.updateOne(
        { _id: putResponse._id },
        { $set: { state: 'inactive' } },
      );
      await models.PutResponses.updateOne(
        { id: putResponse.inactiveId },
        { $set: { state: 'inactive' } },
      );
      await models.PutResponses.updateOne({ _id: resObj._id }, { $set: { status: 'SUCCESS', modifiedAt: new Date() } })
    } else {
      await models.PutResponses.updateOne({ _id: resObj._id }, { $set: { message: delResponse.message, date: delResponse.date, status: 'ERROR', modifiedAt: new Date() } })
    };

    return await models.PutResponses.find({ _id: resObj._id })
      .lean();
  }
};

checkPermission(ebarimtMutations, 'putResponseReturnBill', 'specialReturnBill');
checkPermission(ebarimtMutations, 'putResponseReReturn', 'reReturnBill');

export default ebarimtMutations;
