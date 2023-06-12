import React from 'react';
import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  Templates,
  TemplateInfo
} from '../styles';
import Form from './Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import Tags from '@erxes/ui/src/components/Tags';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  index: number;
  object: any;
};

function EmailTemplateRow({ object, index }: Props) {
  const { name, content, createdAt, modifiedAt, createdUser, tags } =
    object || {};

  //   const onChange = (e) => {
  //     if (toggleBulk) {
  //       toggleBulk(test, e.target.checked);
  //     }
  //   };

  return (
    <Template key={index} isLongName={name.length > 46}>
      <FormControl componentClass="checkbox" />
      <h5>{name}</h5>
      <Tags tags={tags || []} limit={3} />
      <TemplateBox>
        <Actions>
          {/* {this.renderEditAction(object)}
          <div onClick={this.removeTemplate.bind(this, object)}>
            <Icon icon="cancel-1" /> Delete
          </div>
          {this.renderDuplicateAction(object)} */}
        </Actions>
        <IframePreview>
          <iframe title="content-iframe" srcDoc={content} />
        </IframePreview>
      </TemplateBox>
      <TemplateInfo>
        <p>{createdAt === modifiedAt ? `Created at` : `Modified at`}</p>
        {/* <p>{this.renderDate(createdAt, modifiedAt)}</p> */}
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
