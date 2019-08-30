import { WatchIndicator } from 'modules/boards/styles/item';
import { IItem } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import * as React from 'react';

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
      <Button icon="eye" onClick={onClick}>
        {__('Watch')}
        {isWatched && (
          <WatchIndicator>
            <Icon icon="check" />
          </WatchIndicator>
        )}
      </Button>
    );
  }
}

export default Watch;
