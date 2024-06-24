import { ColorButton } from '@erxes/ui-cards/src/boards/styles/common';
import Icon from '@erxes/ui/src/components/Icon';
import { colors } from '@erxes/ui/src/styles';
import { __ } from '@erxes/ui/src/utils/core';
import * as React from 'react';
import { IGrowthHack } from '../../types';

type IProps = {
  item: IGrowthHack;
  onChangeVote: (isVote: boolean) => void;
};

class Vote extends React.Component<IProps> {
  render() {
    const {
      onChangeVote,
      item: { isVoted }
    } = this.props;

    const onClick = () => onChangeVote(!isVoted);

    return (
      <ColorButton
        onClick={onClick}
        color={isVoted ? colors.colorCoreGreen : ''}
      >
        <Icon icon="thumbs-up" />
        {__(isVoted ? 'Unvote' : 'Vote')}
      </ColorButton>
    );
  }
}

export default Vote;
