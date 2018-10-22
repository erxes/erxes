import { Icon } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { router } from 'modules/common/utils';
import * as React from 'react';
import { withRouter } from 'react-router';

interface IProps extends IRouterProps {
  sortField?: string;
}

class SortHandler extends React.Component<IProps> {
  sortHandler(field, direction) {
    const { history } = this.props;

    router.setParams(history, { sortField: field, sortDirection: direction });
  }

  checkSortActive(name, direction) {
    const { history } = this.props;

    if (
      router.getParam(history, 'sortField') === name &&
      router.getParam(history, 'sortDirection') === direction.toString()
    ) {
      return true;
    }

    return false;
  }

  render() {
    const { sortField } = this.props;

    const onClickUp = () => this.sortHandler(sortField, -1);
    const onClickDown = () => this.sortHandler(sortField, 1);

    return (
      <div className="table-sorter">
        <Icon
          icon="uparrow-2"
          size={7}
          isActive={this.checkSortActive(sortField, -1)}
          onClick={onClickUp}
        />
        <Icon
          icon="downarrow"
          size={7}
          isActive={this.checkSortActive(sortField, 1)}
          onClick={onClickDown}
        />
      </div>
    );
  }
}

export default withRouter<IProps>(SortHandler);
