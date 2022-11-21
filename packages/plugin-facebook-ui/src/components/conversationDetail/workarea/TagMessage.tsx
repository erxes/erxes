import React from 'react';

import { __ } from '@erxes/ui/src/utils';
import { Mask } from '@erxes/ui-inbox/src/inbox/styles';

import TaggedMessageModal from './TaggedMessageModal';
import { FacebookTaggedMessage } from './styles';

type Props = {
  selectTag: (value) => void;
  isTaggedMessage: boolean;
  hideMask: () => void;
  tag: string;
};

export default function TagMessage(props: Props) {
  const { isTaggedMessage, selectTag, tag, hideMask } = props;

  if (!isTaggedMessage) {
    return null;
  }

  return (
    <Mask id="mask">
      <div>
        {__(
          'Your last interaction with this contact was more than 24 hours ago. Only Tagged Messages are allowed outside the standard messaging window'
        )}
        <FacebookTaggedMessage>
          <TaggedMessageModal
            tag={tag}
            selectTag={selectTag}
            hideMask={hideMask}
          />
        </FacebookTaggedMessage>
      </div>
    </Mask>
  );
}
