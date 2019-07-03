import { PortableTask, TaskEditForm } from 'modules/tasks/components';
import { TaskItem } from './containers';
import { mutations, queries } from './graphql';

const options = {
  EditForm: TaskEditForm,
  PortableItem: PortableTask,
  Item: TaskItem,
  type: 'task',
  title: 'Task',
  queriesName: {
    itemsQuery: 'tasks',
    detailQuery: 'taskDetail'
  },
  mutationsName: {
    addMutation: 'tasksAdd',
    editMutation: 'tasksEdit',
    removeMutation: 'tasksRemove',
    changeMutation: 'tasksChange',
    updateOrderMutation: 'tasksUpdateOrder'
  },
  queries: {
    itemsQuery: queries.tasks,
    detailQuery: queries.taskDetail
  },
  mutations: {
    addMutation: mutations.tasksAdd,
    editMutation: mutations.tasksEdit,
    removeMutation: mutations.tasksRemove,
    changeMutation: mutations.tasksChange,
    updateOrderMutation: mutations.tasksUpdateOrder
  },
  texts: {
    addText: 'Add a task',
    addSuccessText: 'You successfully added a task',
    updateSuccessText: 'You successfully updated a task',
    deleteSuccessText: 'You successfully deleted a task',
    copySuccessText: 'You successfully copied a task'
  },
  getExtraParams: (queryParams: any) => ({ priority: queryParams.priority })
};

export default options;
