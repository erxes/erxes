module.exports = {
  engages: {
    name: 'engages',
    description: 'Broadcast',
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
        description: 'Set an auto broadcast live'
      },
      {
        name: 'engageMessageSetPause',
        description: 'Pause a broadcast'
      },
      {
        name: 'engageMessageSetLiveManual',
        description: 'Set a manual broadcast live'
      },
      {
        name: 'engageMessageRemove',
        description: 'Remove a broadcast'
      },
      {
        name: 'engageMessageEdit',
        description: 'Edit a broadcast'
      },
      {
        name: 'engageMessageAdd',
        description: 'Add a broadcast'
      },
      {
        name: 'showEngagesMessages',
        description: 'See broadcast list'
      }
    ]
  },
}