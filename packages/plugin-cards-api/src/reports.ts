import { IUserDocument } from '@erxes/api-utils/src/types';
import { models } from './connectionResolver';
import {
  sendCoreMessage,
  sendTagsMessage,
  sendContactsMessage,
} from './messageBroker';
import * as dayjs from 'dayjs';

const DATE_RANGE_TYPES = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last Week', value: 'lastweek' },
  { label: 'This Week', value: 'thisweek' },
];

const reportTemplates = [
  {
    serviceType: 'deal',
    title: 'Deals chart',
    serviceName: 'cards',
    description: 'Deal conversation charts',
    charts: [
      'ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown',
      'dealsChartByMonth',
      'DealAmountAverageByRep',
      'DealLeaderboardAmountClosedByRep',
      'DealsByLastModifiedDate',
      'DealsClosedLostAllTimeByRep',
      'DealsOpenByCurrentStage',
      'DealsClosedWonAllTimeByRep',
      'DealRevenueByStage',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
  {
    serviceType: 'task',
    title: 'Tasks chart',
    serviceName: 'cards',
    description: 'Cards conversation charts',
    charts: [
      'TaskAverageTimeToCloseByReps',
      'TaskAverageTimeToCloseByLabel',
      'TaskAverageTimeToCloseByTags',
      'TaskClosedTotalsByReps',
      'TaskClosedTotalsByLabel',
      'TaskClosedTotalsByTags',
      'TasksIncompleteTotalsByReps',
      'TasksIncompleteTotalsByLabel',
      'TasksIncompleteTotalsByTags',
      'AllTasksIncompleteByDueDate',
      'TasksIncompleteAssignedToTheTeamByDueDate',
      'TasksIncompleteAssignedToMeByDueDate',
    ],
    img: 'https://cdn.mos.cms.futurecdn.net/S5bicwPe8vbP9nt3iwAwwi.jpg',
  },
  {
    serviceType: 'ticket',
    title: 'Tickets chart',
    serviceName: 'cards',
    description: 'Tickets conversation charts',
    charts: [
      'TicketAverageTimeToCloseOverTime',
      'TicketClosedTotalsByRep',
      'TicketTotalsByStatus',
      'TicketTotalsByLabelPriorityTag',
      'TicketTotalsOverTime',
      'TicketAverageTimeToCloseByRep',
      'TicketAverageTimeToClose',
      'TicketTotalsBySource',
      'TicketStageChangedDate',
      'TicketsCardCountAssignedUser',
      'TicketsStageDateRange',
      'TicketsCustom',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
];

const chartTemplates = [
  {
    templateType: 'TicketsStageDateRange',
    name: 'Stage Date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string,
    ) => {
      const dateRange = filter.dateRange;
      const currentDate = new Date(); // Replace this with the actual current date if needed
      const dateCondition = createDateCondition(dateRange, currentDate);

      const board = await models?.Boards.find({
        type: 'ticket',
      }).lean();

      const boardId = board?.map((item) => item._id);

      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId,
        },
        type: 'ticket',
        status: 'active',
      }).lean();

      const pipelineId = pipeline?.map((item) => item._id);

      const stages = await models?.Stages.find({
        pipelineId: {
          $in: pipelineId,
        },
      });

      const stageId = stages?.map((item) => item._id);

      let ticketCounts;
      let matchStageAndDate;
      if (Object.keys(dateCondition).length > 0) {
        matchStageAndDate = {
          $match: {
            stageId: {
              $in: stageId,
            },
            createdAt: dateCondition,
          },
        };
      } else {
        matchStageAndDate = {
          $match: {
            stageId: {
              $in: stageId,
            },
          },
        };
      }

      const groupStage = {
        $group: {
          _id: '$stageId',
          count: { $sum: 1 },
        },
      };

      ticketCounts = await models?.Tickets.aggregate([
        matchStageAndDate,
        groupStage,
      ]);

      const countByStageId = ticketCounts?.reduce((acc, result) => {
        acc[result._id] = result.count;
        return acc;
      }, {});

      const filters = (stages || [])
        .map((item) => ({
          _id: item._id,
          count: countByStageId?.[item._id] || 0,
          name: item.name,
        }))
        .filter((item) => item.count > 0);
      const title = 'Stage Date';
      const data = Object.values(filters).map((t: any) => t.count);

      const labels = Object.values(filters).map((t: any) => t.name);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'TicketsCardCountAssignedUser',
    name: 'Tickets Count and  AssignedUser',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string,
    ) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const board = await models?.Boards.find({
        type: 'ticket',
      }).lean();
      const boardId = board?.map((item) => item._id);
      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId,
        },
        type: 'ticket',
        status: 'active',
      }).lean();

      const pipelineId = pipeline?.map((item) => item._id);
      const stages = await models?.Stages.find({
        pipelineId: {
          $in: pipelineId,
        },
      });
      const stageId = stages?.map((item) => item._id);
      let ticketCounts;

      const matchStage = {
        $match: {
          stageId: {
            $in: stageId,
          },
        },
      };

      const matchAssignedUsers = {
        $match: {
          assignedUserIds: {
            $in: selectedUserIds,
          },
        },
      };

      const groupStage = {
        $group: {
          _id: '$stageId',
          count: { $sum: 1 },
        },
      };

      const groupAssignedUsers = {
        $group: {
          _id: '$stageId',
          count: { $sum: 1 },
          assignedUserIds: { $push: '$assignedUserIds' }, // assuming you want an array of assignedUserIds
        },
      };

      if (selectedUserIds.length === 0) {
        ticketCounts = await models?.Tickets.aggregate([
          matchStage,
          groupStage,
        ]);
      } else {
        ticketCounts = await models?.Tickets.aggregate([
          matchStage,
          matchAssignedUsers,
          groupAssignedUsers,
        ]);
      }
      const countByStageId = ticketCounts?.reduce((acc, result) => {
        acc[result._id] = result.count;
        return acc;
      }, {});
      const filters = (stages || [])
        .map((item) => ({
          _id: item._id,
          count: countByStageId?.[item._id] || 0,
          name: item.name,
        }))
        .filter((item) => item.count > 0);
      const title = 'Tickets Count and  AssignedUser';
      const data = Object.values(filters).map((t: any) => t.count);
      const labels = Object.values(filters).map((t: any) => t.name);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        fieldQuery: 'users',
        fieldLabel: 'Select assigned user',
      },
    ],
  },
  {
    templateType: 'TicketStageChangedDate',
    name: 'Ticket Stage Changed Date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string,
    ) => {
      try {
        const dateRange = filter.dateRange;
        const currentDate = new Date(); // Replace this with the actual current date if needed
        const dateCondition = createDateCondition(dateRange, currentDate);
        let matchStage;
        let ticked;

        // Use 'if' instead of 'switch' here
        if (Object.keys(dateCondition).length > 0) {
          matchStage = { stageChangedDate: dateCondition };
        }

        if (matchStage === undefined || matchStage === 'all') {
          ticked = await models?.Tickets.find({
            stageChangedDate: { $exists: true },
          }).sort({ stageChangedDate: -1 });
        } else {
          ticked = await models?.Tickets.find({ ...matchStage }).sort({
            stageChangedDate: -1,
          });
        }

        if (ticked) {
          const stageDate = await stageChangedDate(ticked);
          const title = 'Ticket Stage Changed Date';
          const data = stageDate.reduce((result, item) => {
            const date = item.date.split(',')[0]; // Extracting the date part without time
            result[date] = (result[date] || 0) + 1;

            return result;
          }, {});

          const aggregatedData = Object.keys(data).map((date) => ({
            x: date,
            y: data[date],
          }));

          const result = {
            title,
            data: aggregatedData,
          };

          return result;
        } else {
          console.log('no data');
        }
      } catch (error) {
        return { error: error.message };
      }
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'TasksIncompleteTotalsByTags',
    name: 'Tasks incomplete totals by tags',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedTagIds = filter.tagIds || [];
      let tasksCount;
      try {
        if (selectedTagIds.length === 0) {
          // No selected users, so get all tasks
          tasksCount = await models?.Tasks.find({ isComplete: false }).lean();
        } else {
          // Filter tasks based on selectedLabelIds
          tasksCount = await models?.Tasks.find({
            tagIds: { $in: selectedTagIds },
            isComplete: false,
          }).lean();
        }

        // Check if the returned value is not an array
        if (!Array.isArray(tasksCount)) {
          throw new Error('Invalid data: tasks is not an array.');
        }

        // Continue processing tasks...
      } catch (error) {
        console.error('Error fetching tasks:', error);

        // Handle the error or return an appropriate response.
        // For example, you might set tasks to an empty array to avoid further issues
        tasksCount = [];
      }
      const taskCounts = taskClosedByTagsRep(tasksCount);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const tagInfo = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: ownerIds || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      if (!tagInfo || tagInfo.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          tagIds: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const ownerId = item.ownerId;
        const matchingLabel = tagInfo.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Tasks incomplete totals by tags';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteTotalsByLabel',
    name: 'Tasks incomplete totals by label',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedLabelIds = filter.labelIds || [];
      let tasks;
      try {
        if (selectedLabelIds.length === 0) {
          // No selected users, so get all tasks
          tasks = await models?.Tasks.find({ isComplete: false }).lean();
        } else {
          // Filter tasks based on selectedLabelIds
          tasks = await models?.Tasks.find({
            labelIds: { $in: selectedLabelIds },
            isComplete: false,
          }).lean();
        }

        // Check if the returned value is not an array
        if (!Array.isArray(tasks)) {
          throw new Error('Invalid data: tasks is not an array.');
        }

        // Continue processing tasks...
      } catch (error) {
        console.error('Error fetching tasks:', error);

        // Handle the error or return an appropriate response.
        // For example, you might set tasks to an empty array to avoid further issues
        tasks = [];
      }
      const taskCounts = taskClosedByRep(tasks);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const labels = await models?.PipelineLabels.find({
        _id: {
          $in: ownerIds,
        },
      }).lean();

      if (!labels || labels.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          labels: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const ownerId = item.ownerId;
        const matchingLabel = labels.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Tasks incomplete totals by label';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'labels',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select labels',
      },
    ],
  },

  {
    templateType: 'AllTasksIncompleteByDueDate',
    name: 'All tasks incomplete by due date',
    chartTypes: ['bar', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const tasks = await models?.Tasks.find({
        isComplete: false,
        closeDate: { $exists: true, $ne: [] },
      })
        .sort({ closeDate: -1 })
        .limit(10)
        .lean();

      try {
        if (!tasks || tasks.length === 0) {
          throw new Error('No incomplete tasks found.');
        }

        const label = 'All tasks incomplete by due date';
        const data = Object.values(tasks).map((t: any) => t.closeDate);
        const labels = Object.values(tasks).map((t: any) => t.name);
        const options = {
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month',
              },
            },
            y: {
              beginAtZero: true,
              type: 'linear',
            },
          },
        };

        const datasets = [{ label, data, labels, options }];

        return datasets;
      } catch (error) {
        console.error('Error fetching and processing tasks:', error);
        throw new Error('Failed to retrieve or process task data.');
      }
    },

    filterTypes: [],
  },

  {
    templateType: 'TasksIncompleteTotalsByReps',
    name: 'Tasks incomplete totals by reps',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;
      try {
        if (selectedUserIds.length === 0) {
          // No selected users, so get all tasks
          tasks = await models?.Tasks.find({ isComplete: false }).lean();
        } else {
          // Filter tasks based on selectedUserIds
          const taskCount = await models?.Tasks.find({
            assignedUserIds: { $in: selectedUserIds },
            isComplete: false,
          }).lean();
          if (taskCount) {
            tasks = taskCount.filter((task) => {
              return task.assignedUserIds.some((userId) =>
                selectedUserIds.includes(userId),
              );
            });
          } else {
            // Handle the case where datats is undefined
            console.error('No tasks found based on the selected user IDs.');
            tasks = [];
          }
        }

        // Check if the returned value is not an array
        if (!Array.isArray(tasks)) {
          throw new Error('Invalid data: tasks is not an array.');
        }

        // Continue processing tasks...
      } catch (error) {
        console.error('Error fetching tasks:', error);

        tasks = [];
      }

      // Calculate task counts
      const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        // tslint:disable-next-line:no-shadowed-variable

        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      // Sort the array based on task counts
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });
      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const title = 'Tasks incomplete totals by reps';
      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCounts[ownerId];

        if (user) {
          return {
            name: user.fullName,
            count: count || 0, // Set count to 0 if not found in ticketCounts
          };
        }
      });
      const filteredSort = sort.filter((entry) => entry !== undefined);

      const data = Object.values(filteredSort).map((t: any) => t.count);
      const labels = Object.values(filteredSort).map((t: any) => t.name);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },

  {
    templateType: 'TaskClosedTotalsByLabel',
    name: 'Task closed totals by label',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedLabelIds = filter.labelIds || [];
      let tasks;
      try {
        if (selectedLabelIds.length === 0) {
          // No selected users, so get all tasks
          tasks = await models?.Tasks.find({ isComplete: true }).lean();
        } else {
          // Filter tasks based on selectedLabelIds
          tasks = await models?.Tasks.find({
            labelIds: { $in: selectedLabelIds },
            isComplete: true,
          }).lean();
        }

        // Check if the returned value is not an array
        if (!Array.isArray(tasks)) {
          throw new Error('Invalid data: tasks is not an array.');
        }

        // Continue processing tasks...
      } catch (error) {
        console.error('Error fetching tasks:', error);

        // Handle the error or return an appropriate response.
        // For example, you might set tasks to an empty array to avoid further issues
        tasks = [];
      }
      const taskCounts = taskClosedByRep(tasks);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const labels = await models?.PipelineLabels.find({
        _id: {
          $in: ownerIds,
        },
      }).lean();

      if (!labels || labels.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          labels: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const ownerId = item.ownerId;
        const matchingLabel = labels.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Task closed totals by label';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'labels',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select labels',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteAssignedToMeByDueDate',
    name: 'Tasks incomplete assigned to me by due date',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let tickets;

      try {
        if (selectedUserIds.length === 0) {
          // No selected users, so get all tickets
          tickets = await models?.Tasks.find({
            isComplete: false,
          }).lean();
        } else {
          // Filter tickets based on selectedUserIds
          tickets = await models?.Tasks.find({
            assignedUserIds: {
              $in: selectedUserIds,
            },
            isComplete: false,
          }).lean();
        }

        // Check if the returned value is not an array
        if (!Array.isArray(tickets)) {
          throw new Error('Invalid data: tickets is not an array.');
        }

        // Continue processing tickets...
      } catch (error) {
        console.error('Error fetching tickets:', error);

        // Handle the error or return an appropriate response.
        // For example, you might set tickets to an empty array to avoid further issues
        tickets = [];
      }

      // Calculate ticket counts
      const ticketCounts = calculateTicketCounts(tickets, selectedUserIds);
      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(ticketCounts).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      // Sort the array based on ticket counts
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);
      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            _id: {
              $in: ownerIds,
            },
          },
        },
        isRPC: true,
        defaultValue: [],
      });
      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = ticketCounts[ownerId];
        if (user) {
          return {
            name: user.fullName,
            count: count || 0, // Set count to 0 if not found in ticketCounts
          };
        }
      });

      // Filter out undefined values from sort

      const filteredSort = sort.filter((entry) => entry !== undefined);

      const title = 'Tasks incomplete assigned to me by due date';
      const data = filteredSort.map((t: any) => t.count);
      const labels = filteredSort.map((t: any) => t.name);

      const datasets = {
        title,
        data,
        labels,
      };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteAssignedToTheTeamByDueDate',
    name: 'Tasks incomplete assigned to the team by due date',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];

      let tasksCount;
      //  tasksCount = await models?.Tasks.find({ isComplete: true }).lean();

      try {
        if (selectedUserIds.length === 0) {
          tasksCount = await models?.Tasks.find({
            isComplete: false,
            departmentIds: { $exists: true, $ne: [] },
          }).lean();
        } else {
          tasksCount = await models?.Tasks.find({
            isComplete: false,
            assignedUserIds: { $in: selectedUserIds },
            departmentIds: { $exists: true, $ne: [] },
          }).lean();
        }
      } catch (error) {
        console.error('Error fetching departmentIds:', error);
      }
      const taskCounts = departmentCount(tasksCount);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const departmentInfo = await sendCoreMessage({
        subdomain,
        action: `departments.find`,
        data: {
          _id: { $in: ownerIds || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      if (!departmentInfo || departmentInfo.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          departmentsIds: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const ownerId = item.ownerId;

        const matchingLabel = departmentInfo.find(
          (label) => label && label._id === ownerId,
        );
        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.title] : [],
        };
      });
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Tasks incomplete assigned to the team by due date';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },

  {
    templateType: 'TaskClosedTotalsByTags',
    name: 'Task closed totals by tags',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedTagIds = filter.tagIds || [];
      let tasksCount;
      //  tasksCount = await models?.Tasks.find({ isComplete: true }).lean();

      try {
        if (selectedTagIds.length === 0) {
          tasksCount = await models?.Tasks.find({
            isComplete: true,
          }).lean();
        } else {
          tasksCount = await models?.Tasks.find({
            isComplete: true,
            tagIds: { $in: selectedTagIds },
          }).lean();
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }

      const taskCounts = taskClosedByTagsRep(tasksCount);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const tagInfo = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: ownerIds || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      if (!tagInfo || tagInfo.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          tagIds: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const ownerId = item.ownerId;
        const matchingLabel = tagInfo.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Task closed totals by tags';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'tags',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },
  {
    templateType: 'TaskClosedTotalsByReps',
    name: 'Task closed totals by reps',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;

      try {
        if (selectedUserIds.length === 0) {
          tasks = await models?.Tasks.find({ isComplete: true }).lean();
        } else {
          tasks = await models?.Tasks.find({
            isComplete: true,
            assignedUserIds: { $in: selectedUserIds },
          }).lean();
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      }

      // Calculate task counts
      const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );

      // Sort the array based on task counts
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });
      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const title = 'View the total number of closed tasks by reps';

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCounts[ownerId];

        return {
          name: user.fullName,
          count: count || 0, // Set count to 0 if not found in ticketCounts
        };
      });
      const data = Object.values(sort).map((t: any) => t.count);
      const labels = Object.values(sort).map((t: any) => t.name);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },

  {
    templateType: 'TaskAverageTimeToCloseByLabel',
    name: 'Task average time to close by label',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const tasks = await models?.Tasks.find({
        isComplete: false,
      }).lean();

      const ticketData = await taskAverageTimeToCloseByLabel(tasks);
      // const labelIds = ticketData.map((result) => result.labelIds);
      const labelIdsCount = ticketData.flatMap((result) => result.labelIds);

      const labels = await models?.PipelineLabels.find({
        _id: {
          $in: labelIdsCount,
        },
      }).lean();

      if (!labels || labels.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          labels: [],
        };
      }
      const enrichedTicketData = ticketData.map((task) => {
        // Ensure labelIds is an array (default to empty array if undefined)
        const labelIds = Array.isArray(task.labelIds) ? task.labelIds : [];

        // Check if labelIds is not empty before mapping
        if (labelIds.length > 0) {
          const labelNames = labelIds.map((labelId) => {
            const matchingLabel = labels.find(
              (label) => label && label._id === labelId,
            ); // Check for undefined label
            return matchingLabel ? matchingLabel.name : '';
          });

          // Filter out undefined and empty string labels
          const filteredLabels = labelNames.filter((label) => label !== '');

          return {
            ...task,
            labels: filteredLabels,
          };
        } else {
          // If labelIds is empty, return the task as is
          return task;
        }
      });

      let setData: string[] = [];
      let stablesNames: string[] = [];

      enrichedTicketData
        .filter((t) => t.timeDifference && t.labels && t.labels.length > 0)
        .slice(0, 100) // Limit to the first 10 elements
        .map((t) => {
          setData.push(t.timeDifference);

          // Flatten and join the labels array into a single string
          const flattenedLabels = t.labels.join(' ');
          stablesNames.push(flattenedLabels);

          return {
            timeDifference: t.timeDifference,
            stageId: t.stageId,
            labelIds: t.labelIds,
            labels: flattenedLabels,
            /* Add other properties as needed */
          };
        });

      const title = 'Task average time to close by label';

      const datasets = {
        title,
        data: setData,
        labels: stablesNames,
      };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'labels',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select labels',
      },
    ],
  },

  {
    templateType: 'TaskAverageTimeToCloseByTags',
    name: 'Task average time to close by tags',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const tasks = await models?.Tasks.find({
        isComplete: false,
      }).lean();

      const ticketData = await taskAverageTimeToCloseByLabel(tasks);
      // const labelIds = ticketData.map((result) => result.labelIds);
      const tagIdsCount = ticketData.flatMap((result) => result.tagIds);

      const tagInfo = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: tagIdsCount || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      if (!tagIdsCount || tagIdsCount.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          tagIds: [],
        };
      }
      const enrichedTicketData = ticketData.map((task) => {
        // Ensure tagIds is an array (default to empty array if undefined)
        const tagIds = Array.isArray(task.tagIds) ? task.tagIds : [];

        // Check if tagIds is not empty before mapping
        if (tagIds.length > 0) {
          const tagNames = tagIds.map((tagId) => {
            const matchingTag = tagInfo.find((tag) => tag && tag._id === tagId); // Check for undefined tag
            return matchingTag ? matchingTag.name : '';
          });

          // Filter out undefined and empty string Tags
          const filteredTags = tagNames.filter((tag) => tag !== '');

          return {
            ...task,
            tagIds: filteredTags,
          };
        } else {
          // If tagIds is empty, return the task as is
          return task;
        }
      });

      let setData: string[] = [];
      let stagsNames: string[] = [];

      enrichedTicketData
        .filter((t) => t.timeDifference && t.tags && t.tags.length > 0)
        .slice(0, 100) // Limit to the first 10 elements
        .map((t) => {
          setData.push(t.timeDifference);

          // Flatten and join the tags array into a single string
          const flattenedTagss = t.tags.join(' ');
          stagsNames.push(flattenedTagss);

          return {
            timeDifference: t.timeDifference,
            stageId: t.stageId,
            tagIds: t.tagIds,
            tags: flattenedTagss,
            /* Add other properties as needed */
          };
        });

      const title = 'Task average time to close by tags';

      const datasets = {
        title,
        data: setData,
        tags: stagsNames,
      };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'tags',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },

  {
    templateType: 'TaskAverageTimeToCloseByReps',
    name: 'Task average time to close by reps',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;
      try {
        if (selectedUserIds.length === 0) {
          tasks = await models?.Tasks.find({ isComplete: true }).lean();
        } else {
          tasks = await models?.Tasks.find({
            isComplete: true,
            assignedUserIds: { $in: selectedUserIds },
          }).lean();
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      }

      const ticketData = await calculateAverageTimeToCloseUser(
        tasks,
        selectedUserIds,
      );

      const getTotalAssignedUsers = await Promise.all(
        ticketData?.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.assignedUserIds,
                },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }) ?? [],
      );

      const result: any[] = [];

      for (const assignedUser of getTotalAssignedUsers) {
        assignedUser.map((itemsAdd) => {
          const ticket = ticketData?.find((item) =>
            item.assignedUserIds.includes(itemsAdd._id),
          );

          if (ticket) {
            result.push({
              timeDifference: ticket.timeDifference,
              assignedUserIds: ticket.assignedUserIds,
              FullName: itemsAdd.details?.fullName || '',
            });
          }
        });
      }

      const data = Object.values(result).map((t: any) => t.timeDifference);
      const labels = Object.values(result).map((t: any) => t.FullName);

      const title = 'Task average time to close by reps';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },
  {
    templateType: 'DealRevenueByStage',
    name: 'Deal revenue by stage',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async () => {
      const board = await models?.Boards.find({
        type: 'deal',
      }).lean();
      const boardId = board?.map((item) => item._id);

      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId,
        },
        type: 'deal',
        status: 'active',
      }).lean();

      const pipelineId = pipeline?.map((item) => item._id);
      const stages = await models?.Stages.find({
        $and: [
          { type: 'deal' },
          { pipelineId: { $in: pipelineId } },
          { probability: { $nin: ['lost', 'won'] } },
        ],
      }).lean();
      if (stages) {
        let deals;
        await Promise.all(
          stages.map(async (result) => {
            deals = await models?.Deals.find({
              stageId: result._id,
              status: 'active', // Assuming 'active' is the status for open deals
            }).lean();
          }),
        );

        // Example usage
        async function processData() {
          const dealsCounts = await amountProductData(deals);
          // Consolidate totalAmounts for the same stageId
          const consolidatedData = dealsCounts.reduce((consolidated, item) => {
            const existingItem = consolidated.find(
              (c) => c.stageId === item.stageId,
            );

            if (existingItem) {
              existingItem.totalAmount += item.totalAmount;
            } else {
              consolidated.push({ ...item });
            }

            return consolidated;
          }, []);

          const data = consolidatedData.map((t: any) =>
            t.totalAmount.toString(),
          );

          const stageIds = consolidatedData.map((t: any) => t.stageId);
          const stagesName = await models?.Stages.find({
            $and: [
              { type: 'deal' },
              {
                _id: {
                  $in: stageIds,
                },
              },
            ],
          }).lean();

          const stageIdToNameMap =
            stagesName?.reduce((map, stage) => {
              map[stage._id] = stage.name;
              return map;
            }, {}) || {};
          const labels = consolidatedData.map(
            (t: any) => stageIdToNameMap[t.stageId],
          );
          const title = 'Deals open by current stage';
          const datasets = {
            title,
            data,
            labels,
          };

          return datasets;
        }

        // Call processData function
        const data = await processData();

        return data;
      } else {
        throw new Error('No deal stages found');
      }
    },
    filterTypes: [],
  },

  {
    templateType: 'DealsOpenByCurrentStage',
    name: 'Deals open by current stage',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async () => {
      const stages = await models?.Stages.find({
        $and: [
          { type: 'deal' },
          {
            $or: [
              { probability: { $lt: 0 } }, // Less than 0%
              { probability: { $gte: 100 } }, // Greater than or equal to 100%
            ],
          },
        ],
      }).lean();
      if (stages) {
        const openDealsCounts = await Promise.all(
          stages.map(async (stage) => {
            const openDealsCount = await models?.Deals.countDocuments({
              stageId: stage._id,
              status: 'active', // Assuming 'active' is the status for open deals
            });

            const stageDetails = await models?.Stages.findById(
              stage._id,
            ).lean();

            return {
              stageId: stage._id,
              stageName: stageDetails?.name, // Include other relevant stage information
              count: openDealsCount,
            };
          }),
        );

        const setData = Object.values(openDealsCounts).map((t: any) => t.count);
        const setLabels = Object.values(openDealsCounts).map(
          (t: any) => t.stageName,
        );
        const title = 'Deals open by current stage';
        const datasets = { title, data: setData, labels: setLabels };

        return datasets;
      } else {
        throw new Error('No deal stages found');
      }
    },
    filterTypes: [],
  },

  {
    templateType: 'ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown',
    name: 'Closed revenue by month with deal total and closed revenue breakdown',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string,
    ) => {
      const dateRange = filter.dateRange;
      const currentDate = new Date(); // Replace this with the actual current date if needed
      const dateCondition = createDateCondition(dateRange, currentDate);

      let matchDate;
      let totalDeals;

      if (Object.keys(dateCondition).length > 0) {
        matchDate = { closedDate: dateCondition };
      }

      if (
        matchDate === undefined ||
        dateRange === 'all' ||
        dateRange === undefined
      ) {
        totalDeals = await models?.Deals.find({}).sort({
          closedDate: -1,
        });
      } else {
        totalDeals = await models?.Deals.find(matchDate).sort({
          closedDate: -1,
        });
      }

      const monthNames: string[] = [];
      const monthlyDealsCount: number[] = [];
      if (totalDeals) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalDeals.at(-1)?.createdAt || endOfYear),
        );

        let startRange = dayjs(startOfYear);
        while (startRange < endRange) {
          monthNames.push(startRange.format('MMMM'));

          const getStartOfNextMonth = startRange.add(1, 'month').toDate();
          const getDealsCountOfMonth = totalDeals.filter(
            (deal) =>
              new Date(deal.createdAt || '').getTime() >=
                startRange.toDate().getTime() &&
              new Date(deal.createdAt || '').getTime() <
                getStartOfNextMonth.getTime(),
          );
          monthlyDealsCount.push(getDealsCountOfMonth.length);
          startRange = startRange.add(1, 'month');
        }
      }
      const title =
        'Closed revenue by month with deal total and closed revenue breakdown';
      const datasets = { title, data: monthlyDealsCount, labels: monthNames };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },

  {
    templateType: 'DealAmountAverageByRep',
    name: 'Deal amount average by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let deals;

      try {
        if (selectedUserIds.length === 0) {
          deals = await models?.Deals.find({ isComplete: true }).lean();
        } else {
          deals = await models?.Deals.find({
            isComplete: true,
            assignedUserIds: { $in: selectedUserIds },
          }).lean();
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      }

      const dealCounts = calculateAverageDealAmountByRep(
        deals,
        selectedUserIds,
      );

      const getTotalAssignedUserIds = await Promise.all(
        dealCounts.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.userId,
                },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }),
      );
      const assignedUsersMap = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          assignedUsersMap[assignedUser._id] = {
            fullName: assignedUser.details?.fullName,
            amount: dealCounts[i].amount, // Match the amount with the correct index
          };
        }
      }
      const data = Object.values(assignedUsersMap).map((t: any) => t.amount);
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName,
      );

      const title = 'Deal amount average by rep';
      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },
  {
    templateType: 'DealLeaderboardAmountClosedByRep',
    name: 'Deal leader board - amount closed by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let deals;

      try {
        if (selectedUserIds.length === 0) {
          deals = await models?.Deals.find({ isComplete: true }).lean();
        } else {
          deals = await models?.Deals.find({
            isComplete: true,
            assignedUserIds: { $in: selectedUserIds },
          }).lean();
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      }

      const dealCounts = calculateAverageDealAmountByRep(
        deals,
        selectedUserIds,
      );
      const getTotalAssignedUserIds = await Promise.all(
        dealCounts.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.userId,
                },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }),
      );
      const assignedUsersMap = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          assignedUsersMap[assignedUser._id] = {
            fullName: assignedUser.details?.fullName,
            amount: dealCounts[i].amount, // Match the amount with the correct index
          };
        }
      }
      const data = Object.values(assignedUsersMap).map((t: any) => t.amount);
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName,
      );

      const title = 'Deal amount average by rep';
      const datasets = { title, data, labels };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },
  {
    templateType: 'DealsByLastModifiedDate',
    name: 'Deals by last modified date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, subdomain: string) => {
      const dateRange = filter.dateRange;
      const currentDate = new Date(); // Replace this with the actual current date if needed
      const dateCondition = createDateCondition(dateRange, currentDate);
      let matchDate;
      let totalDeals;

      if (Object.keys(dateCondition).length > 0) {
        matchDate = { modifiedAt: dateCondition };
      }

      if (
        matchDate === undefined ||
        dateRange === 'all' ||
        dateRange === undefined
      ) {
        totalDeals = await models?.Deals.find({}).sort({
          modifiedAt: -1,
        });
      } else {
        totalDeals = await models?.Deals.find(matchDate).sort({
          modifiedAt: -1,
        });
      }

      const dealsCount = totalDeals?.map((deal) => {
        return {
          dealName: deal.name,
          dealStage: deal.stageId,
          currentStatus: deal.status,
          lastModifiedDate: deal.modifiedAt,
          stageChangedDate: deal.stageChangedDate,
        };
      });

      const sortedData = dealsCount?.sort((a, b) => {
        const dateA = new Date(a.lastModifiedDate ?? 0);
        const dateB = new Date(b.lastModifiedDate ?? 0);
        return dateB.getTime() - dateA.getTime();
      });

      const data = sortedData?.map((deal: any) => {
        const dateWithTime = new Date(deal.lastModifiedDate);
        const dateOnly = dateWithTime.toISOString().substring(0, 10); // Extract YYYY-MM-DD
        return dateOnly;
      });

      const labels = sortedData?.map((deal: any) => deal.dealName);
      const label = 'Deals count by modified month';
      const datasets = [
        {
          type: 'line',
          label,
          data: data || [], // Ensure data is an array even if sortedData is undefined
          options: {
            scales: {
              x: {
                type: 'time',
                time: {
                  displayFormats: {
                    quarter: 'MMM YYYY',
                  },
                },
              },
            },
          },
          labels,
        },
      ];
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },

  {
    templateType: 'DealsClosedLostAllTimeByRep',
    name: 'Deals closed lost all time by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const stages = await models?.Stages.find({
        $and: [{ type: 'deal' }, { probability: 'Lost' }],
      }).lean();
      let dealCounts;
      if (stages) {
        if (selectedUserIds.length === 0) {
          dealCounts = await Promise.all(
            // tslint:disable-next-line:no-shadowed-variable
            stages.map(async (result) => {
              return await models?.Deals.find({
                stageId: result._id,
              }).lean();
            }),
          );
        } else {
          dealCounts = await Promise.all(
            // tslint:disable-next-line:no-shadowed-variable
            stages.map(async (result) => {
              return await models?.Deals.find({
                $and: [
                  { stageId: result._id },
                  { assignedUserIds: { $in: selectedUserIds } },
                ],
              }).lean();
            }),
          );
        }
      } else {
        throw new Error('Stages are undefined.');
      }

      // Extract counts
      const data = await Promise.all(
        dealCounts.map(async (item) => {
          const resultPromises = item.map(async (result) => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: 'users.find',
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: result.assignedUserIds },
                },
              },
              isRPC: true,
              defaultValue: [],
            });

            return getTotalRespondedUsers.map((user) => {
              const counts = item.filter(
                (element) =>
                  element.status === 'active' &&
                  element.assignedUserIds &&
                  element.assignedUserIds.includes(user._id),
              ).length;
              return {
                FullName: user.details?.fullName || '',
                _id: user._id,
                count: counts || 0,
              };
            });
          });

          // Wait for all inner promises to resolve
          const resultData = await Promise.all(resultPromises);
          // Flatten the array of arrays and remove duplicates based on _id
          const flattenedData = resultData.flat();
          const uniqueData = Array.from(
            new Set(flattenedData.map((user) => user._id)),
          ).map((id) => flattenedData.find((user) => user._id === id));

          return uniqueData;
        }),
      );

      const uniqueUserEntries = Array.from(
        new Set(data.map((entry) => JSON.stringify(entry))),
        (str) => JSON.parse(str),
      );

      const summedResultArray = await sumCountsByUserIdName(uniqueUserEntries);

      const filteredResult =
        selectedUserIds.length > 0
          ? summedResultArray.filter((user) =>
              selectedUserIds.includes(user._id),
            )
          : summedResultArray;

      const setData = Object.values(filteredResult).map((t: any) => t.count);
      const setLabels = Object.values(filteredResult).map(
        (t: any) => t.fullName,
      );
      const title = 'Deals closed lost all time by rep';
      const datasets = { title, data: setData, labels: setLabels };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },

  {
    templateType: 'DealsClosedWonAllTimeByRep',
    name: 'Deals closed won all time by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const stages = await models?.Stages.find({
        $and: [{ type: 'deal' }, { probability: 'Won' }],
      }).lean();
      let dealCounts;
      if (stages) {
        if (selectedUserIds.length === 0) {
          dealCounts = await Promise.all(
            // tslint:disable-next-line:no-shadowed-variable
            stages.map(async (result) => {
              return await models?.Deals.find({
                stageId: result._id,
              }).lean();
            }),
          );
        } else {
          dealCounts = await Promise.all(
            // tslint:disable-next-line:no-shadowed-variable
            stages.map(async (result) => {
              return await models?.Deals.find({
                $and: [
                  { stageId: result._id },
                  { assignedUserIds: { $in: selectedUserIds } },
                ],
              }).lean();
            }),
          );
        }
      } else {
        throw new Error('Stages are undefined.');
      }

      // Extract counts
      const data = await Promise.all(
        dealCounts.map(async (item) => {
          const resultPromises = item.map(async (result) => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: 'users.find',
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: result.assignedUserIds },
                },
              },
              isRPC: true,
              defaultValue: [],
            });

            return getTotalRespondedUsers.map((user) => {
              const counts = item.filter(
                (element) =>
                  element.status === 'active' &&
                  element.assignedUserIds &&
                  element.assignedUserIds.includes(user._id),
              ).length;
              return {
                FullName: user.details?.fullName || '',
                _id: user._id,
                count: counts || 0,
              };
            });
          });

          // Wait for all inner promises to resolve
          const resultData = await Promise.all(resultPromises);
          // Flatten the array of arrays and remove duplicates based on _id
          const flattenedData = resultData.flat();
          const uniqueData = Array.from(
            new Set(flattenedData.map((user) => user._id)),
          ).map((id) => flattenedData.find((user) => user._id === id));

          return uniqueData;
        }),
      );

      const uniqueUserEntries = Array.from(
        new Set(data.map((entry) => JSON.stringify(entry))),
        (str) => JSON.parse(str),
      );

      const summedResultArray = await sumCountsByUserIdName(uniqueUserEntries);

      const filteredResult =
        selectedUserIds.length > 0
          ? summedResultArray.filter((user) =>
              selectedUserIds.includes(user._id),
            )
          : summedResultArray;

      const setData = Object.values(filteredResult).map((t: any) => t.count);
      const setLabels = Object.values(filteredResult).map(
        (t: any) => t.fullName,
      );

      const title = 'Deals closed won all time by rep';
      const datasets = { title, data: setData, labels: setLabels };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },

  {
    templateType: 'TicketAverageTimeToCloseOverTime',
    name: 'Ticket average time to close over time',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async () => {
      const ticket = await models?.Tickets.find({
        isComplete: true,
      }).lean();
      if (!ticket || ticket.length === 0) {
        console.error(
          'No ticket found in the database matching the specified criteria.',
        );
        // Handle the case when no items are found
        return null; // or some default value
      }

      const title =
        'View the average amount of time it takes your reps to close tickets. See how this tracks over time.';
      const ticketData = await calculateAverageTimeToClose(ticket);
      const labels = ticketData.map((duration) => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        return `${hours}h ${minutes}m ${seconds}s`;
      });

      const datasets = { title, ticketData, labels };

      return datasets;
    },
    filterTypes: [],
  },
  {
    templateType: 'TicketsCustom',
    name: 'Tickets priority ',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string,
    ) => {
      const dateRange = filter.dateRange;
      const currentDate = new Date(); // Replace this with the actual current date if needed
      const dateCondition = createDateCondition(dateRange, currentDate);
      let tickets;
      const query =
        Object.keys(dateCondition).length > 0 ? { ...dateCondition } : {};

      if (Object.keys(query).length > 0) {
        tickets = await models?.Tickets.find().sort({ createdAt: -1 }).lean();
      } else {
        tickets = await models?.Tickets.find(query)
          .sort({ createdAt: -1 })
          .lean();
      }

      const customerDataArray = await Promise.all(
        tickets?.map(async (item) => {
          const customer_ids = await sendCoreMessage({
            subdomain,
            action: 'conformities.savedConformity',
            data: {
              mainType: 'ticket',
              mainTypeId: item._id,
              relTypes: ['customer'],
            },
            isRPC: true,
            defaultValue: [],
          });
          return { name: item.name, customer_ids };
        }) ?? [],
      );
      const flattenedCustomerIds = customerDataArray
        .map((item) => item.customer_ids)
        .flat();
      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: {
          selector: {
            _id: { $in: flattenedCustomerIds },
          },
        },
        isRPC: true,
        defaultValue: [],
      });

      const customerName = await Promise.all(
        (customers || []).map(async (result) => {
          return await sendContactsMessage({
            subdomain,
            action: 'customers.findOne',
            data: {
              _id: result._id,
            },
            isRPC: true,
            defaultValue: {},
          });
        }),
      );

      interface CustomerData {
        name: string;
        count: number;
      }

      const data: (CustomerData | null)[] = customerName
        .map((result) => {
          const matchingCustomers = customerDataArray.filter((label) =>
            label.customer_ids.includes(result._id),
          );

          if (matchingCustomers.length > 0) {
            const uniqueNamesSet = new Set<string>();
            const flattenedData = matchingCustomers.map((items) => {
              const name = items.name;
              if (!uniqueNamesSet.has(name)) {
                uniqueNamesSet.add(name);
                return {
                  name,
                  count: items.customer_ids.length,
                };
              }
              return null;
            });

            return flattenedData.filter(Boolean) as CustomerData[];
          }

          return null;
        })
        .filter(Boolean)
        .flat();

      // Remove duplicate objects based on the 'name' property
      const uniqueData: CustomerData[] = Array.from(
        new Set(data.map((obj) => JSON.stringify(obj))),
      )
        .map((str) => JSON.parse(str) as CustomerData)
        .filter((obj): obj is CustomerData => obj !== null);

      const title = 'Tickets Custom';
      const setData = Object.values(uniqueData).map((t: any) => t.count);

      const setName = Object.values(uniqueData).map((t: any) => t.name);

      const datasets = { title, data: setData, labels: setName };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
      {
        fieldName: 'customFieldsData',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select customers',
      },
      {
        fieldName: 'name',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select name',
      },
    ],
  },
  {
    templateType: 'TicketClosedTotalsByRep',
    name: 'Ticket closed totals by rep',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let tickets;

      try {
        if (selectedUserIds.length === 0) {
          // No selected users, so get all tickets
          tickets = await models?.Tickets.find({ isComplete: true }).lean();
        } else {
          // Filter tickets based on selectedUserIds
          tickets = await models?.Tickets.find({
            assignedUserIds: { $in: selectedUserIds },
            isComplete: true,
          }).lean();
        }

        // Check if the returned value is not an array
        if (!Array.isArray(tickets)) {
          throw new Error('Invalid data: tickets is not an array.');
        }

        // Continue processing tickets...
      } catch (error) {
        console.error('Error fetching tickets:', error);

        // Handle the error or return an appropriate response.
        // For example, you might set tickets to an empty array to avoid further issues
        tickets = [];
      }
      // Calculate ticket counts
      const ticketCounts = calculateTicketCounts(tickets, selectedUserIds);
      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(ticketCounts).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );

      // Sort the array based on ticket counts
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });
      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = ticketCounts[ownerId];

        return {
          name: user.fullName,
          count: count || 0, // Set count to 0 if not found in ticketCounts
        };
      });

      const title =
        'View the total number of tickets closed by their assigned owner';
      const data = Object.values(sort).map((t: any) => t.count);
      const labels = Object.values(sort).map((t: any) => t.name);

      const datasets = { title, data, labels };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
    ],
  },
  {
    templateType: 'TicketTotalsByStatus',
    name: 'Ticket totals by status',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const tickets = await models?.Tickets.find({}).lean();
      const ticketTotalsByStatus = calculateTicketTotalsByStatus(tickets);
      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(ticketTotalsByStatus).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([status, count]) => ({
          status,
          count,
        }),
      );
      const title =
        'View the total number of tickets in each part of your support queue';
      const labels = Object.values(countsArray).map((t: any) => t.status);
      const data = Object.values(countsArray).map((t: any) => t.count);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [],
  },
  {
    templateType: 'TicketTotalsByLabelPriorityTag',
    name: 'Ticket totals by label/priority/tag/',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

    getChartResult: async (filter: any, subdomain: string) => {
      const query = {
        labelIds: { $in: filter.labelIds },
        tagIds: { $in: filter.tagIds },
        priority: filter.priority,
      } as any;

      const tickets = await models?.Tickets.find().lean();
      try {
        if (!Array.isArray(tickets)) {
          throw new Error('Invalid data: tickets is not an array.');
        }

        // Calculate ticket totals by label, priority, and tag
        const ticketTotals = calculateTicketTotalsByLabelPriorityTag(tickets);
        let labelIds: string[] = [];
        let tagIds: string[] = [];
        let priorities: string[] = [];

        Object.entries(ticketTotals).forEach(([key, value]) => {
          if (key.startsWith('labelIds:')) {
            labelIds.push(key.replace('labelIds:', ''));
          } else if (key.startsWith('tagIds:')) {
            tagIds.push(key.replace('tagIds:', ''));
          } else if (key.startsWith('priority:')) {
            priorities.push(key.replace('priority:', ''));
          }
        });

        // Remove single quotes from both tagIds and labelIds
        tagIds = tagIds.map((tagId) => tagId.replace(/'/g, ''));
        labelIds = labelIds.map((labelId) => labelId.replace(/'/g, ''));
        priorities = priorities.map((priority) => priority.replace(/'/g, ''));

        const tagInfo = await sendTagsMessage({
          subdomain,
          action: 'find',
          data: {
            _id: { $in: tagIds || [] },
          },
          isRPC: true,
          defaultValue: [],
        });
        const tagNames = tagInfo.map((tag) => tag.name);

        const labels = await models?.PipelineLabels.find({
          _id: { $in: labelIds },
        });
        if (!labels || labels.length === 0) {
          // Handle the case where no labels are found
          return { title: '', data: [], labels: [] };
        }
        // Adjust the property names based on your actual data structure
        const labelNames = labels.map((label) => label.name);

        // Combine labelNames with tagNames and other keys
        const allLabels = [...priorities, ...labelNames, ...tagNames];

        // Remove additional characters from labels and tags
        const simplifiedLabels = allLabels.map((label) =>
          label.replace(/(labelIds:|tagIds:|')/g, ''),
        );

        const title =
          '  View the total number of ticket totals by label/priority/tag/ ';

        // Assuming you have a relevant property for the chart data
        const data = Object.values(ticketTotals);

        // Combine the arrays into datasets
        const datasets = { title, data, labels: simplifiedLabels };

        return datasets;
      } catch (error) {
        console.error('Error fetching tickets:', error);

        // Handle the error or return an appropriate response.
        // For example, you might set datasets to an empty array to avoid further issues
        return { title: '', data: [], labels: [] };
      }
    },
    filterTypes: [
      {
        fieldName: 'labelIds',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select label',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select priority',
      },
      {
        fieldName: 'tags',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },
  {
    templateType: 'TicketTotalsOverTime',
    name: 'Ticket totals over time',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const totalTicked = await models?.Tickets.find({}).sort({
        createdAt: -1,
      });

      const monthNames: string[] = [];
      const monthlyTickedCount: number[] = [];

      if (totalTicked) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalTicked.at(-1)?.createdAt || endOfYear),
        );

        let startRange = dayjs(startOfYear);

        while (startRange < endRange) {
          monthNames.push(startRange.format('MMMM'));

          const getStartOfNextMonth = startRange.add(1, 'month').toDate();
          const getTickedCountOfMonth = totalTicked.filter(
            (ticked) =>
              new Date(ticked.createdAt || '').getTime() >=
                startRange.toDate().getTime() &&
              new Date(ticked.createdAt || '').getTime() <
                getStartOfNextMonth.getTime(),
          );
          monthlyTickedCount.push(getTickedCountOfMonth.length);
          startRange = startRange.add(1, 'month');
        }
      }
      const label = 'View the total number of tickets created over a set time';
      const datasets = [
        { label, data: monthlyTickedCount, labels: monthNames },
      ];
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'createdAt',
        fieldType: 'select',
        fieldQuery: 'createdAt',
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'TicketAverageTimeToCloseByRep',
    name: 'Ticket average time to close by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const selectedUserIds = filter.assignedUserIds || [];
      let tickets;
      try {
        if (selectedUserIds.length === 0) {
          // No selected users, so get all tickets
          tickets = await models?.Tickets.find({
            isComplete: true,
          })
            .lean()
            .limit(30);
        } else {
          // Filter tickets based on selectedUserIds
          tickets = await models?.Tickets.find({
            assignedUserIds: {
              $in: selectedUserIds,
            },
            isComplete: true,
          }).lean();
        }

        // Check if the returned value is not an array
        if (!Array.isArray(tickets)) {
          throw new Error('Invalid data: tickets is not an array.');
        }

        // Continue processing tickets...
      } catch (error) {
        console.error('Error fetching tickets:', error);

        // Handle the error or return an appropriate response.
        // For example, you might set tickets to an empty array to avoid further issues
        tickets = [];
      }

      const ticketData = await calculateAverageTimeToCloseUser(
        tickets,
        selectedUserIds,
      );

      const getTotalAssignedUsers = await Promise.all(
        tickets.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.assignedUserIds,
                },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }),
      );

      const result: any[] = [];

      for (const assignedUser of getTotalAssignedUsers) {
        assignedUser.map((itemsAdd) => {
          const ticket = ticketData?.find((item) =>
            item.assignedUserIds.includes(itemsAdd._id),
          );

          if (ticket) {
            result.push({
              timeDifference: ticket.timeDifference,
              assignedUserIds: ticket.assignedUserIds,
              FullName: itemsAdd.details?.fullName || '',
            });
          }
        });
      }

      const data = Object.values(result).map((t: any) => t.timeDifference);
      const labels = Object.values(result).map((t: any) => t.FullName);

      const title =
        'View the average amount of time it takes for a rep to close a ticket';

      const datasets = {
        title,
        data,
        labels,
      };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        fieldQuery: 'users',
        fieldLabel: 'Select assigned user',
      },
    ],
  },
  {
    templateType: 'TicketTotalsBySource',
    name: 'Ticket totals by source',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Table
    getChartResult: async () => {
      const ticket = await models?.Tickets.find({
        sourceConversationIds: { $exists: true, $ne: [] },
      }).lean();
      if (!ticket || ticket.length === 0) {
        console.error(
          'No ticket found in the database matching the specified criteria.',
        );
        // Handle the case when no items are found
        return null; // or some default value
      }
      const data = [ticket.length];
      const labels = ['total'];
      const title = 'Ticket totals by source';

      const datasets = [{ title, data, labels }];
      return datasets;
    },
    filterTypes: [],
  },

  {
    templateType: 'TicketAverageTimeToClose',
    name: 'Ticket average time to close',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Table
    getChartResult: async () => {
      const ticket = await models?.Tickets.find({
        isComplete: true,
      }).lean();
      if (!ticket || ticket.length === 0) {
        console.error(
          'No ticket found in the database matching the specified criteria.',
        );
        // Handle the case when no items are found
        return null; // or some default value
      }
      const data = await calculateAverageTimeToClose(ticket);

      const labels = data.map((duration) => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        return `${hours}h ${minutes}m ${seconds}s`;
      });
      const title =
        'View the average amount of time it takes for your reps to close tickets';

      // const datasets = [{ label, data: ticketData, labels }];
      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [],
  },

  {
    templateType: 'dealsChart',
    name: 'Deals chart',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string,
    ) => {
      // demonstration filters
      const dateRange = filter.dateRange;
      const currentDate = new Date(); // Replace this with the actual current date if needed
      const dateCondition = createDateCondition(dateRange, currentDate);
      const getTotalAssignedUserIds: string[] = [];
      let matchDate;
      let totalDeals;

      if (Object.keys(dateCondition).length > 0) {
        matchDate = { createdAt: dateCondition };
      }

      if (
        matchDate === undefined ||
        dateRange === 'all' ||
        dateRange === undefined
      ) {
        totalDeals = await models?.Deals.find({
          assignedUserIds: { $exists: true },
        }).lean();
      } else {
        totalDeals = await models?.Deals.find({
          ...matchDate, // Spread the matchDate object
          assignedUserIds: { $exists: true },
        }).lean();
      }

      if (totalDeals) {
        for (const deal of totalDeals) {
          if (deal.assignedUserIds) {
            getTotalAssignedUserIds.push(...deal.assignedUserIds);
          }
        }
      }

      const totalAssignedUserIds = new Set(getTotalAssignedUserIds);

      const DEFAULT_FILTER = {
        assignedUserIds: Array.from(totalAssignedUserIds),
        userId: currentUser._id,
        pipelineId: getDefaultPipelineId,
      };

      const query = {
        assignedUserIds: { $in: DEFAULT_FILTER.assignedUserIds },
        pipelineId: DEFAULT_FILTER.pipelineId,
      } as any;

      if (filter && filter.assignedUserIds) {
        query.assignedUserIds.$in = filter.assignedUserIds;
      }

      if (filter && filter.pipelineId) {
        query.pipelineId = filter.pipelineId;
      }

      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: query.assignedUserIds.$in } },
        },
        isRPC: true,
        defaultValue: [],
      });

      const assignedUsersMap = {};
      const deals = await models?.Deals.find(query);

      for (const assignedUser of getTotalAssignedUsers) {
        assignedUsersMap[assignedUser._id] = {
          fullName: assignedUser.details?.fullName,
          assignedDealsCount: deals?.filter(
            (deal) => deal.assignedUserIds?.includes(assignedUser._id),
          ).length,
        };
      }

      const data = Object.values(assignedUsersMap).map(
        (t: any) => t.assignedDealsCount,
      );
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName,
      );

      const title = 'Deals chart by assigned users';

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'assignedDepartmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select assigned departments',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'dealsChartByMonth',
    name: 'Deals chart by month',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string,
    ) => {
      const totalDeals = await models?.Deals.find({}).sort({ createdAt: -1 });
      const monthNames: string[] = [];
      const monthlyDealsCount: number[] = [];

      if (totalDeals) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalDeals.at(-1)?.createdAt || endOfYear),
        );

        let startRange = dayjs(startOfYear);

        while (startRange < endRange) {
          monthNames.push(startRange.format('MMMM'));

          const getStartOfNextMonth = startRange.add(1, 'month').toDate();
          const getDealsCountOfMonth = totalDeals.filter(
            (deal) =>
              new Date(deal.createdAt || '').getTime() >=
                startRange.toDate().getTime() &&
              new Date(deal.createdAt || '').getTime() <
                getStartOfNextMonth.getTime(),
          );
          monthlyDealsCount.push(getDealsCountOfMonth.length);
          startRange = startRange.add(1, 'month');
        }
      }

      const title = 'Deals count by created month';
      const datasets = { title, data: monthlyDealsCount, labels: monthNames };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'date',
        fieldQuery: 'createdAt',
        fieldLabel: 'Date range',
      },
    ],
  },
];

