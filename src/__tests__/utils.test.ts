import utils from '../data/utils';

describe('test utils', () => {
  it('test readFile', async () => {
    const data = await utils.readFile('notification');
    expect(data).toBeDefined();
  });
});
