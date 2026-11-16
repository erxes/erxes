import { IContext } from '~/connectionResolvers';
import { validateRequiredId } from '../../validateRequired';

export const reportMutations = {
  async accountingTunableReportSave(
    _root: unknown,
    {
      _id,
      expectedVersion,
      input,
    }: { _id?: string; expectedVersion?: number; input: unknown },
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('manageTunableReports');
    if (_id !== undefined) validateRequiredId(_id);
    return models.Reports.saveReport(input, user._id, _id, expectedVersion);
  },
  async accountingTunableReportRemove(
    _root: unknown,
    { _id, expectedVersion }: { _id: string; expectedVersion: number },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeTunableReports');
    validateRequiredId(_id);
    return models.Reports.removeReport(_id, expectedVersion);
  },
};
