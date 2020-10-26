import { MessengerApps } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const messengerAppQueries = {
  /*
   * MessengerApps list
   */
  messengerApps(_root, { kind }: { kind: string }, { commonQuerySelector }: IContext) {
    const query: any = commonQuerySelector;

    if (kind) {
      query.kind = kind;
    }

    return MessengerApps.find(query);
  },

  /*
   * MessengerApps count
   */
  messengerAppsCount(_root, { kind }: { kind: string }, { commonQuerySelector }: IContext) {
    const query: any = commonQuerySelector;

    if (kind) {
      query.kind = kind;
    }

    return MessengerApps.find(query).countDocuments();
  },
};

moduleRequireLogin(messengerAppQueries);

export default messengerAppQueries;