const getChartResult = async ({ subdomain, data }) => {
  const { templateType, filter, currentUser } = data;

  const template =
    chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

  return template.getChartResult(filter, subdomain, currentUser);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult,
};

function taskClosedByRep(tickets: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const ticketCounts: Record<string, number> = {};

  // Check if tickets is an array
  if (!Array.isArray(tickets)) {
    console.error('Invalid input: tickets should be an array.');
    return ticketCounts;
  }

  tickets.forEach((ticket) => {
    const labelIds = (ticket.labelIds as string[]) || [];

    if (labelIds.length === 0) {
      return;
    }
    labelIds.forEach((ownerId) => {
      ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
    });
  });

  return ticketCounts;
}

function taskClosedByTagsRep(tasks: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const ticketCounts: Record<string, number> = {};

  // Check if tickets is an array
  if (!Array.isArray(tasks)) {
    console.error('Invalid input: tasks should be an array.');
    return ticketCounts;
  }

  tasks.forEach((ticket) => {
    const tagIds = (ticket.tagIds as string[]) || [];

    if (tagIds.length === 0) {
      return;
    }
    tagIds.forEach((ownerId) => {
      ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
    });
  });

  return ticketCounts;
}

function departmentCount(tasks: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const taskCounts: Record<string, number> = {};

  // Check if tasks is an array
  if (!Array.isArray(tasks)) {
    console.error('Invalid input: tasks should be an array.');
    return taskCounts;
  }

  tasks.forEach((task) => {
    const tagIds = (task.departmentIds as string[]) || [];

    if (tagIds.length === 0) {
      return;
    }
    tagIds.forEach((ownerId) => {
      taskCounts[ownerId] = (taskCounts[ownerId] || 0) + 1;
    });
  });

  return taskCounts;
}

