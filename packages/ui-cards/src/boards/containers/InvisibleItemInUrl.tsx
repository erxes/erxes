import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import * as routerUtils from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { DetailQueryResponse, IOptions } from '../types';
import { EditForm } from './editForm';

type WrapperProps = {
  itemId: string;
  options: IOptions;
};

type FinalProps = WrapperProps &
  IRouterProps & {
    detailQuery: DetailQueryResponse;
  };

class InvisibleItemInUrl extends React.PureComponent<FinalProps> {
  beforePopupClose = () => {
    const { history } = this.props;

    routerUtils.removeParams(history, 'itemId');
  };

  render() {
    const { options, itemId, detailQuery } = this.props;

    if (detailQuery.loading) {
      return null;
    }

    const item = detailQuery[options.queriesName.detailQuery];

    if (!item) {
      return null;
    }

    return (
      <EditForm
        itemId={itemId}
        options={options}
        isPopupVisible={true}
        stageId={item.stageId}
        hideHeader={true}
        beforePopupClose={this.beforePopupClose}
      />
    );
  }
}

const withQuery = (props: WrapperProps) => {
  const { options } = props;

  return withProps<WrapperProps>(
    compose(
      graphql<WrapperProps, DetailQueryResponse, { _id: string }>(
        gql(options.queries.detailQuery),
        {
          name: 'detailQuery',
          options: ({ itemId }: { itemId: string }) => {
            return {
              variables: {
                _id: itemId
              },
              fetchPolicy: 'network-only'
            };
          }
        }
      )
    )(withRouter(InvisibleItemInUrl))
  );
};

export default class WithData extends React.Component<WrapperProps> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery(props);
  }

  render() {
    const Component = this.withQuery;

    return <Component {...this.props} />;
  }
}
