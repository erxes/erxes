import type { AccountingTunableReportFieldsFragment } from '~/gql/graphql';
import { useApolloClient, useMutation } from '@apollo/client';
import { useConfirm } from 'erxes-ui';
import { usePermissionCheck } from 'ui-modules';
import { REPORT_SAVE, REPORT_REMOVE } from '@/tunable-reports/graphql';
import { orderedReport } from '@/tunable-reports/values';
import { ReportValues } from '@/tunable-reports/schema';
import { useReportTranslation } from '@/tunable-reports/locales';
import {
  notifyMutationResult,
  withMutationToast,
} from '@/utils/graphqlMutation';

type ReportIdentity = { _id: string; version: number };
interface ReportActions {
  saveReport: (
    values: ReportValues,
    report?: ReportIdentity,
  ) => Promise<AccountingTunableReportFieldsFragment | undefined>;
  removeReport: (report: ReportIdentity) => Promise<boolean>;
  saving: boolean;
  removing: boolean;
  canManage: boolean;
  canRemove: boolean;
}
export const useReportActions = (): ReportActions => {
  const { t } = useReportTranslation();
  const { confirm } = useConfirm();
  const { hasActionPermission } = usePermissionCheck();
  const client = useApolloClient();
  const refresh = () => {
    client.cache.evict({ fieldName: 'accountingTunableReports' });
    const queries = [...client.getObservableQueries('active').values()]
      .filter((query) => query.queryName === 'AccountingTunableReports')
      .map((query) => query.options.query);
    if (queries.length) {
      void client
        .refetchQueries({ include: queries })
        .catch((error: Error) => notifyMutationResult(false, error.message));
    }
  };
  const [save, saveState] = useMutation(
    REPORT_SAVE,
    withMutationToast({ update: refresh }, notifyMutationResult, t('saved')),
  );
  const [remove, removeState] = useMutation(
    REPORT_REMOVE,
    withMutationToast(
      {
        update: (cache, result, { variables }) => {
          if (result.data?.accountingTunableReportRemove && variables?._id) {
            cache.evict({
              id: cache.identify({
                __typename: 'AccountingTunableReport',
                _id: variables._id,
              }),
            });
            cache.evict({
              fieldName: 'accountingTunableReportDetail',
              args: { _id: variables._id },
            });
          }
          refresh();
        },
      },
      notifyMutationResult,
      t('deleted'),
    ),
  );
  const removeReport = async (report: {
    _id: string;
    version: number;
  }): Promise<boolean> => {
    try {
      await confirm({ message: t('deleteConfirm') });
    } catch {
      return false;
    }
    try {
      await remove({
        variables: { _id: report._id, expectedVersion: report.version },
      });
      return true;
    } catch {
      return false;
    }
  };
  const saveReport = async (
    values: ReportValues,
    report?: { _id: string; version: number },
  ) => {
    const result = await save({
      variables: {
        input: orderedReport(values),
        _id: report?._id,
        expectedVersion: report?.version,
      },
    });
    return result.data?.accountingTunableReportSave;
  };
  return {
    saveReport,
    removeReport,
    saving: saveState.loading,
    removing: removeState.loading,
    canManage: hasActionPermission('manageTunableReports'),
    canRemove: hasActionPermission('removeTunableReports'),
  };
};
