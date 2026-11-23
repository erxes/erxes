import { createContext, type ReactNode, use } from 'react';
import type { Member } from '../modules/pickers/members';

/**
 * The signed-in member, their organisation and what they may do, as core's `auth.me` answers.
 * Core's `Session` has these fields and more.
 */
export interface HostSession {
  user: Pick<Member, 'id' | 'email' | 'fullName' | 'username' | 'avatarUrl'>;
  organization: {
    id: string;
    name: string;
    country: string | null;
    currency: string;
    /** The other currencies it trades in, besides `currency`. */
    currencies: string[];
    timezone: string;
  };
  /** Actions, core's and installed plugins' (`accounting.account.import`); owners have all. */
  permissions: string[];
}

const SessionContext = createContext<HostSession | null>(null);

/** Gives plugin pages the signed-in session; web mounts it, plugins don't. */
export const HostSessionProvider = ({
  session,
  children,
}: {
  session: HostSession;
  children: ReactNode;
}) => <SessionContext value={session}>{children}</SessionContext>;

/**
 * The signed-in member, organisation and permissions; null outside erxes.
 * 3.x's `currentUserState` is its `user`, `currentOrganizationState` its `organization`.
 */
export const useHostSession = () => use(SessionContext);

/**
 * Whether the signed-in member may do an action.
 * It hides what the API would refuse: `hasActionPermission('accounting.account.import')`; the API checks again.
 */
export const usePermissionCheck = () => {
  const session = use(SessionContext);
  const permissions = new Set(session?.permissions ?? []);

  return {
    isLoaded: session !== null,
    hasActionPermission: (action: string) => permissions.has(action),
  };
};

/**
 * Its children for a member who may do `action`, else `fallback`.
 * With `actions`, any one of them will do. 3.x's `Can`: `<Can action="accounting.account.import"><Import … /></Can>`.
 */
export const Can = ({
  action,
  actions = [],
  fallback = null,
  children,
}: {
  action?: string;
  actions?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}) => {
  const { hasActionPermission } = usePermissionCheck();
  const wanted = action ? [action, ...actions] : actions;

  return wanted.some(hasActionPermission) ? children : fallback;
};
