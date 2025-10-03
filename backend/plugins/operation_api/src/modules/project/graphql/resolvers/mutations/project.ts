import { IProjectUpdate } from '@/project/@types/project';
import { checkUserRole } from '@/utils';
import { TeamMemberRoles } from '@/team/@types/team';
import { IContext } from '~/connectionResolvers';
import { graphqlPubsub } from 'erxes-api-shared/utils';

export const projectMutations = {
  createProject: async (
    _parent: undefined,
    {
      name,
      teamIds,
      startDate,
      targetDate,
      priority,
      status,
      description,
      leadId,
    },
    { models }: IContext,
  ) => {
    const createdProject = await models.Project.createProject({
      name,
      teamIds,
      startDate,
      targetDate,
      priority,
      status,
      description,
      leadId,
    });
    graphqlPubsub.publish(`operationProjectChanged:${createdProject._id}`, {
      operationProjectChanged: {
        type: 'create',
        project: createdProject,
      },
    });

    graphqlPubsub.publish('operationProjectListChanged', {
      operationProjectListChanged: {
        type: 'create',
        project: createdProject,
      },
    });

    return createdProject;
  },
  updateProject: async (
    _parent: undefined,
    params: IProjectUpdate,
    { models, user, subdomain }: IContext,
  ) => {
    const project = await models.Project.getProject(params._id);
    await checkUserRole({
      models,
      teamIds: project.teamIds,
      userId: user._id,
      allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    });

    const updatedProject = await models.Project.updateProject({
      doc: params,
      userId: user._id,
      subdomain,
    });

    graphqlPubsub.publish(`operationProjectChanged:${updatedProject._id}`, {
      operationProjectChanged: {
        type: 'update',
        project: updatedProject,
      },
    });

    graphqlPubsub.publish('operationProjectListChanged', {
      operationProjectListChanged: {
        type: 'update',
        project: updatedProject,
      },
    });

    return updatedProject;
  },
  removeProject: async (_parent: undefined, { _id }, { models }: IContext) => {
    const deletedProject = await models.Project.removeProject(_id);

    graphqlPubsub.publish(`operationProjectChanged:${_id}`, {
      operationProjectChanged: {
        type: 'delete',
        project: deletedProject,
      },
    });

    graphqlPubsub.publish('operationProjectListChanged', {
      operationProjectListChanged: {
        type: 'delete',
        project: deletedProject,
      },
    });

    return deletedProject;
  },
};
