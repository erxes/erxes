import { connect, disconnect } from './db/connection';

export const customCommand = async () => {
  connect();

  // Do custom logic

  disconnect();
};

customCommand();
