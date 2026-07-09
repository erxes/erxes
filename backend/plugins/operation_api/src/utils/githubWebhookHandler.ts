import { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { generateModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '@/status/constants/types';
import { getSubdomain, graphqlPubsub } from 'erxes-api-shared/utils';
import { updateGithubIssueBody } from './githubClient';
import { isDuplicateKeyError } from './mongoErrors';

interface GithubInstallationPayload {
  action: string;
  installation: {
    id: number;
    account: {
      login: string;
      avatar_url?: string;
      type: string;
    };
  };
}

interface GithubIssuesPayload {
  action: string;
  sender?: {
    type?: string;
  };
  issue: {
    number: number;
    title: string;
    body: string | null;
    html_url: string;
    state_reason: string | null;
  };
  repository: {
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
  };
}

interface RawBodyRequest extends Request {
  rawBody?: Buffer | string;
}

const verifyGithubSignature = (rawBody: Buffer, signature: string): boolean => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) throw new Error('GITHUB_WEBHOOK_SECRET is not set');

  const expected = `sha256=${createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')}`;

  if (expected.length !== signature.length) return false;

  return timingSafeEqual(
    Buffer.from(expected, 'utf8'),
    Buffer.from(signature, 'utf8'),
  );
};

const getTargetStatusType = (
  action: string,
  stateReason: string | null | undefined,
): number | null => {
  if (action === 'opened' || action === 'reopened') {
    return STATUS_TYPES.UNSTARTED;
  }

  if (action === 'closed' && stateReason === 'completed') {
    return STATUS_TYPES.COMPLETED;
  }

  if (
    action === 'closed' &&
    (stateReason === 'not_planned' || stateReason === 'duplicate')
  ) {
    return STATUS_TYPES.CANCELLED;
  }

  return null;
};

const handleGithubConnection = async (
  payload: GithubInstallationPayload,
  subdomain: string,
): Promise<void> => {
  const { action, installation } = payload;

  if (!installation?.id) {
    return;
  }

  const models = await generateModels(subdomain);

  if (action === 'created' || action === 'unsuspend') {
    await models.GithubConnection.upsertConnection({
      installationId: installation.id,
      orgName: installation.account?.login,
      orgAvatarUrl: installation.account?.avatar_url || '',
      orgType: installation.account?.type,
      isActive: true,
      subdomain,
      initiatedUserId: undefined,
    });

    return;
  }

  if (action === 'deleted' || action === 'suspend') {
    const connection = await models.GithubConnection.findOne({
      installationId: installation.id,
      subdomain,
    });

    if (connection) {
      connection.isActive = false;
      await connection.save();
    }

    return;
  }
};

const handleIssues = async (
  payload: GithubIssuesPayload,
  subdomain: string,
): Promise<void> => {
  const { action, issue, sender, repository } = payload;
  const { state_reason } = issue || {};
  if (sender?.type === 'Bot') {
    return;
  }

  const models = await generateModels(subdomain);

  const taskCheckByIssue = await models.Task.findOne({
    githubRepoName: repository.full_name,
    githubIssueNumber: issue.number,
  }).lean();

  const triageCheckByIssue = !taskCheckByIssue
    ? await models.Triage.findOne({
        githubRepoName: repository.full_name,
        githubIssueNumber: issue.number,
      }).lean()
    : null;

  if (!taskCheckByIssue && !triageCheckByIssue && action === 'opened') {
    const config = await models.GithubConfig.findOne({
      repoName: repository?.full_name,
    }).lean();

    if (
      !config ||
      !config.teamId ||
      (config.syncMode !== 'oneWay' && config.syncMode !== 'twoWay')
    ) {
      return;
    }
    try {
      const newTask = await models.Triage.createTriage({
        triage: {
          name: issue.title,
          description: issue.body || '',
          teamId: config.teamId,
          createdBy: 'system',
          type: 'triage',
          number: 0,
          priority: 0,
          status: STATUS_TYPES.TRIAGE,
          githubIssueNumber: issue.number,
          githubIssueUrl: issue.html_url,
          githubRepoName: repository.full_name,
        },
        subdomain,
      });

      await updateGithubIssueBody(
        config.installationId,
        repository.owner.login,
        repository.name,
        issue.number,
        `${issue.body || ''}\n\n<!-- erxes-task-id: ${newTask._id} -->`,
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return;
      }
      throw error;
    }
    return;
  }
  const targetStatusType = getTargetStatusType(action, state_reason);
  if (targetStatusType && taskCheckByIssue) {
    const task = await models.Task.findOne({
      _id: taskCheckByIssue._id,
    }).lean();

    if (!task) {
      return;
    }

    const statuses = await models.Status.getStatuses(
      task.teamId.toString(),
      targetStatusType,
    );

    if (!statuses || statuses.length === 0) {
      return;
    }

    const targetStatus = statuses[0];

    if (task.statusType === targetStatusType) {
      return;
    }

    const updatedTask = await models.Task.updateTask({
      doc: {
        _id: task._id.toString(),
        status: targetStatus._id.toString(),
      },
      userId: 'system',
      subdomain,
    });

    await graphqlPubsub.publish(
      `operationTaskChanged:${taskCheckByIssue._id}`,
      {
        operationTaskChanged: {
          type: 'update',
          task: updatedTask,
        },
      },
    );

    await graphqlPubsub.publish('operationTaskListChanged', {
      operationTaskListChanged: {
        type: 'update',
        task: updatedTask,
      },
    });
  }
};

export const handleGithubWebhook = async (
  req: RawBodyRequest,
  res: Response,
): Promise<void> => {
  try {
    const subdomain = getSubdomain(req);

    if (!subdomain) {
      res.status(400).send('Could not determine subdomain');
      return;
    }

    const signature = req.headers['x-hub-signature-256'] as string;

    if (!signature) {
      res.status(401).send('Missing signature');
      return;
    }

    const rawBody = Buffer.isBuffer(req.rawBody)
      ? req.rawBody
      : Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(
            typeof req.rawBody === 'string'
              ? req.rawBody
              : typeof req.body === 'string'
                ? req.body
                : JSON.stringify(req.body ?? {}),
            'utf8',
          );

    let isValid: boolean;
    try {
      isValid = verifyGithubSignature(rawBody, signature);
    } catch (err) {
      res.status(500).send('Webhook secret not configured');
      return;
    }

    if (!isValid) {
      res.status(401).send('Invalid signature');
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      res.status(400).send('Invalid JSON');
      return;
    }

    const eventType = req.headers['x-github-event'] as string;

    if (eventType === 'ping') {
      res.status(200).send('pong');
      return;
    }

    if (eventType === 'installation') {
      await handleGithubConnection(
        payload as GithubInstallationPayload,
        subdomain,
      );
      res.status(200).send('ok');
      return;
    }

    if (eventType === 'issues') {
      await handleIssues(payload as GithubIssuesPayload, subdomain);
      res.status(200).send('ok');
      return;
    }

    res.status(200).send('ignored');
  } catch (error) {
    console.error('handleGithubWebhook error', error);

    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
};

export const handleGithubSetup = (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html><body><script>
      if (window.opener) {
        window.opener.postMessage({ type: 'github-install-complete' }, '*');
      }
      window.close();
    </script><p>Connected! You can close this window.</p></body></html>
  `);
};
