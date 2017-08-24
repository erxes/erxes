import gql from 'graphql-tag';
import client from '../apollo-client';

export const connection = {
  setting: {},
  data: {},
};

export const connect = variables =>
  // call connect mutation
  client.query({
    query: gql`
      query kbLoader($topicId: String!) {
        kbLoader(topicId: $topicId) {
          loadType
        }
      }`,
    variables,
  });

// get local storage
const getLocalStorage = () =>
  JSON.parse(localStorage.getItem('erxes') || '{}');

// get local storage item
export const getLocalStorageItem = (key) => {
  const erxesStorage = getLocalStorage();

  return erxesStorage[key];
};
