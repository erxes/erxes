import { IProjectUpdate } from '@/project/@types/project';
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
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('projectCreate');

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
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('projectUpdate');

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

  removeProject: async (
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('projectRemove');

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
