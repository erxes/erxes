import { atom } from 'jotai';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupEditSheetOpenAtom,
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupSettingsAtom,
  erxesMessengerSetupSheetOpenAtom,
  erxesMessengerSetupStepAtom,
  settedIntegrationDetailAtom,
} from './erxesMessengerSetupStates';

/**
 * Reset atom to clear all setup data
 */
export const resetErxesMessengerSetupAtom = atom(
  null,
  (_, set, dontCloseSheet = false) => {
    set(erxesMessengerSetupAppearanceAtom, null);
    set(erxesMessengerSetupGreetingAtom, null);
    set(erxesMessengerSetupIntroAtom, null);
    set(erxesMessengerSetupHoursAtom, null);
    set(erxesMessengerSetupSettingsAtom, null);
    set(erxesMessengerSetupConfigAtom, null);
    set(erxesMessengerSetupStepAtom, 1);
    set(erxesMessengerSetupSheetOpenAtom, false);
    !dontCloseSheet && set(erxesMessengerSetupEditSheetOpenAtom, false);
    set(settedIntegrationDetailAtom, false);
  },
);
