import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import {
  AppearanceLayout,
  FrameColor,
  NavPosition,
  isAppearanceLayout,
  isFrameColor,
  isNavPosition,
} from '@/app/constants/appearance';
import { USERS_CONFIG_APPEARANCE } from '@/app/graphql/appearanceMutations';

type Appearance = {
  layout: AppearanceLayout;
  frameColor: FrameColor;
  navPosition: NavPosition;
};

// Saved on the user so it follows them across browsers and devices.
export const useAppearanceValue = (): Appearance => {
  const saved = useAtomValue(currentUserState)?.appearance;

  return {
    layout: isAppearanceLayout(saved?.layout) ? saved.layout : 'default',
    frameColor: isFrameColor(saved?.frameColor) ? saved.frameColor : 'indigo',
    navPosition: isNavPosition(saved?.navPosition)
      ? saved.navPosition
      : 'start',
  };
};

export const useAppearance = () => {
  const appearance = useAppearanceValue();
  const previous = useAtomValue(currentUserState)?.appearance;
  const setCurrentUser = useSetAtom(currentUserState);
  const { t } = useTranslation('organization');
  const [configAppearance, { loading }] = useMutation(USERS_CONFIG_APPEARANCE);

  const setAppearance = (change: Partial<Appearance>) => {
    const next = { ...appearance, ...change };

    // Apply at once; roll back if the save fails.
    setCurrentUser((prev) => (prev ? { ...prev, appearance: next } : prev));

    configAppearance({
      variables: next,
      onError: (error) => {
        setCurrentUser((prev) =>
          prev ? { ...prev, appearance: previous } : prev,
        );
        toast({
          title: t('appearance-save-failed', 'Could not save appearance'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { appearance, setAppearance, saving: loading };
};
