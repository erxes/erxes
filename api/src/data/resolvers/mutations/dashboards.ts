import { DashboardItems, Dashboards } from '../../../db/models';
import {
  IDashboard,
  IDashboardItemInput
} from '../../../db/models/definitions/dashboard';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { getDashboardFile, getSubServiceDomain, sendEmail } from '../../utils';

interface IDashboardEdit extends IDashboard {
  _id: string;
}
interface IDashboardItemEdit extends IDashboardItemInput {
  _id: string;
}

interface IDashboardEmailParams {
  dashboardId: string;
  toEmails: string[];
  subject: string;
  content: string;
  sendUrl: boolean;
  attachmentType: string;
}

const dashboardsMutations = {
  async dashboardAdd(_root, doc: IDashboard, { docModifier, user }: IContext) {
    const dashboard = await Dashboards.create(docModifier(doc));

    await putCreateLog(
      {
        type: MODULE_NAMES.DASHBOARD,
        newData: doc,
        object: dashboard,
        description: `Dashboard "${doc.name}" has been created`
      },
      user
    );

    return dashboard;
  },

  async dashboardEdit(_root, { _id, ...fields }: IDashboardEdit) {
    return Dashboards.editDashboard(_id, fields);
  },

  async dashboardRemove(_root, { _id }: { _id: string }) {
    return Dashboards.removeDashboard(_id);
  },

  async dashboardItemAdd(_root, doc: IDashboardItemInput, { user }: IContext) {
    const dashboardItem = await DashboardItems.addDashboardItem({ ...doc });

    await putCreateLog(
      {
        type: MODULE_NAMES.DASHBOARD_ITEM,
        newData: doc,
        object: dashboardItem,
        description: `Dashboard item "${doc.name}" has been created`
      },
      user
    );

    return dashboardItem;
  },

  async dashboardItemEdit(_root, { _id, ...fields }: IDashboardItemEdit) {
    return DashboardItems.editDashboardItem(_id, fields);
  },

  async dashboardItemRemove(_root, { _id }: { _id: string }) {
    return DashboardItems.removeDashboardItem(_id);
  },

  async dashboardSendEmail(_root, args: IDashboardEmailParams) {
    const { toEmails, subject, content, dashboardId, sendUrl } = args;

    const file = await getDashboardFile(dashboardId);
    const data = { content } as any;

    if (sendUrl) {
      const DASHBOARD_DOMAIN = getSubServiceDomain({
        name: 'DASHBOARD_DOMAIN'
      });

      data.url = `${DASHBOARD_DOMAIN}/details/${dashboardId}?public=true`;
    }

    sendEmail({
      toEmails,
      title: subject,
      template: {
        name: 'dashboard',
        data
      },

      attachments: [{ filename: 'dashboard.pdf', content: file }]
    });
  }
};

checkPermission(dashboardsMutations, 'dashboardItemAdd', 'dashboardItemAdd');
checkPermission(dashboardsMutations, 'dashboardItemEdit', 'dashboardItemEdit');
checkPermission(
  dashboardsMutations,
  'dashboardItemRemove',
  'dashboardItemRemove'
);
checkPermission(dashboardsMutations, 'dashboardAdd', 'dashboardAdd');
checkPermission(dashboardsMutations, 'dashboardEdit', 'dashboardEdit');
checkPermission(dashboardsMutations, 'dashboardRemove', 'dashboardRemove');

export default dashboardsMutations;