function calculateTicketCounts(tickets: any, selectedUserIds: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const ticketCounts: Record<string, number> = {};

  // Check if tickets is an array
  if (!Array.isArray(tickets)) {
    console.error('Invalid input: tickets should be an array.');
    return ticketCounts;
  }
  if (selectedUserIds.length > 0) {
    selectedUserIds.forEach((userId) => {
      ticketCounts[userId] = 0;
    });
  }

  tickets.forEach((ticket) => {
    const assignedUserIds = (ticket.assignedUserIds as string[]) || [];

    if (assignedUserIds.length === 0) {
      return;
    }
    if (selectedUserIds.length > 0) {
      assignedUserIds.forEach((ownerId) => {
        if (selectedUserIds.includes(ownerId)) {
          ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
        }
      });
    } else {
      assignedUserIds.forEach((ownerId) => {
        ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
      });
    }
  });

  return ticketCounts;
}

function amountProductData(deals: any[]): Promise<any[]> {
  return new Promise((resolve) => {
    const repAmounts: Record<string, any> = {};

    deals.forEach((deal) => {
      if (deal.productsData) {
        const productsData = deal.productsData;
        productsData.forEach((product) => {
          if (product.amount) {
            if (!repAmounts[deal.stageId]) {
              repAmounts[deal.stageId] = {
                totalAmount: 0,
                stageId: deal.stageId,
              };
            }

            repAmounts[deal.stageId].totalAmount += product.amount;
          }
        });
      }
    });

    // Convert the repAmounts object into an array
    const resultArray = Object.values(repAmounts);

    resolve(resultArray);
  });
}

