module.exports = {
    engages: {
        name: 'cloudflarecalls',
        description: 'Cloudflare calls',
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