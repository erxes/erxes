import { IItem } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import { RightButton, WatchIndicator } from '../../styles/item';

type IProps = {
  item: IItem;
  onChangeWatch: (isAdd: boolean) => void;
};

class Watch extends React.Component<IProps> {
  render() {
    const {
      onChangeWatch,
      item: { isWatched }
    } = this.props;

    const onClick = () => onChangeWatch(!isWatched);

    return (
      <RightButton icon="eye" onClick={onClick}>
        Watch
        {isWatched && (
          <WatchIndicator>
            <Icon icon="check" />
          </WatchIndicator>
        )}
      </RightButton>
    );
  }
}

export default Watch;
