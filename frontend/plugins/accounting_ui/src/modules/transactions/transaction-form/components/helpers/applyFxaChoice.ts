import { getFxaDetailDefaultValues } from '@/transactions/transaction-form/components/helpers/fxaHelpers';
import { ITransactionGroupForm } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';
import { TFixedAssetChoice } from '@/settings/fixed-assets/components/chooser/types';
import { sameFxaChoiceLocation } from '@/settings/fixed-assets/components/chooser/selection';
import { getTempId } from '@/transactions/transaction-form/components/utils';

export const applyFxaChoice = (
  form: ITransactionGroupForm,
  journalIndex: number,
  detailIndex: number,
  choice: TFixedAssetChoice,
) => {
  const doc = form.getValues(`trDocs.${journalIndex}`);
  if (
    doc.journal !== TrJournalEnum.FXA_OUT &&
    doc.journal !== TrJournalEnum.FXA_MOVE &&
    doc.journal !== TrJournalEnum.FXA_SALE
  )
    return;
  const detail = doc.details[detailIndex];
  const assetId = choice.asset._id;
  const location = choice.location;
  if (!detail || !assetId || !location) return;
  const count = Math.min(
    Math.max(1, Math.trunc(detail.count || 1)),
    location.remainder,
    choice.owner?.count ?? location.remainder,
  );
  const unitPrice =
    doc.journal === TrJournalEnum.FXA_SALE
      ? detail.unitPrice || 0
      : choice.asset.originalCost || 0;
  const changed =
    detail.fixedAssetId !== assetId ||
    (detail.branchId || doc.branchId || '') !== location.branchId ||
    (detail.departmentId || doc.departmentId || '') !== location.departmentId;
  const clearBranch = !location.branchId && Boolean(doc.branchId);
  const clearDepartment = !location.departmentId && Boolean(doc.departmentId);
  // Materialize other rows' inherited locations before clearing a header default.
  const details = doc.details.map((row, index) =>
    index === detailIndex
      ? {
          ...detail,
          fixedAssetId: assetId,
          fixedAssetCategoryId: choice.asset.categoryId || '',
          fixedAssetCode: choice.asset.code || '',
          fixedAssetName: choice.asset.name || '',
          accountId:
            doc.journal === TrJournalEnum.FXA_SALE
              ? detail.accountId
              : detail.accountId || choice.asset.accountId || '',
          branchId: location.branchId,
          departmentId: location.departmentId,
          branch: undefined,
          department: undefined,
          count,
          unitPrice,
          amount: count * unitPrice,
          followInfos: {
            ...detail.followInfos,
            ...(changed ? { preDeprecation: undefined } : {}),
          },
        }
      : {
          ...row,
          ...(clearBranch
            ? { branchId: row.branchId || doc.branchId || '' }
            : {}),
          ...(clearDepartment
            ? { departmentId: row.departmentId || doc.departmentId || '' }
            : {}),
        },
  );
  form.setValue(`trDocs.${journalIndex}.details`, details, {
    shouldDirty: true,
  });
  if (clearBranch)
    form.setValue(`trDocs.${journalIndex}.branchId`, '', { shouldDirty: true });
  if (clearDepartment)
    form.setValue(`trDocs.${journalIndex}.departmentId`, '', {
      shouldDirty: true,
    });
  const owners = (doc.extraData?.fxaOwnerRecords || []).filter(
    (row) => row.transactionDetailId !== detail._id,
  );
  if (choice.owner)
    owners.push({
      tempId: getTempId(),
      transactionDetailId: detail._id,
      fixedAssetId: assetId,
      ownerId: choice.owner.ownerId,
      code: choice.owner.code,
      count,
    });
  form.setValue(`trDocs.${journalIndex}.extraData.fxaOwnerRecords`, owners, {
    shouldDirty: true,
  });
};

export const applyFxaChoices = (
  form: ITransactionGroupForm,
  journalIndex: number,
  detailIndex: number,
  choices: TFixedAssetChoice[],
): void => {
  const doc = form.getValues(`trDocs.${journalIndex}`);
  if (
    doc.journal !== TrJournalEnum.FXA_OUT &&
    doc.journal !== TrJournalEnum.FXA_MOVE &&
    doc.journal !== TrJournalEnum.FXA_SALE
  )
    return;
  const template = doc.details[detailIndex];
  const selected = choices.filter(
    (choice) => choice.asset._id && choice.location,
  );
  if (!template || !selected.length) return;
  const additional = selected.slice(1).map((choice) =>
    getFxaDetailDefaultValues({
      ...template,
      fixedAssetId: '',
      fixedAssetCode: '',
      fixedAssetName: '',
      fixedAssetCategoryId: '',
      accountId:
        doc.journal === TrJournalEnum.FXA_SALE
          ? template.accountId
          : choice.asset.accountId || '',
      branchId: choice.location?.branchId || '',
      departmentId: choice.location?.departmentId || '',
      count: 1,
      amount: 0,
      followInfos: { ...template.followInfos, preDeprecation: undefined },
    }),
  );
  if (additional.length)
    form.setValue(
      `trDocs.${journalIndex}.details`,
      [
        ...doc.details.slice(0, detailIndex + 1),
        ...additional,
        ...doc.details.slice(detailIndex + 1),
      ],
      { shouldDirty: true },
    );
  // Each additional selection needs at least one unit at its source location.
  const first = selected[0];
  if (first.location) {
    const reserved = selected
      .slice(1)
      .filter((choice) => sameFxaChoiceLocation(first, choice)).length;
    form.setValue(
      `trDocs.${journalIndex}.details.${detailIndex}.count`,
      Math.min(template.count || 1, first.location.remainder - reserved),
      { shouldDirty: true },
    );
  }
  selected.forEach((choice, index) =>
    applyFxaChoice(form, journalIndex, detailIndex + index, choice),
  );
};
