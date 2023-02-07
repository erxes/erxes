module.exports = {
  name: 'riskassessment',
  port: 3012,
  scope: 'riskassessment',
  exposes: {
    './routes': './src/routes.tsx',
    './cardSideBarSection': './src/assessments/section/containers/Section.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'riskassessment',
    module: './routes'
  },
  menus: [
    {
      text: 'Risk Assessments',
      to: '/settings/risk-assessments',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'riskassessment',
      action: 'riskAssessmentAll',
      permissions: ['showRiskAssessment', 'manageRiskAssessment']
    }
  ],
  dealRightSidebarSection: [
    {
      text: 'riskAssessmentSection',
      component: './cardSideBarSection',
      scope: 'riskassessment',
      action: 'riskAssessmentAll',
      permissions: ['showRiskAssessment', 'manageRiskAssessment']
    }
  ],
  ticketRightSidebarSection: [
    {
      text: 'riskAssessmentSection',
      component: './cardSideBarSection',
      scope: 'riskassessment',
      action: 'riskAssessmentAll',
      permissions: ['showRiskAssessment', 'manageRiskAssessment']
    }
  ],
  taskRightSidebarSection: [
    {
      text: 'riskAssessmentSection',
      component: './cardSideBarSection',
      scope: 'riskassessment',
      action: 'riskAssessmentAll',
      permissions: ['showRiskAssessment', 'manageRiskAssessment']
    }
  ]
};
