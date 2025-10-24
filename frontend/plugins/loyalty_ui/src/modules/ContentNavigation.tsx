import { IconLibraryPhoto } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const ContentNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        icon={IconLibraryPhoto}
        name="loyalty"
        path="loyalty"
      />
      <NavigationMenuLinkItem
        icon={IconLibraryPhoto}
        name="pricing"
        path="pricing"
      />
      {/*
      <NavigationMenuLinkItem
        icon={IconLibraryPhoto}
        name="spin"
        path="loyalty/spin"
      />
      <NavigationMenuLinkItem
        icon={IconLibraryPhoto}
        name="Donation"
        path="loyalty/donation"
      />
      <NavigationMenuLinkItem
        icon={IconLibraryPhoto}
        name="score"
        path="loyalty/score"
      />
      <NavigationMenuLinkItem
        icon={IconLibraryPhoto}
        name="assignments"
        path="loyalty/assignment"
      />
      <NavigationMenuLinkItem
        icon={IconLibraryPhoto}
        name="Coupen"
        path="loyalty/coupen"
      /> */}
    </>
  );
};
