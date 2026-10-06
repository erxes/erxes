import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/modules/posclient/@types/types';
import { assertPosUser } from '~/modules/posclient/utils/assertPosUser';
import {
  buildCustomerDoc,
  canCreateCustomer,
  findDuplicateCustomer,
  IPosCustomerInput,
} from '~/modules/posclient/utils/customerCreate';

const toPosCustomer = (customer) => ({
  _id: customer._id,
  code: customer.code,
  primaryPhone: customer.primaryPhone,
  primaryEmail: customer.primaryEmail,
  firstName: customer.firstName,
  lastName: customer.lastName,
});

const bridgesMutations = {
  async poscCustomersAdd(
    _root,
    { doc: input }: { doc: IPosCustomerInput },
    { subdomain, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    if (!canCreateCustomer(config, posUser)) {
      throw new Error('You are not allowed to add customers on this POS');
    }

    const settings = config.customerCreateConfig;
    const doc = buildCustomerDoc(settings?.layout || [], input || {});

    const duplicate = await findDuplicateCustomer(subdomain, doc);

    if (duplicate) {
      return { duplicate: toPosCustomer(duplicate) };
    }

    const customer = await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'customers',
      action: 'createCustomer',
      input: {
        doc: {
          ...doc,
          state: 'customer',
          // schemaWrapper's shared provenance shape; core stays unaware of POS.
          createdVia: {
            source: 'pos',
            sourceId: config.posId,
            sourceName: config.name,
            actorId: posUser._id,
          },
          ...(settings?.assignCashierAsOwner ? { ownerId: posUser._id } : {}),
        },
      },
    });

    return { customer: toPosCustomer(customer) };
  },
};

markResolvers<IContext>(bridgesMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});

export default bridgesMutations;
