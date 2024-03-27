import fetch from 'node-fetch';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils';

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

    let rd = putResponse.registerNo;
    if (!rd) {
      throw new Error('not found putResponses register number')
    }

    if (rd.length === 12) {
      rd = rd.slice(-8);
    }

    const { billId, date } = putResponse;

    if (!billId || !date) {
      throw new Error('not found putResponses billId or date')
    }

    const data = {
      returnBillId: billId,
      date: date,
    };

    const resObj = await models.PutResponses.createPutResponse({
      sendInfo: { ...data },
      contentId: putResponse.contentId,
      contentType: putResponse.contentType,
      number: putResponse.number,
      returnBillId: billId,
    });

    const response = await fetch(`${url}/returnBill?lib=${rd}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((r) => r.json());

    if (['true', true].includes(response.success)) {
      await models.PutResponses.updateOne(
        { _id: putResponse._id },
        { $set: { status: 'inactive' } },
      );
    }

    await models.PutResponses.updatePutResponse(resObj._id, {
      ...response,
    });

    return models.PutResponses.findOne({ _id: resObj._id })
      .lean();
  },

};

checkPermission(ebarimtMutations, 'putResponseReturnBill', 'specialReturnBill');

export default ebarimtMutations;
