import { generateFolkConnection } from '@/automations/utils/automationBuilderUtils/connectionUtils';
import {
  folkKeyOfHandle,
  isBranchingOnError,
  resolveActionFolks,
} from './actionFolks';

const declared = {
  if: [
    { key: 'yes', label: 'Yes', type: 'success' as const },
    { key: 'no', label: 'No', type: 'error' as const },
  ],
};

const branchingConfig = { errorPolicy: { onError: 'branch' } };

describe('resolveActionFolks', () => {
  it('gives an action only the folks its type declares', () => {
    expect(resolveActionFolks('if', {}, declared).map((f) => f.key)).toEqual([
      'yes',
      'no',
    ]);
    expect(resolveActionFolks('outgoingWebhook', {}, declared)).toEqual([]);
  });

  it('adds the success/error pair once the node branches on error', () => {
    expect(
      resolveActionFolks('outgoingWebhook', branchingConfig, declared).map(
        (f) => f.key,
      ),
    ).toEqual(['onSuccessActionId', 'onErrorActionId']);

    expect(
      resolveActionFolks('if', branchingConfig, declared).map((f) => f.key),
    ).toEqual(['yes', 'no', 'onSuccessActionId', 'onErrorActionId']);
  });

  it('reads the policy off the node, not the action type', () => {
    expect(isBranchingOnError(branchingConfig)).toBe(true);
    expect(isBranchingOnError({ errorPolicy: { onError: 'fail' } })).toBe(
      false,
    );
    expect(isBranchingOnError(undefined)).toBe(false);
  });
});

describe('folkKeyOfHandle', () => {
  const folks = resolveActionFolks('if', branchingConfig, declared);

  it('names the exit a handle belongs to', () => {
    expect(folkKeyOfHandle('yes-right', folks)).toBe('yes');
    expect(folkKeyOfHandle('onErrorActionId-right', folks)).toBe(
      'onErrorActionId',
    );
  });

  it('leaves a plain connection alone', () => {
    expect(folkKeyOfHandle('right', folks)).toBeUndefined();
    expect(folkKeyOfHandle(null, folks)).toBeUndefined();
    // An exit this node does not have must never be written to its config.
    expect(folkKeyOfHandle('isExists-right', folks)).toBeUndefined();
  });
});

describe('generateFolkConnection', () => {
  const node = { id: 'n1', type: 'outgoingWebhook', config: { url: 'x' } };

  it('stores the target under the folk key and keeps the rest of the config', () => {
    const updated = generateFolkConnection(
      node as never,
      'n2',
      'onErrorActionId',
    );

    expect(updated.config).toEqual({ url: 'x', onErrorActionId: 'n2' });
  });

  it('clears the target when the edge is removed', () => {
    const updated = generateFolkConnection(node as never, '', 'yes');

    expect(updated.config).toEqual({ url: 'x', yes: '' });
  });
});
