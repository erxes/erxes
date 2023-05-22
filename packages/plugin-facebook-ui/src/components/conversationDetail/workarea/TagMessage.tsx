import React from 'react';

import { __ } from '@erxes/ui/src/utils';
import { Mask, MaskText } from '@erxes/ui-inbox/src/inbox/styles';

import TaggedMessageModal from './TaggedMessageModal';
import { FacebookTaggedMessage } from './styles';

type Props = {
  setExtraInfo: (value) => void;
  hasTaggedMessages: boolean;
  hideMask: () => void;
  extraInfo: any;
};

type State = {
  hasTag: boolean;
};

export default class TagMessage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { hasTag: props.hasTaggedMessages };
  }

  render() {
    const { setExtraInfo, extraInfo = { tag: '' }, hideMask } = this.props;

    const hide = () => {
      this.setState({ hasTag: false });

      hideMask();
    };

    if (!this.state.hasTag) {
      return null;
    }

    return (
      <Mask id="mask">
        <MaskText>
          {__(
            'Your last interaction with this contact was more than 24 hours ago. Only Tagged Messages are allowed outside the standard messaging window'
          )}
          <FacebookTaggedMessage>
            <TaggedMessageModal
              extraInfo={extraInfo}
              setExtraInfo={setExtraInfo}
              hideMask={hide}
            />
          </FacebookTaggedMessage>
        </MaskText>
      </Mask>
    );
  }
}
