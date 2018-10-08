import gql from 'graphql-tag';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PortableDeals } from '../components';
import { mutations, queries } from '../graphql';
import { IDeal, IDealParams } from '../types';
import { removeDeal as remove, saveDeal as save } from '../utils';

type Props = {
  deals: IDeal[];
  addMutation: (params: { variables: { doc: IDealParams } }) => Promise<void>;
  editMutation: (params: { variables: { doc: IDealParams } }) => Promise<void>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<void>;
  dealsQuery: any;
};

class PortableDealsContainer extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);
  }

  // create or update deal
  saveDeal(doc: IDealParams, callback: () => void, deal?: IDeal) {
    const { addMutation, editMutation, dealsQuery } = this.props;

    save(
      doc,
      { addMutation, editMutation, dealsQuery },
      () => {
        callback();
      },
      deal
    );
  }

  // remove deal
  removeDeal(_id: string, callback: () => void) {
    const { removeMutation, dealsQuery } = this.props;

    remove(_id, { removeMutation, dealsQuery }, callback);
  }

  render() {
    const { dealsQuery = {} } = this.props;

    const deals = dealsQuery.deals || [];

    const extendedProps = {
      ...this.props,
      deals,
      saveDeal: this.saveDeal,
      removeDeal: this.removeDeal
    };

    return <PortableDeals {...extendedProps} />;
  }
}

export default compose(
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation'
  }),
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    skip: ({ customerId, companyId }) => !customerId && !companyId,
    options: ({
      customerId,
      companyId
    }: {
      customerId: string;
      companyId: string;
    }) => ({
      variables: {
        customerId,
        companyId
      }
    })
  })
)(PortableDealsContainer);
