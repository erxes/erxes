import fetch from 'node-fetch';
import { IContext } from '../../connectionResolvers';
import { sendCommonMessage } from '../../messageBroker';
import { Polarissyncs } from '../../models';

const polarissyncMutations = {
  /**
   * Creates a new polarissync
   */
  async polarisUpdateData(_root, doc, { subdomain }: IContext) {
    const customerId = doc.customerId;

    const customer = await sendCommonMessage({
      serviceName: 'contacts',
      action: 'customers.findOne',
      data: { _id: customerId },
      isRPC: true,
      defaultValue: null,
      subdomain
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const configs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'POLARIS_API_URL'
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!configs) {
      throw new Error('Config not found');
    }

    const body: any = {
      customer_code: '',
      phone_number: '',
      register_number: ''
    };

    if (customer.primaryPhone) {
      body.phone_number = customer.primaryPhone;
    }

    if (customer.code) {
      body.customer_code = customer.code;
    }

    try {
      const url = `${configs.value}/user/info`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors[0]);
      }

      return Polarissyncs.createOrUpdate({
        customerId,
        data: res.data || null
      });
    } catch (e) {
      console.error('error ', e);
      throw new Error(e);
    }
  }
};

export default polarissyncMutations;
