// import ConformityChooser from 'erxes-ui/lib/conformity/containers/ConformityChooser';

// export default ConformityChooser;

import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { ItemChooser } from '../../boards/components/portable';
import Chooser, { CommonProps } from 'modules/common/components/Chooser';
import Alert from 'modules/common/utils/Alert';
import { withProps } from 'modules/common/utils';
import { mutations } from '../graphql';
import { EditConformityMutation, IConformityEdit } from '../types';

// export type CommonProps = {
//   data: any;
//   search: (value: string, reload?: boolean) => void;
//   datas: any[];
//   title: string;
//   renderName: (data: any) => void;
//   renderForm: (props: { closeModal: () => void }) => any;
//   perPage: number;
//   clearState: () => void;
//   limit?: number;
//   newItem?
//   resetAssociatedItem?: () => void;
//   closeModal: () => void;
//   onSelect: (datas: any[]) => void;
// };

type Props = {
  filterStageId?: (
    stageId?: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  onSelect?: (datas: any[]) => void;
  stageId?: string;
  boardId?: string;
  pipelineId?: string;
  refetchQuery: string;
  chooserComponent?: any;
} & CommonProps;

type FinalProps = {
  editConformityMutation: EditConformityMutation;
} & Props;

const ConformityChooser = (props: FinalProps) => {
  const {
    editConformityMutation,
    data,
    onSelect,
    chooserComponent,
    refetchQuery
  } = props;

  const onSelected = relTypes => {
    const relTypeIds = relTypes.map(item => item._id);
    const update = proxy => {
      let selector: { query: any; variables?: any } = {
        query: gql(refetchQuery),
        variables: {
          mainType: data.mainType,
          mainTypeId: data.mainTypeId,
          relType: data.relType,
          isSaved: true
        }
      };

      // if (data.relType === 'company') {
      //   console.log('ccccccccccccccccccccc')
      //   selector = { query: companies };
      // }

      // Read the data from our cache for this query.
      let result;
      const qryName = gql(refetchQuery).definitions[0].name.value;
      console.log('dddddddddddddddd', qryName);

      // try {
      result = proxy.readQuery(selector);
      console.log(result);
      // Do not do anything while reading query somewhere else
      // } catch (e) {
      //   alert(e)
      //   return;
      // }

      result[qryName] = relTypes;

      // Write our result back to the cache.
      proxy.writeQuery({ ...selector, data: result });
    };

    editConformityMutation({
      variables: {
        mainType: data.mainType,
        mainTypeId: data.mainTypeId,
        relType: data.relType,
        relTypeIds
      },
      optimisticResponse: {
        __typename: 'Mutation',
        conformityEdit: relTypes
      },
      update
    } as any)
      .then(() => {
        if (onSelect) {
          onSelect(relTypes);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    onSelect: onSelected
  };

  if (chooserComponent) {
    const Component = chooserComponent;
    return <Component {...extendedProps} />;
  }

  if (props.data.options) {
    return <ItemChooser {...extendedProps} />;
  }

  return <Chooser {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      EditConformityMutation,
      IConformityEdit & { isSaved?: boolean }
    >(gql(mutations.conformityEdit), {
      name: 'editConformityMutation',
      options: () => {
        return {
          refetchQueries: [
            // {
            //   query: gql(refetchQuery),
            //   variables: {
            //     mainType: data.mainType,
            //     mainTypeId: data.mainTypeId,
            //     relType: data.relType,
            //     isSaved: true
            //   }
            // },
            'activityLogs'
            // 'customers',
            // 'companies'
          ]
        };
      }
    })
  )(ConformityChooser)
);
