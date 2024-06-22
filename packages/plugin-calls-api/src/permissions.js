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
                ]
            },
            {
                name: 'showCallRecord',
                description: 'Show call record'
            }
        ]
    },
}