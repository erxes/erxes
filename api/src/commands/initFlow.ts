import { connect, disconnect } from '../db/connection';
import { FlowActionTypes } from '../db/models';

connect()
  .then(async () => {
    let flowActionTypes = await FlowActionTypes.find({});

    if (!flowActionTypes || !flowActionTypes.length) {
      flowActionTypes = [
        'erxes.action.root',
        'erxes.action.define.department',
        'erxes.action.define.tabulation',
        'erxes.action.transfer.to.agent',
        'erxes.action.put.in.queue',
        'erxes.action.finish.attendance',
        'erxes.action.auto.distribute',
        'erxes.action.define.bot',
        'erxes.action.define.tags',
        'erxes.action.add.tags',
        'erxes.action.send.message',
        'erxes.action.send.template.message',
        'erxes.action.dispatch.to.app',
        'erxes.action.send.sms',
        'erxes.action.define.timeout',
        'erxes.action.send.internal.message',
        'erxes.action.execute.automation.flow',
        'erxes.action.execute.action',
        'erxes.action.conditional',
        'erxes.action.wait.for.interaction',
        'erxes.action.define.workflow',
        'erxes.action.send.feedback',
        'erxes.action.add.comment.timeline',
        'erxes.action.choose.department',
        'erxes.action.to.ask',
        'erxes.action.send.request',
        'erxes.action.send.email',
        'erxes.action.send.file',
        'erxes.action.execute.javascript',
        'erxes.action.define.virtual.agent',
        'erxes.action.pause',
      ].map(type => new FlowActionTypes({ type, createdAt: new Date() }));

      return FlowActionTypes.insertMany(flowActionTypes);
    }
  })

  .then(() => {
    return disconnect();
  })

  .then(() => {
    process.exit();
  });
