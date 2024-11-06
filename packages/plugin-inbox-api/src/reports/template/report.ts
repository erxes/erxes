const reportTemplates = [
    {
        serviceType: 'inbox',
        title: 'Inbox chart',
        serviceName: 'inbox',
        serviceLabel: "Inbox",
        description: 'Chat conversation charts',
        charts: [
            'averageFirstResponseTime',
            'averageCloseTime',
            'closedConversationsCountByRep',
            'conversationsCountByTag',
            'conversationsCountBySource',
            'conversationsCountByRep',
            'conversationsCountByStatus',
            'conversationsCount',
        ],
        img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
    },
];

export default reportTemplates;