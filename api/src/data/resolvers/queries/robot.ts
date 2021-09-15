import { RobotEntries } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { OnboardingHistories } from '../../../db/models/Robot';
import { moduleObjects } from '../../permissions/actions/permission';
import { getUserAllowedActions, IModuleMap } from '../../permissions/utils';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const features: {
  [key: string]: {
    feature: string;
    settings: string[];
    settingsPermissions: string[];
  };
} = {
  generalSettings: {
    feature: 'generalSettings',
    settings: [
      'generalSettingsCreate',
      'generalSettingsUploadCreate',
      'generelSettingsConstantsCreate'
    ],
    settingsPermissions: ['showGeneralSettings', 'manageGeneralSettings']
  },

  channelBrands: {
    feature: 'brands',
    settings: ['brandCreate', 'channelCreate'],
    settingsPermissions: ['brandCreate', 'channelCreate']
  },

  integrationOtherApps: {
    feature: 'integrations',
    settings: ['integrationsCreate', 'connectIntegrationsToChannel'],
    settingsPermissions: [
      'integrationsCreateMessengerIntegration',
      'manageChannels'
    ]
  },

  customizeDatabase: {
    feature: 'forms',
    settings: ['fieldGroupCreate', 'fieldCreate'],
    settingsPermissions: ['manageForms']
  },

  importExistingContacts: {
    feature: 'importHistories',
    settings: [
      'fieldGroupCreate',
      'fieldCreate',
      'importDownloadTemplate',
      'importCreate'
    ],
    settingsPermissions: ['manageForms', 'importHistories']
  },

  inviteTeamMembers: {
    feature: 'users',
    settings: ['userGroupCreate', 'usersInvite'],
    settingsPermissions: ['usersInvite']
  },

  salesPipeline: {
    feature: 'deals',
    settings: ['dealBoardsCreate', 'dealPipelinesCreate', 'dealCreate'],
    settingsPermissions: ['dealBoardsAdd', 'dealPipelinesAdd']
  },

  createProductServices: {
    feature: 'products',
    settings: ['productCategoryCreate', 'productCreate'],
    settingsPermissions: ['manageProducts']
  },

  customizeTickets: {
    feature: 'tickets',
    settings: ['ticketBoardsCreate', 'ticketPipelinesCreate', 'ticketCreate'],
    settingsPermissions: ['ticketBoardsAdd', 'ticketPipelinesAdd']
  },

  customizeTasks: {
    feature: 'tasks',
    settings: ['taskBoardsCreate', 'taskPipelinesCreate', 'taskCreate'],
    settingsPermissions: ['taskBoardsAdd', 'taskPipelinesAdd']
  },

  customizeGrowthHacking: {
    feature: 'growthHacks',
    settings: ['growthHackBoardCreate', 'pipelineTemplate'],
    settingsPermissions: ['growthHackStagesAdd', 'growthHackTemplatesAdd']
  },

  customizeSegmentation: {
    feature: 'segments',
    settings: ['segmentCreate', 'subSegmentCreate'],
    settingsPermissions: ['manageSegments']
  },

  prepareMailResponseTemplates: {
    feature: 'emailTemplates',
    settings: ['createResponseTemplate', 'createEmailTemplate'],
    settingsPermissions: ['manageEmailTemplate']
  },

  prepareContentTemplates: {
    feature: 'responseTemplates',
    settings: [
      'createResponseTemplate',
      'createEmailTemplate',
      'pipelineTemplate'
    ],
    settingsPermissions: ['manageEmailTemplate', 'manageResponseTemplate']
  },

  automateCampaigns: {
    feature: 'engages',
    settings: ['engageVerifyEmail', 'engageSendTestEmail', 'engageCreate'],
    settingsPermissions: ['engageMessageAdd']
  },

  customizeKnowledgeBase: {
    feature: 'knowledgeBase',
    settings: [
      'knowledgeBaseTopicCreate',
      'knowledgeBaseCategoryCreate',
      'knowledgeBaseArticleCreate',
      'knowledgeBaseInstalled'
    ],
    settingsPermissions: ['manageKnowledgeBase']
  },

  customizeReports: {
    feature: 'dashboards',
    settings: ['dashboardCreate', 'dashboardItemCreate'],
    settingsPermissions: ['dashboardAdd', 'dashboardItemAdd']
  },

  createLeadGenerationForm: {
    feature: 'integrations',
    settings: ['leadIntegrationCreate', 'leadIntegrationInstalled'],
    settingsPermissions: ['manageForms']
  },

  installErxesWidgets: {
    feature: 'integrations',
    settings: ['messengerIntegrationCreate'],
    settingsPermissions: ['integrationsCreateMessengerIntegration']
  }
};

const checkShowModule = (
  user: IUserDocument,
  actionsMap,
  moduleName: string,
  featureName: string
): { showModule: boolean; showSettings: boolean } => {
  if (user.isOwner) {
    return {
      showModule: true,
      showSettings: true
    };
  }

  const module: IModuleMap = moduleObjects[featureName];

  interface IAction {
    name: string;
    description?: string;
  }

  let actions: IAction[] = [];
  let showModule = false;
  let showSettings = true;

  if (!module) {
    if (featureName === 'leads') {
      actions = [{ name: 'integrationsCreateLeadIntegration' }];
    }

    if (featureName === 'properties') {
      actions = [{ name: 'manageForms' }];
    }
  } else {
    actions = module.actions as IAction[];
  }

  for (const action of actions) {
    if (actionsMap.includes(action.name || '')) {
      showModule = true;
      break;
    }
  }

  for (const permission of features[moduleName].settingsPermissions) {
    if (!actionsMap.includes(permission)) {
      showSettings = false;
      break;
    }
  }

  return {
    showModule,
    showSettings
  };
};

const robotQueries = {
  robotEntries(
    _root,
    {
      isNotified,
      action,
      parentId
    }: { isNotified: boolean; action: string; parentId: string }
  ) {
    const selector: any = { parentId, action };

    if (typeof isNotified !== 'undefined') {
      selector.isNotified = isNotified;
    }

    return RobotEntries.find(selector);
  },

  onboardingStepsCompleteness(
    _root,
    { steps }: { steps: string[] },
    { user }: IContext
  ) {
    return OnboardingHistories.stepsCompletness(steps, user);
  },

  async onboardingGetAvailableFeatures(_root, _args, { user }: IContext) {
    const results: Array<{
      name: string;
      isComplete: boolean;
      settings?: string[];
      showSettings?: boolean;
    }> = [];
    const actionsMap = await getUserAllowedActions(user);

    for (const value of Object.keys(features)) {
      const { settings, feature } = features[value];

      const { showModule, showSettings } = checkShowModule(
        user,
        actionsMap,
        value,
        feature
      );

      if (showModule) {
        let steps: string[] = [];

        if (showSettings) {
          steps = [...steps, ...settings];
        }

        const selector = {
          userId: user._id,
          completedSteps: { $all: steps }
        };

        results.push({
          name: value,
          settings,
          showSettings,
          isComplete:
            (await OnboardingHistories.find(selector).countDocuments()) > 0
        });
      }
    }

    return results;
  }
};

moduleRequireLogin(robotQueries);

export default robotQueries;
