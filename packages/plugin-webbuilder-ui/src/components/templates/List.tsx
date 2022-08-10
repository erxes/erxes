import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  Templates
} from './styles';
import { ITemplateDoc } from '../../types';

type Props = {
  templates: ITemplateDoc[];
  templatesCount: number;
  setCount: (count: number) => void;
  remove: (_id: string) => void;
};

function List(props: Props) {
  const { templates, templatesCount, setCount, remove } = props;

  const renderRow = () => {
    return templates.map((template, index) => {
      return (
        <Template key={index} isLongName={false}>
          <h5>{template.name}</h5>
          <TemplateBox>
            <Actions>
              <Link to={`/webbuilder/pages/create/${template._id}`}>
                <Icon icon="play" /> Use
              </Link>
              <div onClick={() => remove(template._id)}>
                <Icon icon="cancel-1" /> Delete
              </div>
            </Actions>
            <IframePreview>
              <iframe title="content-iframe" srcDoc={template.html} />
            </IframePreview>
          </TemplateBox>
        </Template>
      );
    });
  };

  let content = <Templates>{renderRow()}</Templates>;
  setCount(templatesCount);

  if (templatesCount < 1) {
    content = (
      <EmptyState
        image="/images/actions/8.svg"
        text="No templates"
        size="small"
      />
    );
  }

  return <>{content}</>;
}

export default List;
