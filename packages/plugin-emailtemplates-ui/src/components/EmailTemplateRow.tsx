import React from 'react';
import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  TemplateInfo
} from '../styles';
import Form from './Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import Tags from '@erxes/ui/src/components/Tags';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import dayjs from 'dayjs';

type Props = {
  index: number;
  object: any;
  isChecked?: boolean;
  toggleBulk: (target: any, toAdd: boolean) => void;
  remove: (_id: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  duplicate: (id: string) => void;
  save: () => void;
};

function EmailTemplateRow({
  object,
  index,
  isChecked,
  toggleBulk,
  duplicate,
  remove,
  renderButton
}: Props) {
  const { name, content, createdAt, modifiedAt, createdUser, tags } =
    object || {};

  const renderForm = props => {
    return <Form {...props} renderButton={renderButton} />;
  };

  const duplicateTemplate = id => {
    duplicate(id);
  };

  const renderEditAction = object => {
    const content = props => {
      return renderForm({ ...props, object });
    };

    return (
      <ModalTrigger
        enforceFocus={false}
        title="Edit"
        size="lg"
        trigger={
          <div>
            <Icon icon="edit" /> Edit
          </div>
        }
        content={content}
      />
    );
  };

  const renderRemoveTemplate = object => {
    const onClick = () => remove(object._id);

    return (
      <div onClick={onClick}>
        <Icon icon="cancel-1" /> Delete
      </div>
    );
  };

  const renderDuplicateAction = object => {
    return (
      <div onClick={() => duplicateTemplate(object._id)}>
        <Icon icon="copy-1" />
        Duplicate
      </div>
    );
  };

  function renderDate(createdAt, modifiedAt) {
    if (createdAt === modifiedAt) {
      if (createdAt === null) return '-';

      return dayjs(createdAt).format('DD MMM YYYY');
    }

    return dayjs(modifiedAt).format('DD MMM YYYY');
  }

  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(object, e.target.checked);
    }
  };

  return (
    <Template key={index} isLongName={name.length > 46}>
      <FormControl
        checked={isChecked}
        componentClass="checkbox"
        onChange={onChange}
      />
      <h5>{name}</h5>
      <Tags tags={tags || []} limit={3} />
      <TemplateBox>
        <Actions>
          {renderEditAction(object)}
          {renderRemoveTemplate(object)}
          {renderDuplicateAction(object)}
        </Actions>
        <IframePreview>
          <iframe title="content-iframe" srcDoc={content} />
        </IframePreview>
      </TemplateBox>
      <TemplateInfo>
        <p>{createdAt === modifiedAt ? `Created at` : `Modified at`}</p>
        <p>{renderDate(createdAt, modifiedAt)}</p>
      </TemplateInfo>
      <TemplateInfo>
        <p>Created by</p>
        {createdUser ? (
          createdUser.details.fullName && <p>{createdUser.details.fullName}</p>
        ) : (
          <p>erxes Inc</p>
        )}
      </TemplateInfo>
    </Template>
  );
}

export default EmailTemplateRow;
