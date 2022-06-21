import memoryStorage from 'erxes-inmemory-storage';
import { debug } from './configs';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let client: any;

export const initMemoryStorage = () => {
  client = memoryStorage({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
  });
};

export const removeKey = async (key: string) => {
  try {
    return await client.removeKey(key);
  } catch (e) {
    debug.error(
      `For removeKey of inmemoryStorage, key: ${key}. Error: ${e.message}`
    );
  }
};

export const removeFromArray = async (setKey: string, setMember: any) => {
  try {
    if (setKey && setMember) {
      await client.removeFromArray(setKey, setMember);
    }
  } catch (e) {
    debug.error(
      `For removeFromArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const addToArray = async (setKey: string, setMember: any) => {
  try {
    if (setKey && setMember) {
      await client.addToArray(setKey, setMember);
    }
  } catch (e) {
    debug.error(
      `For addToArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const inArray = async (setKey: string, setMember: any) => {
  try {
    return await client.inArray(setKey, setMember);
  } catch (e) {
    debug.error(
      `For inArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const set = async (key: string, value: any) => {
  try {
    client.set(key, value);
  } catch (e) {
    debug.error(
      `For set of inmemoryStorage, key: ${key}, value: ${value}. Error: ${e.message}`
    );
  }
};

export const get = async (key: string, defaultValue?: any) => {
  try {
    return await client.get(key, defaultValue);
  } catch (e) {
    debug.error(
      `For get of inmemoryStorage, key: ${key}, default value: ${defaultValue}. Error: ${e.message}`
    );
  }
};

export default function() {
  return client;
}
