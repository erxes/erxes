// Settings

const toCheck = `
  mutation toCheck($type: String) {
    toCheck(type: $type)
  }
`;

const toSync = `
  mutation toSync($type: String, $items: [JSON]) {
    toSync(type: $type, items: $items)
  }
`;

export default {
  toCheck,
  toSync,
};