// Function to calculate the average deal amounts by rep
function calculateAverageDealAmountByRep(deals: any, selectedUserIds: any) {
  const repAmounts = {};
  const dealCounts: Record<string, number> = {};

  if (selectedUserIds.length > 0) {
    selectedUserIds.forEach((userId) => {
      repAmounts[userId] = { totalAmount: 0, count: 0 };
      dealCounts[userId] = 0;
    });
  }
  deals.forEach((deal) => {
    if (deal.productsData && deal.status === 'active') {
      const productsData = deal.productsData;

      productsData.forEach((product) => {
        if (deal.assignedUserIds && product.amount) {
          const assignedUserIds = deal.assignedUserIds;
          if (selectedUserIds.length > 0) {
            assignedUserIds.forEach((userId) => {
              if (selectedUserIds.includes(userId)) {
                repAmounts[userId] = repAmounts[userId] || {
                  totalAmount: 0,
                  count: 0,
                };
                repAmounts[userId].totalAmount += product.amount;
                repAmounts[userId].count += 1;

                // If you want counts for each user, increment the deal count
                dealCounts[userId] = (dealCounts[userId] || 0) + 1;
              }
            });
          } else {
            assignedUserIds.forEach((userId) => {
              repAmounts[userId] = repAmounts[userId] || {
                totalAmount: 0,
                count: 0,
              };
              repAmounts[userId].totalAmount += product.amount;
              repAmounts[userId].count += 1;
            });
          }
        }
      });
    }
  });

  const result: Array<{ userId: string; amount: string }> = [];

  // tslint:disable-next-line:forin
  for (const userId in repAmounts) {
    const totalAmount = repAmounts[userId].totalAmount;
    const count = repAmounts[userId].count;
    const averageAmount = count > 0 ? totalAmount / count : 0;

    result.push({ userId, amount: averageAmount.toFixed(3) });
  }

  return result;
}

