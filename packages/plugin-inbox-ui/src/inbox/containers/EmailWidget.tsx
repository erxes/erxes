import Widget from '@erxes/ui-inbox/src/inbox/components/EmailWidget';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';

export default function EmailWidget() {
  return isEnabled('engages') || isEnabled('imap') ? <Widget /> : null;
}
