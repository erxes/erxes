export default [
  {
    action: 'erxes-plugin-test',
    handler: async (action, doc, { models }) => {
      console.log(action, doc, 'aaaaaaaaaaaaaaaaaaa')

      return {}
    }
  }
]
