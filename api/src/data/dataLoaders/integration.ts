import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Integrations } from '../../db/models';
import { IIntegrationDocument } from '../../db/models/definitions/integrations';

export default function generateDataLoaderIntegration() {
  return new DataLoader<string, IIntegrationDocument>(
    async (ids: readonly string[]) => {
      const result: IIntegrationDocument[] = await Integrations.find({
        _id: { $in: ids }
      });
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
