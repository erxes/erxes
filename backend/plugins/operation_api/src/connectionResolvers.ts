import { ITaskDocument } from '@/task/@types/task';
import { ITeamDocument, ITeamMemberDocument } from '@/team/@types/team';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import mongoose from 'mongoose';

import {
  IActivityModel,
  loadActivityClass,
} from '@/activity/db/models/Activity';
import { IActivityDocument } from '@/activity/types';
import { ICycleModel, loadCycleClass } from '@/cycle/db/models/Cycle';
import { ICycleDocument } from '@/cycle/types';
import { INoteModel, loadNoteClass } from '@/note/db/models/Note';
import { INoteDocument } from '@/note/types';
import { IProjectDocument } from '@/project/@types/project';
import { IProjectModel, loadProjectClass } from '@/project/db/models/Project';
import { IStatusDocument } from '@/status/@types/status';
import { IStatusModel, loadStatusClass } from '@/status/db/models/Status';
import { ITaskModel, loadTaskClass } from '@/task/db/models/Task';
import { ITeamModel, loadTeamClass } from '@/team/db/models/Team';
import {
  ITeamMemberModel,
  loadTeamMemberClass,
} from '@/team/db/models/TeamMembers';

import {
  IMilestoneModel,
  loadMilestoneClass,
} from '@/milestone/db/models/Milestone';
import { IMilestoneDocument } from '@/milestone/types';
import { ITriageModel, loadTriageClass } from '@/task/db/models/Triage';
import { ITriageDocument } from './modules/task/@types/triage';
import { IOperationTemplateDocument } from '@/template/@types/template';
import { IOperationTemplateModel, loadTemplateClass } from '@/template/db/models/Template';

export interface IModels {
  Task: ITaskModel;
  Team: ITeamModel;
  TeamMember: ITeamMemberModel;
  Status: IStatusModel;
  Project: IProjectModel;
  Note: INoteModel;
  Activity: IActivityModel;
  Cycle: ICycleModel;
  Milestone: IMilestoneModel;
  Triage: ITriageModel;
  OperationTemplate: IOperationTemplateModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Task = db.model<ITaskDocument, ITaskModel>(
    'operation_tasks',
    loadTaskClass(models),
  );

  models.Team = db.model<ITeamDocument, ITeamModel>(
    'operation_teams',
    loadTeamClass(models, subdomain),
  );

  models.TeamMember = db.model<ITeamMemberDocument, ITeamMemberModel>(
    'operation_team_members',
    loadTeamMemberClass(models),
  );

  models.Status = db.model<IStatusDocument, IStatusModel>(
    'operation_statuses',
    loadStatusClass(models),
  );

  models.Project = db.model<IProjectDocument, IProjectModel>(
    'operation_projects',
    loadProjectClass(models, subdomain),
  );

  models.Note = db.model<INoteDocument, INoteModel>(
    'operation_notes',
    loadNoteClass(models),
  );

  models.Activity = db.model<IActivityDocument, IActivityModel>(
    'operation_activities',
    loadActivityClass(models),
  );

  models.Cycle = db.model<ICycleDocument, ICycleModel>(
    'operation_cycles',
    loadCycleClass(models),
  );

  models.Milestone = db.model<IMilestoneDocument, IMilestoneModel>(
    'operation_milestones',
    loadMilestoneClass(models),
  );

  models.Triage = db.model<ITriageDocument, ITriageModel>(
    'operation_triage',
    loadTriageClass(models),
  );

  models.OperationTemplate = db.model<IOperationTemplateDocument, IOperationTemplateModel>(
    'operation_templates',
    loadTemplateClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
