export default [
  {
    name: 'automationResponded',
    handler: (payload, variables) => {
      return (
        payload.automationResponded.userId === variables.userId &&
        payload.automationResponded.sessionCode === variables.sessionCode
      )
    }
  }
]
