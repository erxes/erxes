export default [
  {
    type: 'voucher',
    handler: async ({action, execution}, {models, sendRPCMessage}) => {
      // console.log('111111111111111', action, '22222222222222222222222222', execution, 'sssssssssssssss')
      console.log('111111111111111', models, '22222222222222222222222222', sendRPCMessage, 'sssssssssssssss')
    }
  }
]