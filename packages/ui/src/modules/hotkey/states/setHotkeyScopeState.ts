import { atom } from 'jotai';
import { currentHotkeyScopeState } from './internal/currentHotkeyScopeState';
import { HotkeyScope } from '../types/HotkeyScope';
import { isDefined } from 'erxes-ui/utils/isDefined';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES } from '../constants/defaultHotkeysScopeCustomScopes';
import { AppHotkeyScope } from '../types/AppHotkeyScope';
import { internalHotkeysEnabledScopesState } from './internal/internalHotkeysEnabledScopeState';

const isCustomScopesEqual = (
  customScopesA: CustomHotkeyScopes | undefined,
  customScopesB: CustomHotkeyScopes | undefined,
) => {
  return (
    customScopesA?.commandMenu === customScopesB?.commandMenu &&
    customScopesA?.commandMenuOpen === customScopesB?.commandMenuOpen &&
    customScopesA?.sidebar === customScopesB?.sidebar &&
    customScopesA?.keyboardShortcuts === customScopesB?.keyboardShortcuts
  );
};

export const setHotkeyScopeState = atom(
  null,
  (
    get,
    set,
    newScope: {
      scope: string;
      customScopes?: CustomHotkeyScopes;
    },
  ) => {
    const currentHotkeyScope = get(currentHotkeyScopeState);

    if (currentHotkeyScope.scope === newScope.scope) {
      if (!isDefined(newScope.customScopes)) {
        if (
          isCustomScopesEqual(
            currentHotkeyScope.customScopes,
            DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES,
          )
        ) {
          return;
        }
      } else {
        if (
          isCustomScopesEqual(
            currentHotkeyScope.customScopes,
            newScope.customScopes,
          )
        ) {
          return;
        }
      }
    }

    const { commandMenu, commandMenuOpen, sidebar, keyboardShortcuts } =
      newScope.customScopes ?? {};

    const newHotkeyScope: HotkeyScope = {
      scope: newScope.scope,
      customScopes: {
        commandMenu: commandMenu ?? true,
        commandMenuOpen: commandMenuOpen ?? true,
        sidebar: sidebar ?? true,
        keyboardShortcuts: keyboardShortcuts ?? false,
      },
    };

    const scopesToSet: string[] = [];

    if (newHotkeyScope.customScopes?.commandMenu === true) {
      scopesToSet.push(AppHotkeyScope.CommandMenu);
    }

    if (newHotkeyScope.customScopes?.commandMenuOpen === true) {
      scopesToSet.push(AppHotkeyScope.CommandMenuOpen);
    }

    if (newHotkeyScope.customScopes?.sidebar === true) {
      scopesToSet.push(AppHotkeyScope.Sidebar);
    }

    if (newHotkeyScope.customScopes?.keyboardShortcuts === true) {
      scopesToSet.push(AppHotkeyScope.KeyboardShortcuts);
    }

    scopesToSet.push(newHotkeyScope.scope);

    set(internalHotkeysEnabledScopesState, scopesToSet);
    set(currentHotkeyScopeState, newHotkeyScope);
  },
);
