import { getPlugin, getPlugins, IAfterProcessRule } from 'erxes-api-shared/utils';
import { AfterProcessProps } from '~/types';
import { AfterProcessContext, HandlerContext } from './types';
import { findMatchingHandler } from './registry';

async function processPluginRules(
  subdomain: string,
  pluginName: string,
  rules: IAfterProcessRule[],
  context: AfterProcessContext,
): Promise<void> {
  for (const rule of rules) {
    try {
      const handlerConfig = findMatchingHandler(rule, context);

      if (!handlerConfig) {
        continue;
      }

      const handlerContext: HandlerContext = {
        ...context,
        rule,
      };

      await handlerConfig.handler(handlerContext);
    } catch (error) {
      console.error(
        `Error processing rule ${rule.type} for plugin ${pluginName}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}

export async function handleAfterProcess(
  subdomain: string,
  props: AfterProcessProps,
): Promise<void> {
  try {
    const pluginNames = await getPlugins();

    for (const pluginName of pluginNames) {
      try {
        const plugin = await getPlugin(pluginName);

        if (!plugin?.config?.meta?.afterProcess) {
          continue;
        }

        const { rules = [] } = plugin.config.meta.afterProcess || {};

        if (rules.length === 0) {
          continue;
        }

        const context: AfterProcessContext = {
          subdomain,
          pluginName,
          source: props.source,
          action: props.action,
          payload: props.payload,
          contentType: props.contentType,
        };

        await processPluginRules(subdomain, pluginName, rules, context);
      } catch (error) {
        console.error(
          `Error processing afterProcess for plugin ${pluginName}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }
  } catch (error) {
    console.error(
      `Error in handleAfterProcess: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
    throw error;
  }
}

