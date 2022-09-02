import React from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  Templates
} from './styles';
import { ITemplateDoc } from '../../types';
import { getEnv } from '@erxes/ui/src/utils/core';

type Props = {
  templates: ITemplateDoc[];
  templatesCount: number;
  setCount: (count: number) => void;
  use: (_id: string, name: string) => void;
};

function List(props: Props) {
  const { templates, templatesCount, setCount, use } = props;

  const renderDemoAction = (template: ITemplateDoc) => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:webbuilder/demo/${template._id}`;

    const onClick = () => window.open(`${url}`, '_blank');

    return (
      <div onClick={onClick}>
        <Icon icon="eye" /> Show demo
      </div>
    );
  };

  const renderRow = () => {
    return templates.map((template, index) => {
      return (
        <Template key={index} isLongName={false}>
          <h5>{template.name}</h5>
          <TemplateBox>
            <Actions>
              <div onClick={() => use(template._id, template.name)}>
                <Icon icon="play" /> Use
              </div>

              {renderDemoAction(template)}
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

  if (templates.length < 1) {
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
