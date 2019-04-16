export const INSIGHT_TYPES = {
  INBOX: 'inbox',
  DEAL: 'deal',
  ALL: ['inbox', 'deal']
};

export const INBOX_INSIGHTS = [
  {
    name: 'Volume Report',
    image: '/images/icons/erxes-14.svg',
    to: '/insights/volume-report',
    desc:
      'Find feedback that has been gathered from various customer engagement channels.'
  },
  {
    name: 'Response Report',
    image: '/images/icons/erxes-15.svg',
    to: '/insights/response-report',
    desc:
      'A report on the total number of customer feedback responses given by team members.'
  },
  {
    name: 'Response Close Report',
    image: '/images/icons/erxes-17.svg',
    to: '/insights/response-close-report',
    desc: `The average time a team member solved a customer's problem based on customer feedback.`
  },
  {
    name: 'First Response Report',
    image: '/images/icons/erxes-16.svg',
    to: '/insights/first-response',
    desc:
      'You can find stats that defines the average response time by each team member.'
  },
  {
    name: 'Volume Report By Customer',
    image: '',
    to: '/insights/summary-report',
    desc: ''
  },
  {
    name: 'Export Report',
    image: '',
    to: '/insights/export-report',
    desc: ''
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
