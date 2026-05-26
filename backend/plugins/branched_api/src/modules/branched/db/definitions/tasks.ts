import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants';

export const taskSchema = schemaWrapper(
  new Schema(
    {
      title: { type: String, required: true, label: 'Title' },
      description: { type: String, optional: true, label: 'Description' },
      assigneeId: { type: String, optional: true, esType: 'keyword' },
      branchId: { type: String, required: true, esType: 'keyword', index: true },
      dueDate: { type: Date, optional: true, label: 'Due date', esType: 'date' },
      status: {
        type: String,
        enum: TASK_STATUSES.ALL,
        default: TASK_STATUSES.TODO,
        label: 'Status',
      },
      priority: {
        type: String,
        enum: TASK_PRIORITIES.ALL,
        default: TASK_PRIORITIES.MEDIUM,
        label: 'Priority',
      },
    },
    { timestamps: true },
  ),
);
