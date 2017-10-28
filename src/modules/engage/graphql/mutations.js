const setPause = `
  mutation setPause($_id: String!) {
    engageMessageSetPause(_id: $_id) {
      _id
    }
  }
`;

const setLive = `
  mutation setLive($_id: String!) {
    engageMessageSetLive(_id: $_id) {
      _id
    }
  }
`;

const setLiveManual = `
  mutation setLiveManual($_id: String!) {
    engageMessageSetLiveManual(_id: $_id) {
      _id
    }
  }
`;

const messagesAdd = `
  mutation setPause($_id: String!) {
    engageMessageSetPause(_id: $_id) {
      _id
    }
  }
`;

const messageRemove = `
  mutation engageMessageRemove($_id: String!) {
    engageMessageRemove(_id: $_id) {
      _id
    }
  }
`;

export default {
  setPause,
  setLive,
  setLiveManual,
  messageRemove,
  messagesAdd
};
