import { toArray } from 'modules/boards/utils';
import TaskEditForm from 'modules/tasks/components/TaskEditForm';
import TaskItem from './components/TaskItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: TaskEditForm,
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
    updateOrderMutation: 'tasksUpdateOrder',
    watchMutation: 'tasksWatch'
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
    updateOrderMutation: mutations.tasksUpdateOrder,
    watchMutation: mutations.tasksWatch
  },
  texts: {
    addText: 'Add a task',
    updateSuccessText: 'You successfully updated a task',
    deleteSuccessText: 'You successfully deleted a task',
    copySuccessText: 'You successfully copied a task',
    changeSuccessText: 'You successfully changed a task'
  },
  isMove: true,
  getExtraParams: (queryParams: any) => {
    const { priority } = queryParams;
    const extraParams: any = {};

    if (priority) {
      extraParams.priority = toArray(priority);
    }

    return extraParams;
  }
};

export default options;
