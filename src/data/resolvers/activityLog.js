export default {
  action(obj) {
    return `${obj.type}-${obj.action}`;
  },

  content(obj) {
    return obj.activity.content;
  },
};
