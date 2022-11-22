module.exports = {
  riskAssessment: {
    name: 'riskAssessment',
    description: 'Risk Assessment',
    actions: [
      {
        name: 'riskAssessmentAll',
        description: 'All',
        use: ['showRiskAssessment', 'manageRiskAssessment']
      },
      {
        name: 'manageRiskAssessment',
        description: 'Manage Risk Assessment',
        use: ['showRiskAssessment']
      },
      {
        name: 'showRiskAssessment',
        description: 'Show Risk Assessment'
      }
    ]
  }
};
