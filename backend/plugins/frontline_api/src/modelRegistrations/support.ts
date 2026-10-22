import type { Connection } from 'mongoose';
import type { IModels } from './types';
import type { ScopedEventHandlers } from 'erxes-api-shared/utils';
import {
  type ITicketPipelineModel,
  loadPipelineClass,
} from '@/ticket/db/models/Pipeline';
import { type IStatusModel, loadStatusClass } from '@/ticket/db/models/Status';
import { type ITicketModel, loadTicketClass } from '@/ticket/db/models/Ticket';
import type { ITicketDocument } from '@/ticket/@types/ticket';
import type { ITicketPipelineDocument } from '@/ticket/@types/pipeline';
import type { IStatusDocument } from '@/ticket/@types/status';
import {
  type IActivityModel,
  loadActivityClass,
} from '@/ticket/db/models/Activity';
import type { IActivityDocument } from '@/ticket/@types/activity';
import { type INoteModel, loadNoteClass } from '@/ticket/db/models/Note';
import type { INoteDocument } from '@/ticket/@types/note';
import type { ITicketConfigDocument } from '@/ticket/@types/ticketConfig';
import {
  type ITicketConfigModel,
  loadTicketConfigClass,
} from '@/ticket/db/models/TicketConfig';
import type { IFieldDocument } from '@/form/db/definitions/fields';
import type { IFormDocument } from '@/form/db/definitions/forms';
import { type IFieldModel, loadFieldClass } from '@/form/db/models/Fields';
import type { IFormSubmissionDocument } from '@/form/db/definitions/forms';
import {
  type IFormModel,
  type IFormSubmissionModel,
  loadFormClass,
  loadFormSubmissionClass,
} from '@/form/db/models/Forms';
import type {
  ISurveyDocument,
  ISurveyVoteDocument,
} from '@/survey/@types/survey';
import { type ISurveyModel, loadSurveyClass } from '@/survey/db/models/Surveys';
import {
  type ISurveyVoteModel,
  loadSurveyVoteClass,
} from '@/survey/db/models/SurveyVotes';
import type { IArticleDocument } from '@/knowledgebase/@types/article';
import type { ICategoryDocument } from '@/knowledgebase/@types/category';
import type { ITopicDocument } from '@/knowledgebase/@types/topic';
import {
  type IArticleModel,
  loadArticleClass,
} from '@/knowledgebase/db/models/Article';
import {
  type ICategoryModel,
  loadCategoryClass,
} from '@/knowledgebase/db/models/Category';
import {
  type ITopicModel,
  loadTopicClass,
} from '@/knowledgebase/db/models/Topic';
import type { IHelpCenterConfigDocument } from '@/helpcenter/@types/helpCenterConfig';
import {
  type IHelpCenterConfigModel,
  loadHelpCenterConfigClass,
} from '@/helpcenter/db/models/HelpCenterConfig';
import type { IReportChartDocument } from '@/reports/@types/chart';
import {
  type IReportChartModel,
  loadReportChartClass,
} from '@/reports/db/models/Charts';
export const registerTicketModels = (
  db: Connection,
  models: IModels,
  frontlineEventHandlers: ReturnType<ScopedEventHandlers>,
): void => {
  models.Pipeline = db.model<ITicketPipelineDocument, ITicketPipelineModel>(
    'frontline_tickets_pipeline',
    loadPipelineClass(models),
  );
  models.Status = db.model<IStatusDocument, IStatusModel>(
    'frontline_tickets_pipeline_status',
    loadStatusClass(models),
  );
  models.Ticket = db.model<ITicketDocument, ITicketModel>(
    'frontline_tickets',
    loadTicketClass(models, frontlineEventHandlers('tickets', 'tickets')),
  );
  models.Activity = db.model<IActivityDocument, IActivityModel>(
    'frontline_ticket_activities',
    loadActivityClass(models),
  );
  models.Note = db.model<INoteDocument, INoteModel>(
    'frontline_tickets_notes',
    loadNoteClass(models),
  );
  models.TicketConfig = db.model<ITicketConfigDocument, ITicketConfigModel>(
    'frontline_ticket_configs',
    loadTicketConfigClass(models),
  );
};

export const registerSupportContentModels = (
  db: Connection,
  models: IModels,
  subdomain: string,
): void => {
  models.Fields = db.model<IFieldDocument, IFieldModel>(
    'frontline_form_fields',
    loadFieldClass(models, subdomain),
  );
  models.Forms = db.model<IFormDocument, IFormModel>(
    'frontline_forms',
    loadFormClass(models),
  );
  models.FormSubmissions = db.model<
    IFormSubmissionDocument,
    IFormSubmissionModel
  >('frontline_form_submissions', loadFormSubmissionClass(models));
  models.Surveys = db.model<ISurveyDocument, ISurveyModel>(
    'frontline_surveys',
    loadSurveyClass(models),
  );
  models.SurveyVotes = db.model<ISurveyVoteDocument, ISurveyVoteModel>(
    'frontline_survey_votes',
    loadSurveyVoteClass(models),
  );
  models.Article = db.model<IArticleDocument, IArticleModel>(
    'knowledgebase_articles',
    loadArticleClass(models),
  );
  models.Category = db.model<ICategoryDocument, ICategoryModel>(
    'knowledgebase_categories',
    loadCategoryClass(models),
  );
  models.Topic = db.model<ITopicDocument, ITopicModel>(
    'knowledgebase_topics',
    loadTopicClass(models),
  );
  models.HelpCenterConfigs = db.model<
    IHelpCenterConfigDocument,
    IHelpCenterConfigModel
  >('frontline_help_center_configs', loadHelpCenterConfigClass(models));
  models.ReportCharts = db.model<IReportChartDocument, IReportChartModel>(
    'frontline_report_charts',
    loadReportChartClass(models),
  );
};
