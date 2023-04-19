let client;

export const initBroker = async cl => {
  client = cl;
};

export default function() {
  return client;
}
