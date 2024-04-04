import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';

import { queries } from '../../graphql';

import React from 'react';
import PropertyCondition from '../../components/form/PropertyCondition';

import { ISegmentCondition, ISegmentMap } from '../../types';

type Props = {
  segment: ISegmentMap;
  contentType: string;
  addCondition: (condition: ISegmentCondition, segmentKey: string) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
  hideDetailForm: boolean;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  config?: any;
  onChangeConfig?: (config: any) => void;
};

export default class PropertyConditionContainer extends React.Component<
  Props,
  { associationTypes: any[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      associationTypes: []
    };
  }

  componentWillMount() {
    const { contentType } = this.props;

    this.getAssociationTypes(contentType);
  }

  getAssociationTypes = (type: string) => {
    client
      .query({
        query: gql(queries.getAssociationTypes),
        variables: {
          contentType: type
        }
      })
      .then(({ data }) => {
        this.setState({
          associationTypes: data.segmentsGetAssociationTypes
        });
      });
  };

  render() {
    const { associationTypes } = this.state;

    const updatedProps = {
      ...this.props,
      associationTypes
    };

    return <PropertyCondition {...updatedProps} />;
  }
}
