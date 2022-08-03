import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import { ISiteDoc } from '../../types';
import Row from './Row';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from '../../containers/sites/SiteForm';

type Props = {
  sites: ISiteDoc[];
  getActionBar: (actionBar: any) => void;
  remove: (_id: string) => void;
  setCount: (count: number) => void;
  sitesCount: number;
  queryParams: any;
};

class Pages extends React.Component<Props, {}> {
  renderRow = (sites: ISiteDoc[]) => {
    const { remove, queryParams } = this.props;

    return sites.map(site => (
      <Row
        key={site._id}
        site={site}
        remove={remove}
        queryParams={queryParams}
      />
    ));
  };

  render() {
    const {
      sites,
      getActionBar,
      setCount,
      sitesCount,
      queryParams
    } = this.props;

    const modalContent = props => <Form {...props} queryParams={queryParams} />;

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add an entry
      </Button>
    );

    const actionBarRight = (
      <ModalTrigger
        title="Add an site"
        trigger={trigger}
        autoOpenKey="showSiteModal"
        content={modalContent}
      />
    );

    const ActionBar = <Wrapper.ActionBar right={actionBarRight} />;

    getActionBar(ActionBar);
    setCount(sitesCount);

    let content = (
      <>
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Domain')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow(sites)}</tbody>
        </Table>
      </>
    );

    if (sitesCount < 1) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No sites"
          size="small"
        />
      );
    }

    return <>{content}</>;
  }
}

export default Pages;
