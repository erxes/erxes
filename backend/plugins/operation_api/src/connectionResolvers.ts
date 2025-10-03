import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { ITaskDocument } from '@/task/@types/task';
import { ITeamDocument, ITeamMemberDocument } from '@/team/@types/team';

import mongoose from 'mongoose';

import { loadTaskClass, ITaskModel } from '@/task/db/models/Task';
import { loadTeamClass, ITeamModel } from '@/team/db/models/Team';
import {
  loadTeamMemberClass,
  ITeamMemberModel,
} from '@/team/db/models/TeamMembers';
import { loadStatusClass, IStatusModel } from '@/status/db/models/Status';
import { IStatusDocument } from '@/status/@types/status';
import { loadProjectClass, IProjectModel } from '@/project/db/models/Project';
import { IProjectDocument } from '@/project/@types/project';
import { loadNoteClass, INoteModel } from '@/note/db/models/Note';
import { INoteDocument } from '@/note/types';
import {
  loadActivityClass,
  IActivityModel,
} from '@/activity/db/models/Activity';
import { IActivityDocument } from '@/activity/types';
import { loadCycleClass, ICycleModel } from '@/cycle/db/models/Cycle';
import { ICycleDocument } from '@/cycle/types';

export interface IModels {
  Task: ITaskModel;
  Team: ITeamModel;
  TeamMember: ITeamMemberModel;
  Status: IStatusModel;
  Project: IProjectModel;
  Note: INoteModel;
  Activity: IActivityModel;
  Cycle: ICycleModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Task = db.model<ITaskDocument, ITaskModel>(
    'operation_tasks',
    loadTaskClass(models),
  );

  models.Team = db.model<ITeamDocument, ITeamModel>(
    'operation_teams',
    loadTeamClass(models),
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
    loadProjectClass(models),
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

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
