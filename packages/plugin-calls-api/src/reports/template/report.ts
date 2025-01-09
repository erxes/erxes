

const reportTemplates = [
    {
        serviceType: 'calls',
        title: 'Call charts',
        serviceName: 'calls',
        serviceLabel: "Calls",
        description: 'Call charts',
        charts: [
            'callsCount',
            'callsCountByRep',
            'callsCountByType',
            'callsCountByQueue',
            'callsCountByEndedBy',
            'callsCountByStatus',
            'callsCountByFrequency'
        ],
        img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
    }
]

export default reportTemplates;