import { ColorButton } from 'modules/boards/styles/common';
import { IItem } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { RightButton, WatchIndicator } from '../../styles/item';

type IProps = {
  item: IItem;
  onChangeWatch: (isAdd: boolean) => void;
  isSmall?: boolean;
};

class Watch extends React.Component<IProps> {
  render() {
    const {
      onChangeWatch,
      item: { isWatched },
      isSmall
    } = this.props;

    const onClick = () => onChangeWatch(!isWatched);

    if (isSmall) {
      return (
        <ColorButton onClick={onClick}>
          <Icon icon={isWatched ? 'eye-2' : 'eye-slash'} />
          {__('Watch')}
        </ColorButton>
      );
    }

    return (
      <RightButton icon="eye" onClick={onClick}>
        {__('Watch')}
        {isWatched && (
          <WatchIndicator>
            <Icon icon="check-1" />
          </WatchIndicator>
        )}
      </RightButton>
    );
  }
}

export default Watch;
