import { IUserDocument } from '@erxes/api-utils/src/types';
import { models } from './connectionResolver';
import { sendCoreMessage, sendTagsMessage } from './messageBroker';
import * as dayjs from 'dayjs';
import { PRIORITIES } from './constants';

const reportTemplates = [
  {
    serviceType: 'deal',
    title: 'Deals chart',
    serviceName: 'cards',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    charts: ['dealsChart', 'dealsChartByMonth'],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png'
  },
  {
    serviceType: 'task',
    title: 'Tasks chart',
    serviceName: 'cards',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    charts: ['dealsChart', 'dealsChartByMonth'],
    img: 'https://cdn.mos.cms.futurecdn.net/S5bicwPe8vbP9nt3iwAwwi.jpg'
  },
  {
    serviceType: 'ticket',
    title: 'Tickets chart',
    serviceName: 'cards',
    description:
      ' 1:Average time to respond:This report shows the average time to respond to tickets over the selected time range. 2:Ticket average response time by source with time comparison :View the average amount of time it takes for a rep to respond to a ticket by the source. See this across chats, emails, and calls. 3:Ticket average time to close:View the average amount of time it takes for your reps to close tickets. 4:Ticket average time to close by rep:View the average amount of time it takes for a rep to close a ticket. See which reps close tickets the fastest. 5:Ticket average time to close over time:View the average amount of time it takes your reps to close tickets. See how this tracks over time. 6::View the total number of tickets closed by their assigned owner. See which reps are closing the most and least amount of tickets. 7:Ticket totals by source:View the total number of tickets coming from each source. See which channels are getting the most volume. 8:Ticket totals by status :View the total number of tickets in each part of your support queue. See how many tickets are new, closed, and more. 9:Ticket totals over time:View the total number of tickets created over a set time. See how it compares to a previous period of time. 10:Ticket totals by label/priority/tag :View the total number of tickets by label/priority/tag.  ',
    charts: [
      'TicketAverageTimeToCloseOverTime',
      'TicketClosedTotalsByRep',
      'TicketTotalsByStatus',
      'TicketTotalsByLabelPriorityTag',
      'TicketTotalsOverTime',
      'TicketAverageTimeToCloseByEep',
      'TicketAverageTimeToClose',
      'TicketTotalsBySource'
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png'
  }
];

const chartTemplates = [
  {
    templateType: 'TicketTotalsBySource',
    name: 'Ticket totals by source',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async () => {
      // progress
      // const ticket = await models?.Tickets.find({
      //   isComplete: true
      // }).lean();
      // if (!ticket || ticket.length === 0) {
      //   console.error(
      //     'No ticket found in the database matching the specified criteria.'
      //   );
      //   // Handle the case when no items are found
      //   return null; // or some default value
      // }
      // const title =
      //   'View the average amount of time it takes your reps to close tickets. See how this tracks over time.';
      // const ticketData = await calculateAverageTimeToClose(ticket);
      // const labels = ticketData.map((duration) => {
      //   const { hours, minutes, seconds } = convertHoursToHMS(duration);
      //   return `${hours}h ${minutes}m ${seconds}s`;
      // });
      // const datasets = { title, ticketData, labels };
      // return datasets;
    },
    filterTypes: []
  },

  {
    templateType: 'TicketAverageTimeToCloseOverTime',
    name: 'Ticket average time to close over time',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async () => {
      const ticket = await models?.Tickets.find({
        isComplete: true
      }).lean();
      if (!ticket || ticket.length === 0) {
        console.error(
          'No ticket found in the database matching the specified criteria.'
        );
        // Handle the case when no items are found
        return null; // or some default value
      }

      const title =
        'View the average amount of time it takes your reps to close tickets. See how this tracks over time.';
      const ticketData = await calculateAverageTimeToClose(ticket);
      const labels = ticketData.map(duration => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        return `${hours}h ${minutes}m ${seconds}s`;
      });

      const datasets = { title, ticketData, labels };

      return datasets;
    },
    filterTypes: []
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
            isComplete: true
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
      const ticketCounts = calculateTicketCounts(tickets);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(ticketCounts).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count
        })
      );

      // Sort the array based on ticket counts
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map(item => item.ownerId);

      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } }
        },
        isRPC: true,
        defaultValue: []
      });

      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const title =
        'View the total number of tickets closed by their assigned owner';
      const data = countsArray.map(item => item.count);

      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName
      );

      const datasets = { title, data, labels };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users'
      }
    ]
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
          count
        })
      );
      const title =
        'View the total number of tickets in each part of your support queue';
      const labels = Object.values(countsArray).map((t: any) => t.status);
      const data = Object.values(countsArray).map((t: any) => t.count);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: []
  },
  {
    templateType: 'TicketTotalsByLabelPriorityTag',
    name: 'Ticket totals by label/priority/tag/',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

    getChartResult: async (filter: any, subdomain: string) => {
      const query = {
        labelIds: { $in: filter.labelIds },
        tagIds: { $in: filter.tagIds },
        priority: filter.priority
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
        tagIds = tagIds.map(tagId => tagId.replace(/'/g, ''));
        labelIds = labelIds.map(labelId => labelId.replace(/'/g, ''));
        priorities = priorities.map(priority => priority.replace(/'/g, ''));

        const tagInfo = await sendTagsMessage({
          subdomain,
          action: 'find',
          data: {
            _id: { $in: tagIds || [] }
          },
          isRPC: true,
          defaultValue: []
        });
        const tagNames = tagInfo.map(tag => tag.name);

        const labels = await models?.PipelineLabels.find({
          _id: { $in: labelIds }
        });
        if (!labels || labels.length === 0) {
          // Handle the case where no labels are found
          return { title: '', data: [], labels: [] };
        }
        // Adjust the property names based on your actual data structure
        const labelNames = labels.map(label => label.name);

        // Combine labelNames with tagNames and other keys
        const allLabels = [...priorities, ...labelNames, ...tagNames];

        // Remove additional characters from labels and tags
        const simplifiedLabels = allLabels.map(label =>
          label.replace(/(labelIds:|tagIds:|')/g, '')
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
    /// not working filter type
    filterTypes: [
      {
        fieldName: 'name',
        fieldType: 'select',
        fieldQuery: 'pipeline_labels',
        fieldLabel: 'Select Labels'
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldLabel: 'Select tag'
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        fieldQuery: PRIORITIES.ALL.map(priority => ({
          value: priority.name,
          label: priority.name,
          color: priority.color
        })),
        fieldLabel: 'Select priority'
      }
    ]
  },
  {
    templateType: 'TicketTotalsOverTime',
    name: 'Ticket totals over time',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const totalTicked = await models?.Tickets.find({}).sort({
        createdAt: -1
      });
      const monthNames: string[] = [];
      const monthlyTickedCount: number[] = [];

      if (totalTicked) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalTicked.at(-1)?.createdAt || endOfYear)
        );

        let startRange = dayjs(startOfYear);

        while (startRange < endRange) {
          monthNames.push(startRange.format('MMMM'));

          const getStartOfNextMonth = startRange.add(1, 'month').toDate();
          const getTickedCountOfMonth = totalTicked.filter(
            ticked =>
              new Date(ticked.createdAt || '').getTime() >=
                startRange.toDate().getTime() &&
              new Date(ticked.createdAt || '').getTime() <
                getStartOfNextMonth.getTime()
          );
          monthlyTickedCount.push(getTickedCountOfMonth.length);
          startRange = startRange.add(1, 'month');
        }
      }
      const label = 'View the total number of tickets created over a set time';
      const datasets = [
        { label, data: monthlyTickedCount, labels: monthNames }
      ];
      return datasets;
    },
    /// filterType not working
    filterTypes: [
      {
        fieldName: 'createdAt',
        fieldType: 'select',
        fieldQuery: 'createdAt',
        fieldLabel: 'Select date range'
      }
    ]
  },
  {
    templateType: 'TicketAverageTimeToCloseByEep',
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
            isComplete: true
          }).lean();
        } else {
          // Filter tickets based on selectedUserIds
          tickets = await models?.Tickets.find({
            assignedUserIds: {
              $in: selectedUserIds
            },
            isComplete: true
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

      const ticketData = await calculateAverageTimeToCloseUser(tickets);
      // progress
      const getTotalAssignedUsers = await Promise.all(
        tickets.map(async result => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.assignedUserIds[0]
                }
              }
            },
            isRPC: true,
            defaultValue: []
          });
        })
      );

      const assignedUsersMap = {};

      let index = 0;
      for (const assignedUsers of getTotalAssignedUsers) {
        for (const assignedUser of assignedUsers) {
          assignedUsersMap[assignedUser._id] = {
            fullName: assignedUser.details?.fullName,
            time: ticketData[index++] ? ticketData[index - 1].timeDifference : 0
          };
        }
      }

      const data = Object.values(assignedUsersMap).map((t: any) => t.time);
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName
      );

      const title =
        'View the average amount of time it takes for a rep to close a ticket';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        fieldQuery: 'users',
        fieldLabel: 'Select assigned user'
      }
    ]
  },
  {
    templateType: 'TicketAverageTimeToClose',
    name: 'Ticket average time to close',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Table
    getChartResult: async () => {
      const ticket = await models?.Tickets.find({
        isComplete: true
      }).lean();
      if (!ticket || ticket.length === 0) {
        console.error(
          'No ticket found in the database matching the specified criteria.'
        );
        // Handle the case when no items are found
        return null; // or some default value
      }
      const data = await calculateAverageTimeToClose(ticket);

      const labels = data.map(duration => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        return `${hours}h ${minutes}m ${seconds}s`;
      });
      const title =
        'View the average amount of time it takes for your reps to close tickets';

      // const datasets = [{ label, data: ticketData, labels }];
      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: []
  },

  {
    templateType: 'dealsChart',
    name: 'Deals chart',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string
    ) => {
      // demonstration filters
      const getTotalAssignedUserIds: string[] = [];

      const totalDeals = await models?.Deals.find({
        assignedUserIds: { $exists: true }
      });

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
        pipelineId: getDefaultPipelineId
      };

      const query = {
        assignedUserIds: { $in: DEFAULT_FILTER.assignedUserIds },
        pipelineId: DEFAULT_FILTER.pipelineId
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
          query: { _id: { $in: query.assignedUserIds.$in } }
        },
        isRPC: true,
        defaultValue: []
      });

      const assignedUsersMap = {};

      const deals = await models?.Deals.find(query);

      for (const assignedUser of getTotalAssignedUsers) {
        assignedUsersMap[assignedUser._id] = {
          fullName: assignedUser.details?.fullName,
          assignedDealsCount: deals?.filter(deal =>
            deal.assignedUserIds?.includes(assignedUser._id)
          ).length
        };
      }

      const data = Object.values(assignedUsersMap).map(
        (t: any) => t.assignedDealsCount
      );
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName
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
        fieldLabel: 'Select assigned users'
      },
      {
        fieldName: 'assignedDepartmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select assigned departments'
      },
      {
        fieldName: 'dateRange',
        fieldType: 'date',
        fieldQuery: 'createdAt',
        fieldLabel: 'Select date range'
      }
    ]
  },
  {
    templateType: 'dealsChartByMonth',
    name: 'Deals chart by month',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser: IUserDocument,
      getDefaultPipelineId?: string
    ) => {
      const totalDeals = await models?.Deals.find({}).sort({ createdAt: -1 });
      const monthNames: string[] = [];
      const monthlyDealsCount: number[] = [];

      if (totalDeals) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalDeals.at(-1)?.createdAt || endOfYear)
        );

        let startRange = dayjs(startOfYear);

        while (startRange < endRange) {
          monthNames.push(startRange.format('MMMM'));

          const getStartOfNextMonth = startRange.add(1, 'month').toDate();
          const getDealsCountOfMonth = totalDeals.filter(
            deal =>
              new Date(deal.createdAt || '').getTime() >=
                startRange.toDate().getTime() &&
              new Date(deal.createdAt || '').getTime() <
                getStartOfNextMonth.getTime()
          );
          monthlyDealsCount.push(getDealsCountOfMonth.length);
          startRange = startRange.add(1, 'month');
        }
      }

      const label = 'Deals count by created month';
      const datasets = [{ label, data: monthlyDealsCount, labels: monthNames }];
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'date',
        fieldQuery: 'createdAt',
        fieldLabel: 'Date range'
      }
    ]
  }
];

