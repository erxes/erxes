import React from 'react';
import { Link } from 'react-router-dom';
import { IUser } from '../auth/types';

const ICON_AND_COLOR_TABLE = {
  'customer-create': {
    icon: 'adduser',
    color: '#6465e2'
  },
  'segment-create': {
    icon: 'filter',
    color: '#6569DF'
  },
  'conversation-create': {
    icon: 'speech-bubble-2',
    color: '#F44236'
  },
  'internal_note-create': {
    icon: 'pushpin',
    color: '#F7CE53'
  },
  'company-create': {
    icon: 'briefcase',
    color: '#6569DF'
  },
  'deal-create': {
    icon: 'piggy-bank',
    color: '#6569DF'
  },
  'email-send': {
    icon: 'email-3',
    color: '#d74534'
  }
};

type Props = {
  activities: any[];
  user: IUser;
  target?: string;
  type: string;
};

/**
 * This class is used to process the data received from the query
 * and convert it into a data used on the front side.
 */
export default class {
  private queryData: any;
  private currentUser: IUser;
  private target?: string;

  /**
   * A constructor method
   * @param {Ojbect} queryData - The query received from the back end
   */
  constructor({ activities, user, target, type }: Props) {
    this.queryData = activities;

    this.currentUser = user;
    this.target = target || 'Unknown';
  }

  /**
   * Process a row of query and return a row for use on the front side
   * @param {string} action - Activity log action
   * @param {Object} content - Object with a type of data related to its content type (action)
   * @return {Object} - Return processed data of a given interval
   */

  _processItem(item) {
    const iconAndColor = this._getIconAndColor(item.action);
    const hasContent = ![
      'company-create',
      'deal-create',
      'customer-create'
    ].includes(item.action);

    const caption = this._getCaption({
      action: item.action,
      by: item.by,
      id: item.id
    });

    return {
      ...iconAndColor,
      caption,
      content: hasContent ? item.content : null,
      action: item.action,
      createdAt: item.createdAt,
      by: item.by
    };
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
    if (!this.currentUser) {
      return null;
    }

    if (!by) {
      return 'System';
    }

    if (by._id === this.currentUser._id) {
      return 'You';
    } else {
      return by.details.fullName;
    }
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
        caption =
          by && by.details.fullName ? (
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
        caption = <span>{source} left a note</span>;
        break;

      case 'conversation-create':
        caption = (
          <span>
            {target} sent a&nbsp;
            <Link to={`/inbox/index?_id=${id}`}>
              <strong>conversation</strong>
            </Link>
            &nbsp;message
          </span>
        );
        break;

      case 'email-send':
        caption = <span>{source} send email</span>;
        break;

      default:
        caption = (
          <span>
            {source} created {target}{' '}
          </span>
        );
        break;
    }

    return caption;
  }

  /**
   * Process the data received from the query and return the proccessed list of logs
   * @return {Object[]} - Returns list of proccessed list of logs
   */
  process() {
    const result: any = [];

    for (const item of this.queryData) {
      result.push(this._processItem(item));
    }

    return result;
  }
}
