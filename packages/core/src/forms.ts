import { USER_PROPERTIES_INFO } from "./constants";

export default {
  types: [
    {
      description: 'Team member',
      type: 'user'
    }
  ],
  systemFields: ({ data: { groupId } }) =>
    USER_PROPERTIES_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `core:user`,
      isDefinedByErxes: true
    }))
};