const getChartResult = async ({ subdomain, data }) => {
  const { templateType, filter, currentUser } = data;

  const template =
    chartTemplates.find(t => t.templateType === templateType) || ({} as any);

  return template.getChartResult(filter, subdomain, currentUser);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult
};

function calculateTicketCounts(tickets: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const ticketCounts: Record<string, number> = {};

  // Check if tickets is an array
  if (!Array.isArray(tickets)) {
    console.error('Invalid input: tickets should be an array.');
    return ticketCounts;
  }

  tickets.forEach(ticket => {
    const assignedUserIds = (ticket.assignedUserIds as string[]) || [];

    if (assignedUserIds.length === 0) {
      return;
    }

    assignedUserIds.forEach(ownerId => {
      ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
    });
  });

  return ticketCounts;
}

function calculateTicketTotalsByStatus(tickets: any) {
  const ticketTotals = {};

  // Loop through tickets
  tickets.forEach(ticket => {
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
    labels.forEach(label => {
      const labelKey = `labelIds:'${label}'`;
      ticketTotals[labelKey] = (ticketTotals[labelKey] || 0) + 1;
    });
    // Increment counts for each priority
    const priorityKey = `priority:'${priority}'`;
    ticketTotals[priorityKey] = (ticketTotals[priorityKey] || 0) + 1;

    // Increment counts for each tag
    tags.forEach(tag => {
      const tagKey = `tagIds:'${tag}'`;
      ticketTotals[tagKey] = (ticketTotals[tagKey] || 0) + 1;
    });

    return ticketTotals;
  }, {});
}
const calculateAverageTimeToClose = tickets => {
  // Filter out tickets without close dates
  const closedTickets = tickets.filter(
    ticketItem => ticketItem.modifiedAt && ticketItem.createdAt
  );

  if (closedTickets.length === 0) {
    console.error('No closed tickets found.');
    return null;
  }

  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTickets.map(ticketItem => {
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
  const validTimeToCloseArray = timeToCloseArray.filter(time => time !== null);

  if (validTimeToCloseArray.length === 0) {
    console.error('No valid time differences found.');
    return null;
  }

  const timeToCloseInHoursArray = validTimeToCloseArray.map(time =>
    (time / (1000 * 60 * 60)).toFixed(3)
  );

  return timeToCloseInHoursArray;
};
function convertHoursToHMS(durationInHours) {
  const hours = Math.floor(durationInHours);
  const minutes = Math.floor((durationInHours - hours) * 60);
  const seconds = Math.floor(((durationInHours - hours) * 60 - minutes) * 60);

  return { hours, minutes, seconds };
}

const calculateAverageTimeToCloseUser = tickets => {
  // Filter out tickets without close dates
  const closedTickets = tickets.filter(
    ticketItem => ticketItem.modifiedAt && ticketItem.createdAt
  );

  if (closedTickets.length === 0) {
    console.error('No closed tickets found.');
    return null;
  }

  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTickets.map(ticketItem => {
    const createdAt = new Date(ticketItem.createdAt).getTime();
    const modifiedAt = new Date(ticketItem.modifiedAt).getTime();

    // Check if both dates are valid
    if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
      return {
        timeDifference: modifiedAt - createdAt,
        assignedUserIds: ticketItem.assignedUserIds // Include assignedUserIds
      };
    } else {
      console.error('Invalid date format for a ticket:', ticketItem);
      return null;
    }
  });

  // Filter out invalid date differences
  const validTimeToCloseArray = timeToCloseArray.filter(time => time !== null);

  if (validTimeToCloseArray.length === 0) {
    console.error('No valid time differences found.');
    return null;
  }

  const timeToCloseInHoursArray = validTimeToCloseArray.map(time => ({
    timeDifference: (time.timeDifference / (1000 * 60 * 60)).toFixed(3),
    assignedUserIds: time.assignedUserIds // Include assignedUserIds
  }));

  return timeToCloseInHoursArray;
};
