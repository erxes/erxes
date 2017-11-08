const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const ICON_COLOR_TABLE = {
  'customer-create': {
    icon: 'android-bar',
    color: '#A389D4'
  },
  'segment-create': {
    icon: 'android-bicycle',
    color: '#04A9F5'
  },
  'conversation-create': {
    icon: 'android-boat',
    color: '#F44236'
  }

  // reserved
  // icon: 'android-bus',
  // color: '#F5C22B'

  // icon: 'android-calendar',
  // color: '#67C682'
};

export default class {
  constructor(queryData) {
    this.queryData = queryData;
  }

  _processItem({ date, list }) {
    // console.log('date: ', date);
    // console.log('item: ', item);

    const { year, month } = date;

    let result = {
      title: `${MONTHS[month]} ${year}`,
      data: []
    };

    for (let item of list) {
      const iconAndColor = this._getIconAndColor(item.action);

      const caption = this._getCaption({
        action: item.action,
        content: item.content
      });

      result.data.push({
        ...iconAndColor,
        caption,
        date: item.createdAt
      });
    }

    return result;
  }

  _getIconAndColor(action) {
    return ICON_COLOR_TABLE[action];
  }

  _getCaption({ action, content }) {
    let caption;

    switch (action) {
      case 'customer-create':
        caption = 'Registered to Erxes';
        break;
      case 'segment-create':
        caption = `Moved to  ${content.name} segment`;
        break;
      default:
        caption = action;
    }

    return caption;
  }

  process() {
    let result = [];

    for (let item of this.queryData) {
      result.push(this._processItem(item));
    }

    console.log('result: ', result);
    return result;
  }
}
