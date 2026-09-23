import { ITask, ITaskUpdate } from '@/task/@types/task';
import { validatePropertiesData } from '@/fields/validatePropertiesData';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  createGithubIssue,
  getInstallationOctokit,
  type OctokitInstance,
  updateGithubIssueMilestone,
  updateGithubIssueState,
} from '~/utils/githubClient';

export const taskMutations = {
  createTask: async (
    _parent: undefined,
    params: ITask,
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('taskCreate');

    if (params.propertiesData !== undefined) {
      params.propertiesData = await validatePropertiesData(
        subdomain,
        params.propertiesData,
      );
    }

    const task = await models.Task.createTask({
      doc: params,
      userId: user._id,
      subdomain,
    });

    graphqlPubsub.publish(`operationTaskChanged:${task._id}`, {
      operationTaskChanged: {
        type: 'create',
        task,
      },
    });

    graphqlPubsub.publish('operationTaskListChanged', {
      operationTaskListChanged: {
        type: 'create',
        task,
      },
    });
    const githubConfig = await models.GithubConfig.findByTeam(
      params.teamId,
      subdomain,
    );
    if (githubConfig && githubConfig.syncMode === 'twoWay') {
      const app = await getInstallationOctokit(githubConfig.installationId);
      const title = `${task.name}`;
      const taskUrl = `https://${subdomain}.erxes.io/operation/team/${params.teamId}/tasks/${task._id}`;

      const body = [
        `**Task:** ${task.name}`,
        `**Opened in:** [erxes Operation](${taskUrl})`,
        ``,
        `> This issue was automatically created from the erxes Operation plugin.`,
        ``,
        `<!-- erxes-task-id: ${task._id} -->`,
      ].join('\n');
      try {
        const { issueNumber, issueUrl } = await createGithubIssue(
          app,
          githubConfig.repoName,
          title,
          body,
        );
        const updatedTask = await models.Task.updateTask({
          doc: {
            _id: task._id,
            githubIssueNumber: issueNumber,
            githubIssueUrl: issueUrl,
            githubRepoName: githubConfig.repoName,
            name: task.name,
            teamId: task.teamId,
          },
          userId: user._id,
          subdomain,
        });

        graphqlPubsub.publish(`operationTaskChanged:${task._id}`, {
          operationTaskChanged: {
            type: 'update',
            updatedTask,
          },
        });

        graphqlPubsub.publish('operationTaskListChanged', {
          operationTaskListChanged: {
            type: 'update',
            updatedTask,
          },
        });

        if (task.milestoneId) {
          try {
            await updateGithubIssueMilestone(
              app,
              githubConfig.repoName,
              issueNumber,
              task.milestoneId.toString(),
              githubConfig.installationId,
              subdomain,
            );
          } catch (error) {
            console.error('Failed to sync milestone to GitHub:', error);
          }
        }
      } catch (error) {
        console.error('Error creating GitHub issue:', error);
      }
    }

    return task;
  },

  updateTask: async (
    _parent: undefined,
    params: ITaskUpdate,
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('taskUpdate');

    if (params.propertiesData !== undefined) {
      params.propertiesData = await validatePropertiesData(
        subdomain,
        params.propertiesData,
      );
    }

    const updatedTask = await models.Task.updateTask({
      doc: params,
      userId: user._id,
      subdomain,
    });

    if (
      updatedTask.githubIssueNumber &&
      (params.status || params.milestoneId !== undefined)
    ) {
      const githubConfig = await models.GithubConfig.findByTeam(
        updatedTask.teamId,
        subdomain,
      );
      if (
        githubConfig &&
        githubConfig.syncMode === 'twoWay' &&
        githubConfig.repoName === updatedTask.githubRepoName
      ) {
        let octokit: OctokitInstance | undefined;

        try {
          octokit = await getInstallationOctokit(githubConfig.installationId);
        } catch (error) {
          console.error('Failed to authenticate with GitHub:', error);
        }

        if (octokit) {
          if (params.status) {
            try {
              await updateGithubIssueState(
                octokit,
                githubConfig.repoName,
                updatedTask.githubIssueNumber,
                params.status,
                subdomain,
              );
            } catch (error) {
              console.error('Failed to sync status to GitHub:', error);
            }
          }

          if (params.milestoneId !== undefined) {
            try {
              await updateGithubIssueMilestone(
                octokit,
                githubConfig.repoName,
                updatedTask.githubIssueNumber,
                params.milestoneId?.toString() ?? null,
                githubConfig.installationId,
                subdomain,
              );
            } catch (error) {
              console.error('Failed to sync milestone to GitHub:', error);
            }
          }
        }
      }
    }

    graphqlPubsub.publish(`operationTaskChanged:${updatedTask._id}`, {
      operationTaskChanged: {
        type: 'update',
        task: updatedTask,
      },
    });

    graphqlPubsub.publish('operationTaskListChanged', {
      operationTaskListChanged: {
        type: 'update',
        task: updatedTask,
      },
    });

    return updatedTask;
  },

  removeTask: async (
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('taskRemove');

    const deletedTask = await models.Task.removeTask(_id);

    graphqlPubsub.publish(`operationTaskChanged:${_id}`, {
      operationTaskChanged: {
        type: 'delete',
        task: deletedTask,
      },
    });

    graphqlPubsub.publish('operationTaskListChanged', {
      operationTaskListChanged: {
        type: 'delete',
        task: deletedTask,
      },
    });

    return deletedTask;
  },
};
