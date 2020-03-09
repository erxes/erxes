import * as React from 'react';
import { __ } from '../../utils';

export default function VideoCallRequest() {
  return (
    <div className="app-message-box spaced flexible">
      <div className="user-info">
        <strong>
          <span role="img" aria-label="Phone">
            📞
          </span>{' '}
          {__('Video call request sent')}
        </strong>
      </div>
    </div>
  );
}
