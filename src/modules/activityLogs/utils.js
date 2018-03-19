import React from 'react';
import { Link } from 'react-router-dom';

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
    icon: 'funnel',
    color: '#6569DF'
  },
  'conversation-create': {
    icon: 'android-chat',
    color: '#F44236'
  },
  'internal_note-create': {
    icon: 'clipboard',
    color: '#F5C22B'
  },
  'company-create': {
    icon: 'android-bar',
    color: '#6569DF'
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
  constructor({ activities, user, target, type }) {
    if (type === 'conversations') this.type = 'conversation-create';
    if (type === 'notes') this.type = 'internal_note-create';

    this.queryData = activities;
    this.currentUser = user;
    this.target = target || 'N/A';
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
      if (this.type && this.type !== item.action) continue;

      const iconAndColor = this._getIconAndColor(item.action);
      const hasContent =
        !['company-create', 'customer-create'].includes(item.action) &&
        item.content !== '[object Object]';

      const caption = this._getCaption({
        action: item.action,
        by: item.by,
        id: item.id
      });

      result.data.push({
        ...iconAndColor,
        caption,
        content: hasContent ? item.content : null,
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
   * Get source user full name or You label
   * @return {String} return String
   */
  _getUserName(by) {
    if (by._id === this.currentUser._id) return 'You';
    else return by.details.fullName;
  }

  /**
   * Make caption depending on the action and content value of the given activity log
   * @return {string} return the formed caption
   */
  _getCaption({ action, by, id }) {
    let caption;
    const source = <strong>{this._getUserName(by)}</strong>;
    const target = <strong>{this.target}</strong>;

    switch (action) {
      case 'customer-create':
        caption = by.details.fullName ? (
          <span>
            {source} registered {target} to Erxes
          </span>
        ) : (
          <span>{target} registered to Erxes</span>
        );
        break;

      case 'segment-create':
        caption = <span>{target} created a segment</span>;
        break;

      case 'internal_note-create':
        caption = (
          <span>
            {source} left a note about {target}
          </span>
        );
        break;

      case 'conversation-create':
        caption = (
          <span>
            {target} sent a&nbsp;
            <Link to={`/inbox?_id=${id}`}>
              <strong>conversation</strong>
            </Link>
            &nbsp;message
          </span>
        );
        break;

      case 'company-create':
        caption = (
          <span>
            {source} created {target}
          </span>
        );
        break;

      default:
        caption = action;
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
