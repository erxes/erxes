import client from 'apolloClient';
import gql from 'graphql-tag';

import { queries as boardQueries } from 'modules/boards/graphql';
import { queries as integrationQueries } from 'modules/leads/graphql';

import { isBoardKind } from 'modules/segments/utils';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import React from 'react';
import PropertyCondition from '../../components/form/PropertyCondition';

import { ISegmentCondition, ISegmentMap } from '../../types';

type Props = {
  segment: ISegmentMap;
  contentType: string;
  addCondition: (
    condition: ISegmentCondition,
    segmentKey: string,
    boardId?: string,
    pipelineId?: string,
    formId?: string
  ) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
  isAutomation: boolean;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  boardId: string;
  pipelineId: string;
};

export default class PropertyConditionContainer extends React.Component<
  Props,
  { boards: any[]; forms: any[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      boards: [],
      forms: []
    };
  }

  componentWillMount() {
    const { contentType } = this.props;

    this.fetchFields(contentType);
  }

  fetchFields = (type: string) => {
    if (isBoardKind(type)) {
      client
        .query({
          query: gql(boardQueries.boards),
          variables: {
            type
          }
        })
        .then(({ data }) => {
          this.setState({
            boards: data.boards
          });
        });
    }

    if (type === 'form_submission') {
      client
        .query({
          query: gql(integrationQueries.integrations),
          variables: {
            kind: INTEGRATION_KINDS.FORMS
          }
        })
        .then(({ data }) => {
          this.setState({
            forms: data.integrations
          });
        });
    } else {
      return;
    }
  };

  render() {
    const { boards, forms } = this.state;

    const updatedProps = {
      ...this.props,
      fetchFields: this.fetchFields,
      boards,
      forms
    };

    return <PropertyCondition {...updatedProps} />;
  }
}
