import dayjs from 'dayjs';
import * as Factory from 'factory.ts';
import { IBrand } from 'modules/settings/brands/types';

export const brandFactory = Factory.Sync.makeFactory<IBrand>({
  _id: '1',
  name: 'Erxes',
  code: 'nmma',
  createdAt: dayjs().format('YYYY-MM-DD'),
  description: 'special brand',
  emailConfig: { type: '', template: '' }
});
