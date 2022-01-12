import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import Icon from 'modules/common/components/Icon';
import LoadMore from 'modules/common/components/LoadMore';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { FieldStyle, SidebarList } from 'modules/layout/styles';
import { ActionButtons, SidebarListItem } from 'modules/settings/styles';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { ISkillType, ISkillTypesDocument } from '../types';
import SkillTypeForm from './SkillTypeForm';

type Props = {
  queryParams: any;
  history: any;
  totalCount: number;
  loading: boolean;
  refetch: any;
  remove: (id: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  objects: ISkillTypesDocument[];
} & IRouterProps;

const { Section } = Wrapper.Sidebar;

function SkillTypes({
  objects,
  queryParams,
  history,
  totalCount,
  loading,
  refetch,
  remove,
  renderButton
}: Props) {
  const isItemActive = (id: string) => {
    const currentType = queryParams.typeId || '';

    return currentType === id;
  };

  function renderEditAction(object: ISkillTypesDocument) {
    const trigger = (
      <Button id="skilltype-edit" btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, object);
  }

  function renderRemoveAction(object: ISkillTypesDocument) {
    const handleRemove = () => remove(object._id);

    return (
      <Button btnStyle="link" onClick={handleRemove}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  function renderForm(props) {
    return (
      <SkillTypeForm {...props} refetch={refetch} renderButton={renderButton} />
    );
  }

  function renderFormTrigger(trigger: React.ReactNode, object?: ISkillType) {
    const content = props => renderForm({ ...props, object });

    return (
      <ModalTrigger
        title="New skill type"
        trigger={trigger}
        content={content}
      />
    );
  }

  function renderHeader() {
    const trigger = (
      <Button
        id="skilltype-new"
        btnStyle="success"
        icon="plus-circle"
        block={true}
      >
        Create skill type
      </Button>
    );

    return (
      <>
        <TopHeader>{renderFormTrigger(trigger)}</TopHeader>
        <Section.Title>{__('Skill types')}</Section.Title>
      </>
    );
  }

  function renderContent() {
    return (
      <SidebarList>
        {objects.map(object => (
          <SidebarListItem key={object._id} isActive={isItemActive(object._id)}>
            <Link to={`?typeId=${object._id}`}>
              <FieldStyle>{object.name}</FieldStyle>
            </Link>
            <ActionButtons>
              {renderEditAction(object)}
              {renderRemoveAction(object)}
            </ActionButtons>
          </SidebarListItem>
        ))}
      </SidebarList>
    );
  }

  return (
    <Sidebar full={true} wide={true} header={renderHeader()}>
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={totalCount}
        emptyText={`${__('Get started by grouping the skills into types')}.${__(
          'For example, language skills'
        )}`}
        emptyImage="/images/actions/26.svg"
      />
      <LoadMore all={totalCount} loading={loading} />
    </Sidebar>
  );
}

export default withRouter<Props>(SkillTypes);