function calculateTicketTotalsByStatus(tickets: any) {
  const ticketTotals = {};

  // Loop through tickets
  tickets.forEach((ticket) => {
    const status = ticket.status;

    // Check if status exists
    if (status !== undefined && status !== null) {
      // Initialize or increment status count
      ticketTotals[status] = (ticketTotals[status] || 0) + 1;
    }
  });

  // Return the result
  return ticketTotals;
}

function calculateTicketTotalsByLabelPriorityTag(tickets: any) {
  return tickets.reduce((ticketTotals: Record<string, number>, ticket) => {
    const labels = ticket.labelIds || [];
    const priority = ticket.priority || 'Default'; // Replace 'Default' with the default priority if not available
    const tags = ticket.tagIds || [];
    // Increment counts for each label
    labels.forEach((label) => {
      const labelKey = `labelIds:'${label}'`;
      ticketTotals[labelKey] = (ticketTotals[labelKey] || 0) + 1;
    });
    // Increment counts for each priority
    const priorityKey = `priority:'${priority}'`;
    ticketTotals[priorityKey] = (ticketTotals[priorityKey] || 0) + 1;

    // Increment counts for each tag
    tags.forEach((tag) => {
      const tagKey = `tagIds:'${tag}'`;
      ticketTotals[tagKey] = (ticketTotals[tagKey] || 0) + 1;
    });

    return ticketTotals;
  }, {});
}

