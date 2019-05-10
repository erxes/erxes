import { IRouterProps } from 'modules/common/types';
import { router } from 'modules/common/utils';
import { TableHeadContent } from 'modules/customers/styles';
import * as React from 'react';
import { withRouter } from 'react-router';
interface IProps extends IRouterProps {
  sortField?: string;
  label?: string;
}

type State = {
  sortValue: any;
};

class SortHandler extends React.Component<IProps, State> {
  constructor(props) {
    super(props);
    const { history } = props;
    const sortValue = router.getParam(history, 'sortDirection');

    this.state = {
      sortValue
    };
  }

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
      return 'active';
    }

    return '';
  }

  onClickSort = () => {
    const { sortField, history } = this.props;
    const { sortValue } = this.state;

    if (!sortValue) {
      this.setState({
        sortValue: -1
      });

      return this.sortHandler(sortField, -1);
    }

    if (sortValue < 0) {
      this.setState({
        sortValue: 1
      });

      return this.sortHandler(sortField, 1);
    }

    this.setState({
      sortValue: undefined
    });

    return router.removeParams(history, 'sortDirection', 'sortField');
  };

  render() {
    const { sortField, label } = this.props;

    return (
      <TableHeadContent onClick={this.onClickSort}>
        <div className="table-sorter">
          <span className={`up ${this.checkSortActive(sortField, -1)}`} />
          <span className={`down ${this.checkSortActive(sortField, 1)}`} />
        </div>
        {label}
      </TableHeadContent>
    );
  }
}

export default withRouter<IProps>(SortHandler);
