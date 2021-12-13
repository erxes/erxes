export default [
  {
    type: 'voucher',
    handler: async ({action, execution}, {models, sendRPCMessage}) => {
      const response = await sendRPCMessage('erxes-plugin-test', {test: 'testt'})
      console.log(response, '9999999999999999999')
      return response
    }
  }
]