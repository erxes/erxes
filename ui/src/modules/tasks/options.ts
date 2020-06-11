import { toArray } from 'modules/boards/utils';
import TaskEditForm from 'modules/tasks/components/TaskEditForm';
import TaskItem from './components/TaskItem';
import { mutations, queries, subscriptions } from './graphql';

const options = {
  EditForm: TaskEditForm,
  Item: TaskItem,
  type: 'task',
  title: 'Task',
  queriesName: {
    itemsQuery: 'tasks',
    detailQuery: 'taskDetail',
    archivedItemsQuery: 'archivedTasks',
    archivedItemsCountQuery: 'archivedTasksCount'
  },
  mutationsName: {
    addMutation: 'tasksAdd',
    editMutation: 'tasksEdit',
    removeMutation: 'tasksRemove',
    changeMutation: 'tasksChange',
    watchMutation: 'tasksWatch',
    archiveMutation: 'tasksArchive',
    copyMutation: 'tasksCopy'
  },
  subscriptionName: {
    changeSubscription: 'tasksChanged'
  },
  queries: {
    itemsQuery: queries.tasks,
    detailQuery: queries.taskDetail,
    archivedItemsQuery: queries.archivedTasks,
    archivedItemsCountQuery: queries.archivedTasksCount
  },
  mutations: {
    addMutation: mutations.tasksAdd,
    editMutation: mutations.tasksEdit,
    removeMutation: mutations.tasksRemove,
    changeMutation: mutations.tasksChange,
    watchMutation: mutations.tasksWatch,
    archiveMutation: mutations.tasksArchive,
    copyMutation: mutations.tasksCopy
  },
  subscriptions: {
    changeSubscription: subscriptions.tasksChanged
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
