import * as Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as ServiceRegistry from 'clerq';
import memoryStorage from 'erxes-inmemory-storage';

// load environment variables
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let client;

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
    console.log(
      `For removeKey oaf inmemoryStorage, key: ${key}. Error: ${e.message}`
    );
  }
};

export const removeFromArray = async (setKey: string, setMember: any) => {
  try {
    if (setKey && setMember) {
      await client.removeFromArray(setKey, setMember);
    }
  } catch (e) {
    console.log(
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
    console.log(
      `For addToArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const inArray = async (setKey: string, setMember: any) => {
  try {
    return await client.inArray(setKey, setMember);
  } catch (e) {
    console.log(
      `For inArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const set = async (key: string, value: any) => {
  try {
    client.set(key, value);
  } catch (e) {
    console.log(
      `For set of inmemoryStorage, key: ${key}, value: ${value}. Error: ${e.message}`
    );
  }
};

export const get = async (key: string, defaultValue?: any) => {
  try {
    return await client.get(key, defaultValue);
  } catch (e) {
    console.log(
      `For get of inmemoryStorage, key: ${key}, default value: ${defaultValue}. Error: ${e.message}`
    );
  }
};

export default function() {
  return client;
}
