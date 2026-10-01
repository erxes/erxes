import {
  resolveTriggerFolks,
  SEGMENT_MEMBERSHIP_EVENT,
  triggerStartActionIds,
} from './triggerFolks';

const membership = { event: SEGMENT_MEMBERSHIP_EVENT, segmentId: 'seg' };

describe('resolveTriggerFolks', () => {
  it('gives a membership trigger its enter and exit', () => {
    expect(resolveTriggerFolks(membership).map(({ key }) => key)).toEqual([
      'joined',
      'left',
    ]);
  });

  it('gives an ordinary trigger none', () => {
    expect(resolveTriggerFolks({ contentId: 'seg' })).toEqual([]);
  });
});

describe('triggerStartActionIds', () => {
  it('starts from each connected exit', () => {
    expect(
      triggerStartActionIds({ config: { ...membership, joined: 'a' } }),
    ).toEqual(['a']);
  });

  it('starts an ordinary trigger from its action and ignores config values', () => {
    expect(
      triggerStartActionIds({ actionId: 'a', config: { contentId: 'seg' } }),
    ).toEqual(['a']);
  });
});
