import * as React from 'react';
import { AppConsumer } from '../AppContext';
import { Navigation } from '../../components/common';
import { ICategoryTree } from '../../types';
import { ChildProps } from 'react-apollo';

type Props = {
  items: ICategoryTree[];
  parentId?: string;
  goToBlock?: (block: any) => void;
};

function NavigationContainer(props: ChildProps<Props>) {
  const { parentId, goToBlock } = props;

  const changeRoute = (item: ICategoryTree) => {
    if (item.parentId === parentId) {
      if (!goToBlock) {
        return null;
      }
      goToBlock(item._id);
    }
  };
  return <Navigation {...props} changeRoute={changeRoute} />;
}

const WithContext = (props: Props) => {
  return (
    <AppConsumer>
      {({ goToBlock }) => (
        <NavigationContainer {...props} goToBlock={goToBlock} />
      )}
    </AppConsumer>
  );
};

export default WithContext;
