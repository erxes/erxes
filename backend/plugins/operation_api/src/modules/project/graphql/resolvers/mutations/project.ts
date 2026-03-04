import { IProjectUpdate } from '@/project/@types/project';
// import { TeamMemberRoles } from '@/team/@types/team';
// import { checkUserRole } from '@/utils';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

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
      memberIds,
      tagIds,
      convertedFromId,
    },
    { models, user }: IContext,
  ) => {
    const createdProject = await models.Project.createProject(
      {
        name,
        teamIds,
        startDate,
        targetDate,
        priority,
        status,
        description,
        leadId,
        memberIds,
        tagIds,
        createdBy: user._id,
        convertedFromId,
      },
      user,
    );
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
    { models, user }: IContext,
  ) => {
    // const project = await models.Project.getProject(params._id);
    // await checkUserRole({
    //   models,
    //   teamIds: project.teamIds,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    // });

    const updatedProject = await models.Project.updateProject({
      doc: params,
      userId: user._id,
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

requireLogin(projectMutations, 'createProject');
requireLogin(projectMutations, 'updateProject');
requireLogin(projectMutations, 'removeProject');
