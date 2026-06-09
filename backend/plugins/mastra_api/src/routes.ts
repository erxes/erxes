import { Router } from 'express';
import { generateModels } from './connectionResolvers';
import { getOrCreateAgent } from './mastra/agentRuntime';
import { isLegacyProvider } from './mastra/providers';
import { runWithAuth } from './mastra/requestContext';

export const router: Router = Router();

// erxes frontline bot webhook — called by frontline_api when botEndpointUrl is set
router.post('/bot/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { text, subdomain = 'localhost' } = req.body;

  try {
    const models = await generateModels(subdomain);
    const settings = await models.MastraSettings.getSettings();

    if (!settings?.defaultAgentId) {
      return res.json({
        responses: [{ type: 'text', text: 'No default agent configured. Please set one in Mastra Settings.' }],
      });
    }

    const agentConfig = await models.MastraAgent.findOne({
      agentId: settings.defaultAgentId,
      isEnabled: true,
    });

    if (!agentConfig) {
      return res.json({
        responses: [{ type: 'text', text: 'Configured agent not found or disabled.' }],
      });
    }

    const providers = await models.MastraProvider.find({ isEnabled: true });
    const { agent } = await getOrCreateAgent(agentConfig, models);

    // Conversation memory is Mongo-backed, keyed by the frontline conversationId.
    const useHistory = agentConfig.memoryEnabled !== false;
    const history = useHistory
      ? await models.MastraMessage.getRecent(conversationId, 20)
      : [];
    const convo = [
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: text || '' },
    ];

    // Bot requests use the static app token from settings (no user session available)
    const authCtx = { token: settings?.erxesApiToken };
    const result = await runWithAuth(authCtx, () =>
      (isLegacyProvider(agentConfig.provider, providers)
        ? agent.generateLegacy(convo)
        : agent.generate(convo as any)) as Promise<any>,
    );

    const reply = result.text || '';

    // Persist the exchange so the bot remembers across webhook calls.
    await models.MastraThread.ensureThread(conversationId, agentConfig.agentId, text || '');
    await models.MastraMessage.addMessage(conversationId, 'user', text || '');
    if (reply) await models.MastraMessage.addMessage(conversationId, 'assistant', reply);
    await models.MastraThread.touchThread(conversationId);

    return res.json({ responses: [{ type: 'text', text: reply }] });
  } catch (err: any) {
    console.error('[mastra bot endpoint error]', err);
    return res.json({
      responses: [{ type: 'text', text: `Error: ${err.message}` }],
    });
  }
});
