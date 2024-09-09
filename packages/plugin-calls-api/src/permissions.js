module.exports = {
    engages: {
        name: 'calls',
        description: 'Calls',
        actions: [
            {
                name: 'callsAll',
                description: 'All',
                use: [
                    'showCallRecord',
                    'showCallDashboard'
                ]
            },
            {
                name: 'showCallRecord',
                description: 'Show call record'
            },
            {
                name: 'showCallDashboard',
                description: 'Show call dashboard'
            }
        ]
    },
}