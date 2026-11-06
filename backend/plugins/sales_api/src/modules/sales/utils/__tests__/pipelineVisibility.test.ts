import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { visiblePipelinesQuery } from '../pipelineVisibility';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const user = (doc: Record<string, unknown>) => doc as never;

describe('visiblePipelinesQuery', () => {
  beforeEach(() => (sendTRPCMessage as jest.Mock).mockReset());

  it('gives an owner every active pipeline without asking core', async () => {
    expect(
      await visiblePipelinesQuery('test', user({ _id: 'u1', isOwner: true })),
    ).toEqual({ status: { $ne: 'archived' } });
    expect(sendTRPCMessage).not.toHaveBeenCalled();
  });

  it('keeps others to public pipelines and private ones they belong to', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue({ departmentIds: ['d1'] });

    const query = await visiblePipelinesQuery('test', user({ _id: 'u1' }));

    expect(query.status).toEqual({ $ne: 'archived' });
    expect(query.$or).toEqual([
      { visibility: 'public' },
      {
        $and: [
          { visibility: 'private' },
          { $or: [{ memberIds: { $in: ['u1'] } }, { userId: 'u1' }] },
        ],
      },
      {
        $and: [{ visibility: 'private' }, { departmentIds: { $in: ['d1'] } }],
      },
    ]);
  });
});
