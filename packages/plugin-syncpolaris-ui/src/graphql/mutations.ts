// Settings

const toCheckPolaris = `
  mutation toCheckPolaris($type: String) {
    toCheckPolaris(type: $type)
  }
`;

const toSyncPolaris = `
  mutation toSyncPolaris($type: String, $items: [JSON]) {
    toSyncPolaris(type: $type, items: $items)
  }
`;

export default {
  toCheckPolaris,
  toSyncPolaris,
};
