import * as fs from 'fs';
import * as path from 'path';
import * as allModels from './models';
import { debugError } from './debuggers';
import { sendRPCMessage } from './messageBroker';

export { allModels };

interface IActionsByType {
  [type: string]: {
    callBack: void;
  };
}

const actionsByType: IActionsByType[] | {} = {};

const tryRequire = requirPath => {
  try {
    return require(`${requirPath}`);
  } catch (err) {
    debugError(requirPath);
    debugError(err.message);
    return {};
  }
};

export const execInEveryPlugin = callback => {
  const pluginsPath = path.resolve(
    __dirname,
    process.env.NODE_ENV === 'production' ? './plugins' : '../../plugins'
  );

  if (fs.existsSync(pluginsPath)) {
    fs.readdir(pluginsPath, (_error, plugins) => {
      const pluginsCount = plugins.length;

      plugins.forEach((plugin, index) => {
        let actions = [];

        const ext = process.env.NODE_ENV === 'production' ? 'js' : 'ts';

        const actionsPath = `${pluginsPath}/${plugin}/automations/actions.${ext}`;

        if (fs.existsSync(actionsPath)) {
          actions = tryRequire(actionsPath).default;
        }


        callback({
          isLastIteration: pluginsCount === index + 1,
          pluginName: plugin,
          actions
        });
      });
    });
  } else {
    callback({
      isLastIteration: true,
      pluginName: '',
      actions: []
    });
  }
};

export const extendViaPlugins = (): Promise<any> => new Promise(resolve => {
  execInEveryPlugin(
    async ({
      isLastIteration,
      pluginName,
      actions
    }) => {
      if (actions && actions.length) {
        actions.forEach(action => {
          const { type } = action;
          const key = `${pluginName}-${type}`;

          if (!Object.keys(actionsByType).includes(key)) {
            actionsByType[key] = action.handler;
          }
        })
      }

      if (isLastIteration) {
        return resolve({});
      }
    }
  );
});


export const callPluginsAction = async ({ action, execution }) => {
  const context = {
    models: allModels,
    sendRPCMessage
  };

  if (!Object.keys(actionsByType).includes(action.type)) {
    return { error: `not found action by type: ${action.type}` }
  }

  return actionsByType[action.type]({ action, execution }, context);
};
