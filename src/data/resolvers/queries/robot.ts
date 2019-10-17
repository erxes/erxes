import { RobotEntries } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { OnboardingHistories } from '../../../db/models/Robot';
import { moduleObjects } from '../../permissions/actions/permission';
import { getUserAllowedActions, IModuleMap } from '../../permissions/utils';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const features: { [key: string]: { settings: string[]; settingsPermissions: string[] } } = {
  growthHacks: {
    settings: ['growthHackBoardsCreate', 'growthHackPipelinesCreate', 'growthHackCreate'],
    settingsPermissions: ['growthHackBoardsAdd', 'growthHackPipelinesAdd', 'growthHackStagesAdd'],
  },
  inbox: {
    settings: [
      'brandCreate',
      'channelCreate',
      'messengerIntegrationCreate',
      'responseTemplateCreate',
      'connectIntegrationsToChannel',
    ],
    settingsPermissions: [
      'manageBrands',
      'manageChannels',
      'integrationsCreateMessengerIntegration',
      'manageResponseTemplate',
    ],
  },
  deals: {
    settings: ['dealBoardsCreate', 'dealPipelinesCreate', 'dealCreate', 'configure.dealCurrency', 'configure.dealUOM'],
    settingsPermissions: ['dealBoardsAdd', 'dealPipelinesAdd', 'dealStagesAdd', 'manageGeneralSettings'],
  },
  leads: {
    settings: ['leadIntegrationCreate', 'leadIntegrationInstalled'],
    settingsPermissions: ['integrationsCreateLeadIntegration'],
  },
  engages: {
    settings: ['emailTemplateCreate', 'tagCreate', 'engageCreate'],
    settingsPermissions: ['manageEmailTemplate', 'manageTags', 'engageMessageAdd'],
  },
  tasks: {
    settings: ['taskBoardsCreate', 'taskPipelinesCreate', 'taskCreate'],
    settingsPermissions: ['taskBoardsAdd', 'taskPipelinesAdd', 'taskStagesAdd'],
  },
  tickets: {
    settings: ['ticketBoardsCreate', 'ticketPipelinesCreate', 'ticketCreate'],
    settingsPermissions: ['ticketBoardsAdd', 'ticketPipelinesAdd', 'ticketStagesAdd'],
  },
  knowledgeBase: {
    settings: ['knowledgeBaseTopicCreate', 'knowledgeBaseCategoryCreate', 'knowledgeBaseArticleCreate'],
    settingsPermissions: ['manageKnowledgeBase'],
  },
  customers: {
    settings: ['customerCreate', 'companyCreate', 'productCreate'],
    settingsPermissions: ['customersAdd', 'companiesAdd', 'manageProducts'],
  },
  segments: {
    settings: ['customerSegmentCreate', 'companySegmentCreate'],
    settingsPermissions: ['manageSegments'],
  },
  tags: {
    settings: ['customerTagCreate', 'companyTagCreate'],
    settingsPermissions: ['manageTags'],
  },
  properties: {
    settings: ['customerFieldCreate', 'companyFieldCreate'],
    settingsPermissions: ['manageForms'],
  },
  permissions: {
    settings: ['permissionCreate'],
    settingsPermissions: ['managePermissions'],
  },
  integrations: {
    settings: ['messengerIntegrationCreate', 'facebookIntegrationCreate'],
    settingsPermissions: ['integrationsCreateMessengerIntegration'],
  },
  insights: {
    settings: ['showInsights'],
    settingsPermissions: ['showInsights'],
  },
  importHistories: {
    settings: ['customer_template.xlsxDownload', 'company_template.xlsxDownload'],
    settingsPermissions: ['importXlsFile'],
  },
};

const checkShowModule = (
  user: IUserDocument,
  actionsMap,
  moduleName: string,
): { showModule: boolean; showSettings: boolean } => {
  if (user.isOwner) {
    return {
      showModule: true,
      showSettings: true,
    };
  }

  const module: IModuleMap = moduleObjects[moduleName];

  interface IAction {
    name: string;
    description?: string;
  }

  let actions: IAction[] = [];
  let showModule = false;
  let showSettings = true;

  if (!module) {
    if (moduleName === 'leads') {
      actions = [{ name: 'integrationsCreateLeadIntegration' }];
    }

    if (moduleName === 'properties') {
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
    showSettings,
  };
};

const robotQueries = {
  robotEntries(_root, { isNotified, action }: { isNotified: boolean; action: string }) {
    const selector: any = { parentId: null, action };

    if (typeof isNotified !== 'undefined') {
      selector.isNotified = isNotified;
    }

    return RobotEntries.find(selector);
  },

  onboardingStepsCompleteness(_root, { steps }: { steps: string[] }, { user }: IContext) {
    return OnboardingHistories.stepsCompletness(steps, user);
  },

  async onboardingGetAvailableFeatures(_root, _args, { user }: IContext) {
    const results: Array<{ name: string; isComplete: boolean; settings?: string[]; showSettings?: boolean }> = [];
    const actionsMap = await getUserAllowedActions(user);

    for (const feature of Object.keys(features)) {
      const { settings } = features[feature];
      const { showModule, showSettings } = checkShowModule(user, actionsMap, feature);

      if (showModule) {
        let steps: string[] = [];
        // let steps = [`${feature}Show`];

        if (showSettings) {
          steps = [...steps, ...settings];
        }

        const selector = { userId: user._id, completedSteps: { $all: steps } };

        results.push({
          name: feature,
          settings,
          showSettings,
          isComplete: (await OnboardingHistories.find(selector).countDocuments()) > 0,
        });
      }
    }

    return results;
  },
};

moduleRequireLogin(robotQueries);

export default robotQueries;
