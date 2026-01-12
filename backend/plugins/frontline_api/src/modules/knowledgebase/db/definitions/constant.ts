import { field } from '~/modules/knowledgebase/db/utils';



export const PUBLISH_STATUSES = {
    DRAFT: 'draft',
    PUBLISH: 'publish',
    SCHEDULED: 'scheduled',
    ALL: ['draft', 'publish','scheduled'],
  };

export const commonFields = {
    createdBy: field({ type: String, label: 'Created by' }),
    createdDate: field({ type: Date, label: 'Created at' }),
    modifiedBy: field({ type: String, label: 'Modified by' }),
    modifiedDate: field({ type: Date, label: 'Modified at' }),
    title: field({ type: String, label: 'Title' }),
    code: field({ type: String, optional: true, sparse: true, unique: true, label: 'Code' }),
};