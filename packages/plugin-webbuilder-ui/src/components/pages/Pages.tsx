import React from 'react';
import { router } from '@erxes/ui/src/utils';
import { BarItems } from '@erxes/ui/src/layout/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import { Link } from 'react-router-dom';
import { IPageDoc } from '../../types';
import Row from './Row';

type Props = {
  pages: IPageDoc[];
  getActionBar: (actionBar: any) => void;
  remove: (_id: string) => void;
  setCount: (count: number) => void;
  pagesCount: number;
  history: any;
  queryParams: any;
  searchValue: string;
};

type State = {
  searchValue?: string;
};

class Pages extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  renderRow = (pages: IPageDoc[]) => {
    const { remove } = this.props;

    return pages.map(page => (
      <Row key={page._id} page={page} remove={remove} />
    ));
  };

  search = e => {
    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    router.removeParams(history, 'page');
    router.setParams(history, { searchValue });
  };

  render() {
    const { pages, getActionBar, setCount, pagesCount } = this.props;

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
        />
        <Link to="pages/create">
          <Button btnStyle="success" size="small" icon="plus-circle">
            Add page
          </Button>
        </Link>
      </BarItems>
    );

    getActionBar(actionBarRight);
    setCount(pagesCount);

    let content = (
      <>
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Description')}</th>
              <th>{__('Site')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow(pages)}</tbody>
        </Table>
      </>
    );

    if (pagesCount < 1) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Entries"
          size="small"
        />
      );
    }

    return <>{content}</>;
  }
}

export default Pages;
