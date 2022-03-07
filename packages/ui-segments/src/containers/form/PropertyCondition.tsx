import client from "@erxes/ui/src/apolloClient";
import gql from "graphql-tag";

import { queries } from "../../graphql";
import { queries as boardQueries } from "@erxes/ui-cards/src/boards/graphql";
import { queries as integrationQueries } from "@erxes/ui-settings/src/integrations/graphql";

import { isBoardKind } from "../../utils";
import { INTEGRATION_KINDS } from "@erxes/ui/src/constants/integrations";
import React from "react";
import PropertyCondition from "../../components/form/PropertyCondition";

import { ISegmentCondition, ISegmentMap } from "../../types";

type Props = {
  segment: ISegmentMap;
  contentType: string;
  serviceType: string;
  addCondition: (
    condition: ISegmentCondition,
    segmentKey: string,
    boardId?: string,
    pipelineId?: string,
    formId?: string
  ) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
  hideDetailForm: boolean;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  boardId: string;
  pipelineId: string;
};

export default class PropertyConditionContainer extends React.Component<
  Props,
  { boards: any[]; forms: any[]; associationTypes: any[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      associationTypes: [],
      boards: [],
      forms: [],
    };
  }

  componentWillMount() {
    const { contentType } = this.props;

    this.fetchFields(contentType);
    this.getAssociationTypes(contentType);
  }

  getAssociationTypes = (type: string) => {
    client
      .query({
        query: gql(queries.getAssociationTypes),
        variables: {
          contentType: type,
        },
      })
      .then(({ data }) => {
        this.setState({
          associationTypes: data.segmentsGetAssociationTypes,
        });
      });
  };

  fetchFields = (type: string) => {
    if (isBoardKind(type)) {
      client
        .query({
          query: gql(boardQueries.boards),
          variables: {
            type,
          },
        })
        .then(({ data }) => {
          this.setState({
            boards: data.boards,
          });
        });
    }

    if (type === "form_submission") {
      client
        .query({
          query: gql(integrationQueries.integrations),
          variables: {
            kind: INTEGRATION_KINDS.FORMS,
          },
        })
        .then(({ data }) => {
          this.setState({
            forms: data.integrations,
          });
        });
    } else {
      return;
    }
  };

  render() {
    const { associationTypes, boards, forms } = this.state;

    const updatedProps = {
      ...this.props,
      fetchFields: this.fetchFields,
      associationTypes,
      boards,
      forms,
    };

    return <PropertyCondition {...updatedProps} />;
  }
}
