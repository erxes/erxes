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
                    'showCallDashboard',
                    'syncCallRecordFile'
                ]
            },
            {
                name: 'showCallRecord',
                description: 'Show call record'
            },
            {
                name: 'showCallDashboard',
                description: 'Show call dashboard'
            },
            {
                name: "syncCallRecordFile",
                description: "sync recoden file"
            }
        ]
    },
}