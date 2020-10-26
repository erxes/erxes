import { RobotEntries } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { OnboardingHistories } from '../../../db/models/Robot';
import { moduleObjects } from '../../permissions/actions/permission';
import { getUserAllowedActions, IModuleMap } from '../../permissions/utils';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const features: { [key: string]: { settings: string[]; settingsPermissions: string[] } } = {
  growthHacks: {
    settings: [
      'growthHackBoardsCreate',
      'growthHackPipelinesCreate',
      'growthHackTemplatesDuplicate',
      'growthHackCreate',
    ],
    settingsPermissions: [
      'growthHackBoardsAdd',
      'growthHackPipelinesAdd',
      'growthHackStagesAdd',
      'growthHackTemplatesDuplicate',
    ],
  },
  deals: {
    settings: ['dealBoardsCreate', 'dealPipelinesCreate', 'productCreate', 'dealCreate'],
    settingsPermissions: ['dealBoardsAdd', 'dealPipelinesAdd', 'dealStagesAdd', 'manageProducts'],
  },
  inbox: {
    settings: [
      'brandCreate',
      'channelCreate',
      'messengerIntegrationCreate',
      'connectIntegrationsToChannel',
      'responseTemplateCreate',
    ],
    settingsPermissions: [
      'manageBrands',
      'manageChannels',
      'integrationsCreateMessengerIntegration',
      'manageResponseTemplate',
    ],
  },
  engages: {
    settings: ['engageVerifyEmail', 'engageSendTestEmail', 'emailTemplateCreate', 'segmentCreate', 'engageCreate'],
    settingsPermissions: ['manageEmailTemplate', 'manageSegments', 'engageMessageAdd', 'engageMessageRemove'],
  },
  contacts: {
    settings: ['leadCreate', 'customerCreate', 'companyCreate', 'productCreate', 'fieldCreate', 'tagCreate'],
    settingsPermissions: ['customersAdd', 'companiesAdd', 'manageProducts', 'manageTags', 'manageForms'],
  },
  integrations: {
    settings: [
      'brandCreate',
      'messengerIntegrationCreate',
      'connectIntegrationsToChannel',
      'messengerIntegrationInstalled',
    ],
    settingsPermissions: ['integrationsCreateMessengerIntegration', 'manageChannels', 'manageBrands'],
  },
  leads: {
    settings: ['brandCreate', 'leadIntegrationCreate', 'leadIntegrationInstalled'],
    settingsPermissions: ['integrationsCreateLeadIntegration', 'manageBrands'],
  },
  knowledgeBase: {
    settings: [
      'brandCreate',
      'knowledgeBaseTopicCreate',
      'knowledgeBaseCategoryCreate',
      'knowledgeBaseArticleCreate',
      'knowledgeBaseInstalled',
    ],
    settingsPermissions: ['manageKnowledgeBase', 'manageBrands'],
  },
  tasks: {
    settings: ['taskBoardsCreate', 'taskPipelinesCreate', 'taskCreate', 'taskAssignUser'],
    settingsPermissions: ['taskBoardsAdd', 'taskPipelinesAdd', 'taskStagesAdd', 'taskAdd', 'taskEdit'],
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
  robotEntries(_root, { isNotified, action, parentId }: { isNotified: boolean; action: string; parentId: string }) {
    const selector: any = { parentId, action };

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