const calculateAverageTimeToClose = (tickets) => {
  // Filter out tickets without close dates
  const closedTickets = tickets.filter(
    (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
  );

  if (closedTickets.length === 0) {
    console.error('No closed tickets found.');
    return null;
  }

  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTickets.map((ticketItem) => {
    const createdAt = new Date(ticketItem.createdAt).getTime();
    const modifiedAt = new Date(ticketItem.modifiedAt).getTime();

    // Check if both dates are valid
    if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
      return modifiedAt - createdAt;
    } else {
      console.error('Invalid date format for a ticket:', ticketItem);
      return null;
    }
  });

  // Filter out invalid date differences
  const validTimeToCloseArray = timeToCloseArray.filter(
    (time) => time !== null,
  );

  if (validTimeToCloseArray.length === 0) {
    console.error('No valid time differences found.');
    return null;
  }

  const timeToCloseInHoursArray = validTimeToCloseArray.map((time) =>
    (time / (1000 * 60 * 60)).toFixed(3),
  );

  return timeToCloseInHoursArray;
};
function convertHoursToHMS(durationInHours) {
  const hours = Math.floor(durationInHours);
  const minutes = Math.floor((durationInHours - hours) * 60);
  const seconds = Math.floor(((durationInHours - hours) * 60 - minutes) * 60);

  return { hours, minutes, seconds };
}
const taskAverageTimeToCloseByLabel = async (tasks) => {
  const closedTasks = tasks.filter(
    (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
  );

  if (closedTasks.length === 0) {
    console.error('No closed Tasks found.');
    return null;
  }

  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTasks.map((ticketItem) => {
    const createdAt = new Date(ticketItem.createdAt).getTime();
    const modifiedAt = new Date(ticketItem.modifiedAt).getTime();

    // Check if both dates are valid
    if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
      return {
        timeDifference: modifiedAt - createdAt,
        stageId: ticketItem.stageId, // Include assignedUserIds
        labelIds: ticketItem.labelIds,
        tagIds: ticketItem.tagIds,
      };
    } else {
      console.error('Invalid date format for a ticket:', ticketItem);
      return null;
    }
  });

  // Filter out invalid date differences
  const validTimeToCloseArray = timeToCloseArray.filter(
    (time) => time !== null,
  );

  if (validTimeToCloseArray.length === 0) {
    console.error('No valid time differences found.');
    return null;
  }

  const timeToCloseInHoursArray = validTimeToCloseArray.map((time) => ({
    timeDifference: (time.timeDifference / (1000 * 60 * 60)).toFixed(3),
    stageId: time.stageId, // Include assignedUserIds
    labelIds: time.labelIds,
    tagIds: time.tagIds,
  }));

  return timeToCloseInHoursArray;
};

