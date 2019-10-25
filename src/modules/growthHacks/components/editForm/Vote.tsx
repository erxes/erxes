import { ColorButton } from 'modules/boards/styles/common';
import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
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
