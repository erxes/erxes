export default {
  id(obj) {
    return obj.activity.id;
  },

  action(obj) {
    return `${obj.activity.type}-${obj.activity.action}`;
  },

  content(obj) {
    return obj.activity.content;
  },
};
