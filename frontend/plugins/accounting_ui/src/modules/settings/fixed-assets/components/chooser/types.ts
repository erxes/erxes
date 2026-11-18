import type { ResultOf } from '@graphql-typed-document-node/core';
import { FIXED_ASSET_CHOOSER } from '@/settings/fixed-assets/components/chooser/graphql';

export type TChooserItem = ResultOf<
  typeof FIXED_ASSET_CHOOSER
>['accountingFixedAssetChooser']['items'][number];
export type TChooserLocation = TChooserItem['locations'][number];
export type TChooserOwner = TChooserLocation['owners'][number];
export type TFixedAssetChoice = {
  asset: TChooserItem['asset'];
  location?: TChooserLocation;
  owner?: TChooserOwner;
};
export const fixedAssetChoiceKey = (choice: TFixedAssetChoice) =>
  JSON.stringify([
    choice.asset._id,
    choice.location?.branchId,
    choice.location?.departmentId,
    choice.owner?.ownerId,
    choice.owner?.code,
  ]);
