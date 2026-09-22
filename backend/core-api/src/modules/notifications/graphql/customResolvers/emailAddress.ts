import { IEmailAddressDocument } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export default {
  lane(root: IEmailAddressDocument, _args: undefined, { models }: IContext) {
    return models.EmailAddresses.laneOf(root);
  },
};
