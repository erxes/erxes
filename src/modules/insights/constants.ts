export const INSIGHT_TYPES = {
  INBOX: 'inbox',
  DEAL: 'deal',
  ALL: ['inbox', 'deal']
};

export const INBOX_INSIGHTS = [
  {
    name: 'Volume Report',
    image: '/images/icons/erxes-19.svg',
    to: '/inbox/insights/volume-report',
    desc: `Total conversation's session count, made with customers through every integration`
  },
  {
    name: 'Response Report',
    image: '/images/icons/erxes-15.svg',
    to: '/inbox/insights/response-report',
    desc:
      'A report on the total number of customer feedback responses given by team members.'
  },
  {
    name: 'Response Close Report',
    image: '/images/icons/erxes-06.svg',
    to: '/inbox/insights/response-close-report',
    desc: `The average time a team member solved a customer's problem based on customer feedback.`
  },
  {
    name: 'First Response Report',
    image: '/images/icons/erxes-16.svg',
    to: '/inbox/insights/first-response',
    desc:
      'You can find stats that defines the average response time by each team member.'
  },
  {
    name: 'Volume Report By Customer',
    image: '/images/icons/erxes-23.svg',
    to: '/inbox/insights/summary-report',
    desc: 'Total messages count, sent by customers through every integration'
  },
  {
    name: 'Export Report',
    image: '/images/icons/erxes-22.svg',
    to: '/inbox/insights/export-report',
    desc: 'Download insight data as an excel sheet'
  }
];

export const DEAL_INSIGHTS = [
  {
    name: 'Deal Won Report',
    image: '/images/icons/deal-insight-won.svg',
    to: '/deal/insights/won',
    desc: 'Find feedback of won deals that has been created by team members.'
  },
  {
    name: 'Deal Lost Report',
    image: '/images/icons/deal-insight-lost.svg',
    to: '/deal/insights/lost',
    desc: 'Find feedback of lost deals that has been created by team members.'
  },
  {
    name: 'Deal Volume Report',
    image: '/images/icons/deal-insight-volume.svg',
    to: '/deal/insights/volume-report',
    desc: 'Find feedback that has been created by team members.'
  }
];
