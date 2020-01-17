import dayjs from 'dayjs';
import * as Factory from 'factory.ts';
import { IChecklist, IChecklistItem } from 'modules/checklists/types';
import { IBrand } from 'modules/settings/brands/types';

export const brandFactory = Factory.Sync.makeFactory<IBrand>({
  _id: '1',
  name: 'Erxes',
  code: 'nmma',
  createdAt: dayjs().format('YYYY-MM-DD'),
  description: 'special brand',
  emailConfig: { type: '', template: '' }
});

const checkListItemFactory = Factory.Sync.makeFactory<IChecklistItem>({
  _id: '1',
  checklistId: 'listId',
  isChecked: false,
  content: 'react test'
});

export const checkListFactory = Factory.Sync.makeFactory<IChecklist>({
  _id: '1',
  createdUserId: 'string',
  createdDate: new Date(),
  items: [
    checkListItemFactory.build(),
    checkListItemFactory.build({ _id: '2' })
  ],
  percent: 80,
  contentType: 'string',
  contentTypeId: 'string',
  title: 'string'
});
