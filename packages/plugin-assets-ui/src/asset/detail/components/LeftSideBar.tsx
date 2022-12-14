import { ControlLabel, Icon, ModalTrigger } from '@erxes/ui/src';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import gql from 'graphql-tag';
import React from 'react';
import { IAsset } from '../../../common/types';
import { ContainerBox, KnowledgeCard } from '../../../style';
import { queries } from '../../graphql';
import BasicInfo from '../containers/BasicInfo';
import CustomFieldsSection from '../containers/CustomFieldSection';
import Knowledge from './KnowledgeForm';

type Props = {
  asset: IAsset;
  history: any;
  refetchDetail:() => void
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { asset, history, refetchDetail } = this.props;

    const { knowledgeData } = asset;

    const refetchQueries = [
      {
        query: gql(queries.assetDetail),
        variables: { _id: asset._id }
      }
    ];

    const editKnowledgeForm = data => {
      const trigger = (
        <KnowledgeCard>
          <Icon icon="head-1" size={30} />
          <ControlLabel>{data.name}</ControlLabel>
        </KnowledgeCard>
      );

      data.contents = data.contents.map(content => ({ ...content, isTitleEntered: true }));

      const content = props => {
        const updatedProps = {
          ...props,
          assetId: asset._id,
          knowledgeData: data,
          refetchQueries: refetchDetail
        };

        return <Knowledge {...updatedProps} />;
      };

      return (
        <ModalTrigger
          key={data._id}
          content={content}
          trigger={trigger}
          title="Edit Knowledge "
          size="lg"
        />
      );
    };

    return (
      <Sidebar wide={true}>
        <BasicInfo asset={asset} refetchQueries={refetchQueries} history={history} />
        <Sidebar.Section>
          <ContainerBox gap={5} flexWrap={true}>
            {(knowledgeData || []).map(data => editKnowledgeForm(data))}
          </ContainerBox>
        </Sidebar.Section>

        <CustomFieldsSection asset={asset} />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
