module.exports = {
  engages: {
    name: 'engages',
    description: 'Campaigns',
    actions: [
      {
        name: 'engagesAll',
        description: 'All',
        use: [
          'engageMessageSetLiveManual',
          'engageMessageSetPause',
          'engageMessageSetLive',
          'showEngagesMessages',
          'engageMessageAdd',
          'engageMessageEdit',
          'engageMessageRemove'
        ]
      },
      {
        name: 'engageMessageSetLive',
        description: 'Set an auto campaign live'
      },
      {
        name: 'engageMessageSetPause',
        description: 'Pause a campaign'
      },
      {
        name: 'engageMessageSetLiveManual',
        description: 'Set a manual campaign live'
      },
      {
        name: 'engageMessageRemove',
        description: 'Remove a campaign'
      },
      {
        name: 'engageMessageEdit',
        description: 'Edit a campaign'
      },
      {
        name: 'engageMessageAdd',
        description: 'Add a campaign'
      },
      {
        name: 'showEngagesMessages',
        description: 'See campaign list'
      }
    ]
  },
}