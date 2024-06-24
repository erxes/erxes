import { dealCharts } from './deal'
import { taskCharts } from './task'
import { ticketCharts } from './ticket'

const chartTemplates = [
    ...dealCharts,
    ...taskCharts,
    ...ticketCharts,
]

export default chartTemplates;