const calculateAverageTimeToCloseUser = (
  tickets: any,
  selectedUserIds: any,
) => {
  // Filter out tickets without close dates
  const closedTickets = tickets.filter(
    (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
  );

  if (closedTickets.length === 0) {
    console.error('No closed tickets found.');
    return null;
  }
  if (selectedUserIds.length > 0) {
    selectedUserIds.forEach((userId) => {
      closedTickets[userId] = 0;
    });
  }
  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTickets.map((ticketItem) => {
    const createdAt = new Date(ticketItem.createdAt).getTime();
    const modifiedAt = new Date(ticketItem.modifiedAt).getTime();
    const user_id = ticketItem.assignedUserIds;

    if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
      if (selectedUserIds.length > 0) {
        const matchingUserIds = user_id.filter((result) =>
          selectedUserIds.includes(result),
        );
        return {
          timeDifference: modifiedAt - createdAt,
          assignedUserIds: matchingUserIds, // Include assignedUserIds
        };
      } else {
        return {
          timeDifference: modifiedAt - createdAt,
          assignedUserIds: user_id, // Include assignedUserIds
        };
      }
    } else {
      console.error('Invalid date format for a ticket:', ticketItem);
      return null;
    }
  });

  // Filter out invalid date differences
  const validTimeToCloseArray = timeToCloseArray.filter(
    (time) => time !== null,
  );

  if (validTimeToCloseArray.length === 0) {
    console.error('No valid time differences found.');
    return null;
  }

  // Calculate the sum of timeDifference for each unique user
  const userTotals = {};

  validTimeToCloseArray.forEach((entry) => {
    if (entry !== null) {
      entry.assignedUserIds.forEach((userId) => {
        userTotals[userId] = (userTotals[userId] || 0) + entry.timeDifference;
      });
    }
  });

  const resultArray = Object.entries(userTotals).map(
    (
      value: [string, unknown],
      index: number,
      array: Array<[string, unknown]>,
    ) => {
      const [userId, timeDifferenceSum] = value;
      return {
        timeDifference: (timeDifferenceSum as number).toFixed(3),
        assignedUserIds: [userId],
      };
    },
  );
  return resultArray;
};

