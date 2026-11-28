import mongoose from 'mongoose';

import { closeMongooose } from './mongo-connection';

describe('mongo connection shutdown', () => {
  let exit: jest.SpyInstance;

  beforeEach(() => {
    exit = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('exits when the database connection drops on its own', () => {
    mongoose.connection.emit('disconnected');

    expect(exit).toHaveBeenCalledWith(1);
  });

  it('does not exit when closeMongooose closed the connection, so shutdown can finish', async () => {
    jest.spyOn(mongoose.connection, 'close').mockImplementation(async () => {
      mongoose.connection.emit('disconnected');
    });

    await closeMongooose();

    expect(exit).not.toHaveBeenCalled();
  });
});
