import {
  assertLockAccess,
  resolveLockState,
  resolveLockStates,
} from './resolveLockState';

export const checkApprovalLock = {
  state: resolveLockState,
  states: resolveLockStates,
  assert: assertLockAccess,
};
