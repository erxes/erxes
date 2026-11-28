import { config } from '~/config';
import { deriveKey } from './crypto';

export const coreKey = (info: string) => deriveKey(config.auth.encryptionKey, info);
