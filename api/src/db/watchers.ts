import { getEnv } from '../data/utils';
import { fetchElk } from '../elasticsearch';
import { Companies, Customers } from './models';

const sendElkRequest = (data, index: string) => {
  const { operationType, documentKey } = data;

  switch (operationType) {
    case 'update': {
      const body = {
        doc: data.updateDescription.updatedFields || {}
      };

      return fetchElk({ action: 'update', index, body, _id: documentKey._id });
    }

    case 'insert': {
      const body = data.fullDocument || {};

      delete body._id;

      return fetchElk({ action: 'create', index, body, _id: documentKey._id });
    }
  }

  return fetchElk({ action: 'delete', index, body: {}, _id: documentKey._id });
};

const init = () => {
  if (!(process.env.MONGO_URL || '').includes('replicaSet')) {
    return;
  }

  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });

  if (ELK_SYNCER === 'true') {
    return;
  }

  Customers.watch().on('change', data => {
    sendElkRequest(data, 'customers');
  });

  Companies.watch().on('change', data => {
    sendElkRequest(data, 'companies');
  });
};

export default init;
