import {
  TChooserItem,
  TFixedAssetChoice,
  fixedAssetChoiceKey,
} from '@/settings/fixed-assets/components/chooser/types';

export const sameFxaChoiceLocation = (
  left: TFixedAssetChoice,
  right: TFixedAssetChoice,
): boolean =>
  left.asset._id === right.asset._id &&
  left.location?.branchId === right.location?.branchId &&
  left.location?.departmentId === right.location?.departmentId;

export const addFxaChoices = (
  previous: TFixedAssetChoice[],
  incoming: TFixedAssetChoice[],
  multiple: boolean,
  assetScoped: boolean,
): TFixedAssetChoice[] => {
  if (!multiple) return incoming.slice(0, 1);
  return incoming.reduce((selected, choice) => {
    const next = selected.filter((other) => {
      if (assetScoped) return other.asset._id !== choice.asset._id;
      if (!sameFxaChoiceLocation(other, choice)) return true;
      return (
        Boolean(other.owner && choice.owner) &&
        fixedAssetChoiceKey(other) !== fixedAssetChoiceKey(choice)
      );
    });
    return [...next, choice];
  }, previous);
};

export const availableFxaChooserItems = (
  items: TChooserItem[],
  selected: TFixedAssetChoice[],
  assetScoped: boolean,
): TChooserItem[] =>
  items.flatMap((item) => {
    const assetSelections = selected.filter(
      (choice) => choice.asset._id === item.asset._id,
    );
    if (assetScoped && assetSelections.length) return [];
    const locations = item.locations.flatMap((location) => {
      const atLocation = assetSelections.filter((choice) =>
        sameFxaChoiceLocation(choice, { asset: item.asset, location }),
      );
      if (atLocation.some((choice) => !choice.owner)) return [];
      return [
        {
          ...location,
          owners: location.owners.filter(
            (owner) =>
              !atLocation.some(
                (choice) =>
                  fixedAssetChoiceKey(choice) ===
                  fixedAssetChoiceKey({ asset: item.asset, location, owner }),
              ),
          ),
        },
      ];
    });
    return locations.length ? [{ ...item, locations }] : [];
  });

export const fxaGroupChoices = (
  item: TChooserItem,
  selected: TFixedAssetChoice[],
  assetScoped: boolean,
  allLocations: boolean,
): TFixedAssetChoice[] => {
  if (allLocations) return [{ asset: item.asset }];
  if (assetScoped)
    return item.locations[0]
      ? [{ asset: item.asset, location: item.locations[0] }]
      : [];
  return item.locations
    .filter(
      (location) =>
        !selected.some((choice) =>
          sameFxaChoiceLocation(choice, { asset: item.asset, location }),
        ),
    )
    .map((location) => ({ asset: item.asset, location }));
};
