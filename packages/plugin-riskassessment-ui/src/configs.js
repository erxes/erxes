module.exports = {
  name: 'riskassessment',
  port: 3012,
  scope: 'riskassessment',
  exposes: {
    './routes': './src/routes.tsx',
    './dealSection': './src/section/container/List.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'riskassessment',
    module: './routes'
  },
  menus: [
    {
      text: 'Risk Assessments',
      to: '/riskassessments',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'riskassessment'
    }
  ],
  dealRightSidebarSection: [
    {
      text: 'riskAssessmentSection',
      component: './dealSection',
      scope: 'riskassessment'
    }
  ],
  ticketRightSidebarSection: [
    {
      text: 'riskAssessmentSection',
      component: './dealSection',
      scope: 'riskassessment'
    }
  ],
  taskRightSidebarSection: [
    {
      text: 'riskAssessmentSection',
      component: './dealSection',
      scope: 'riskassessment'
    }
  ]
};
