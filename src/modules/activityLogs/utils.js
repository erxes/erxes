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

const ICON_AND_COLOR_TABLE = {
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
  },
  'internal_note-create': {
    icon: 'android-bus',
    color: '#F5C22B'
  },
  'company-create': {
    icon: 'android-bicycle',
    color: '#04A9F5'
  }
};

/**
 * This class is used to process the data received from the query
 * and convert it into a data used on the front side.
 */
export default class {
  /**
   * A constructor method
   * @param {Ojbect} queryData - The query received from the back end
   */
  constructor(queryData, currentUser) {
    this.queryData = queryData;
    this.currentUser = currentUser;
  }

  /**
   * Process a row of query and return a row for use on the front side
   * @param {Object} date - Object containing year and month (interval)
   * @param {Object[]} list - List containing activity logs belonging to the current interval
   * @param {string} action - Activity log action
   * @param {Object} content - Object with a type of data related to its content type (action)
   * @return {Object} - Return processed data of a given interval
   */
  _processItem({ date, list }) {
    const { year, month } = date;

    let result = {
      title: `${MONTHS[month]} ${year}`,
      data: []
    };

    for (let item of list) {
      const iconAndColor = this._getIconAndColor(item.action);

      const caption = this._getCaption({
        action: item.action,
        content: item.content,
        by: item.by
      });

      result.data.push({
        ...iconAndColor,
        caption,
        date: item.createdAt,
        createdAt: item.createdAt,
        by: item.by
      });
    }

    return result;
  }

  /**
   * Get a related icon and color from the ICON_AND_COLOR_TABLE
   * @return {Object} return Object containing icon name and color
   */
  _getIconAndColor(action) {
    return ICON_AND_COLOR_TABLE[action];
  }

  /**
   * Make caption depending on the action and content value of the given activity log
   * @return {string} return the formed caption
   */
  _getCaption({ action, content, by }) {
    let caption;

    switch (action) {
      case 'customer-create':
        caption = 'Registered to Erxes';
        break;
      case 'segment-create':
        caption = `Moved to  ${content} segment`;
        break;
      case 'internal_note-create':
        caption = `Internal note was added '${content}'`;
        break;
      case 'conversation-create':
        caption = `Conversation message was added '${content}'`;
        break;
      case 'company-create':
        caption = `Registered to Erxes'`;
        break;
      default:
        caption = action;
    }

    if (by.type === 'USER') {
      if (by._id === this.currentUser._id) {
        caption += ' by you';
      } else {
        caption += ` by ${by.details.fullName}`;
      }
    }

    return caption;
  }

  /**
   * Process the data received from the query and return the proccessed list of logs
   * @return {Object[]} - Returns list of proccessed list of logs
   */
  process() {
    let result = [];

    for (let item of this.queryData) {
      result.push(this._processItem(item));
    }
    return result;
  }
}