function sumCountsByUserIdName(inputArray: any[]) {
  const resultMap = new Map<
    string,
    { count: number; fullName: string; _id: string }
  >();

  inputArray.forEach((userEntries) => {
    userEntries.forEach((entry) => {
      const userId = entry._id;
      const count = entry.count;

      if (resultMap.has(userId)) {
        resultMap.get(userId)!.count += count;
      } else {
        resultMap.set(userId, {
          count,
          fullName: entry.FullName,
          _id: entry._id,
        });
      }
    });
  });

  return Array.from(resultMap.values());
}

function stageChangedDate(ticked: any[]) {
  const resultMap = new Map<
    string,
    { date: string; name: string; _id: string }
  >(
    Array.from(ticked, (t) => [
      t._id,
      {
        _id: t._id,
        name: t.name,
        date: new Date(t.stageChangedDate).toLocaleString(),
      },
    ]),
  );

  return Array.from(resultMap.values());
}

function createDateCondition(dateRange, currentDate) {
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  let dateCondition;

  switch (dateRange) {
    case 'today':
      dateCondition = {
        $gte: startOfDay(currentDate),
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      };
      break;
    case 'yesterday':
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      dateCondition = {
        $gte: startOfDay(yesterday),
        $lt: startOfDay(currentDate),
      };
      break;
    case 'thisweek':
      dateCondition = {
        $gte: startOfDay(currentDate),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 7,
        ),
      };
      break;
    case 'lastweek':
      const lastWeekStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7,
      );
      const lastWeekEndDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );
      dateCondition = {
        $gte: startOfDay(lastWeekStartDate),
        $lt: startOfDay(lastWeekEndDate),
      };
      break;
    case 'all':
    case undefined:
      // No date condition for 'All Time'
      dateCondition = {};
      break;
    default:
      // Handle unknown cases or provide a default behavior
      console.log('Unknown date range:', dateRange);
      break;
  }

  return dateCondition;
}
