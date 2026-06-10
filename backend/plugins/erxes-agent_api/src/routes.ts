import { Router } from 'express';
import { generateModels } from './connectionResolvers';
import { getOrCreateAgent } from './mastra/agentRuntime';
import { isLegacyProvider } from './mastra/providers';
import { runWithAuth } from './mastra/requestContext';
import { isAdvancedMemoryEnabled } from './mastra/memory/config';
import {
  recallBlock,
  indexMessages,
  readWorkingMemory,
  refreshWorkingMemory,
  deriveBotResourceId,
  augmentConvo,
  MemoryContext,
} from './mastra/memory';

export const router: Router = Router();

// erxes frontline bot webhook — called by frontline_api when botEndpointUrl is set
router.post('/bot/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { text, subdomain = 'localhost', customerId } = req.body;

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
    const userText = text || '';
    const useHistory = agentConfig.memoryEnabled !== false;
    const advanced = isAdvancedMemoryEnabled() && useHistory && !!userText.trim();
    const history = useHistory
      ? await models.MastraMessage.getRecent(conversationId, 20)
      : [];
    const recentHistory = history.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const memCtx: MemoryContext = {
      subdomain,
      resourceId: deriveBotResourceId({ customerId, conversationId }),
      threadId: conversationId,
      agentId: agentConfig.agentId,
    };

    // Advanced memory: semantic recall + working memory (best-effort).
    const [recall, wmBlock] = advanced
      ? await Promise.all([
          recallBlock(userText, memCtx),
          readWorkingMemory(models, memCtx),
        ])
      : [null, null];

    const convo = augmentConvo({
      recentHistory,
      userMessage: userText,
      recallBlock: recall,
      workingMemoryBlock: wmBlock,
    });

    // Bot requests use the static app token from settings (no user session available)
    const authCtx = { token: settings?.erxesApiToken, subdomain };
    const isLegacy = isLegacyProvider(agentConfig.provider, providers);
    const result = await runWithAuth(authCtx, () =>
      (isLegacy
        ? agent.generateLegacy(convo as any)
        : agent.generate(convo as any)) as Promise<any>,
    );

    const reply = result.text || '';

    // Persist the exchange so the bot remembers across webhook calls.
    await models.MastraThread.ensureThread(conversationId, agentConfig.agentId, userText);
    const userMsg = await models.MastraMessage.addMessage(conversationId, 'user', userText);
    const asstMsg =
      reply ? await models.MastraMessage.addMessage(conversationId, 'assistant', reply) : null;
    await models.MastraThread.touchThread(conversationId);

    // Advanced memory: index the exchange + refresh the profile (best-effort).
    if (advanced) {
      const toIndex = [
        {
          id: String(userMsg._id),
          role: 'user',
          text: userText,
          createdAt: userMsg.createdAt?.toISOString?.(),
        },
      ];
      if (asstMsg && reply) {
        toIndex.push({
          id: String(asstMsg._id),
          role: 'assistant',
          text: reply,
          createdAt: asstMsg.createdAt?.toISOString?.(),
        });
      }
      await indexMessages(memCtx, toIndex);

      if (reply) {
        void refreshWorkingMemory({
          models,
          ctx: memCtx,
          exchange: { user: userText, assistant: reply },
          provider: agentConfig.provider,
          model: agentConfig.model,
          providers,
          authCtx,
          isLegacy,
        });
      }
    }

    return res.json({ responses: [{ type: 'text', text: reply }] });
  } catch (err: any) {
    console.error('[mastra bot endpoint error]', err);
    return res.json({
      responses: [{ type: 'text', text: `Error: ${err.message}` }],
    });
  }
});
