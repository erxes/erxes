import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  TemplateBoxInfo,
  TemplateInfo,
} from "@erxes/ui-emailtemplates/src/styles";

import Form from "@erxes/ui-emailtemplates/src/containers/Form";
import { ICommonListProps } from "@erxes/ui-settings/src/common/types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import dayjs from "dayjs";

type Props = {
  object: any;
  duplicate: (id: string) => void;
} & ICommonListProps;

const Row = (props: Props) => {
  const { object, save, remove, duplicate } = props;

  const { name, content, createdAt, modifiedAt, createdUser } = object || {};

  const renderForm = (formProps) => {
    return <Form {...formProps} />;
  };

  const removeTemplate = (object) => {
    remove(object._id);
  };

  const duplicateTemplate = (id) => {
    duplicate(id);
  };

  const renderEditAction = (object) => {
    const renderContent = (formProps) => {
      return renderForm({ ...formProps, object, save });
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
        content={renderContent}
      />
    );
  };

  const renderDuplicateAction = (object) => {
    return (
      <div onClick={() => duplicateTemplate(object._id)}>
        <Icon icon="copy-1" />
        Duplicate
      </div>
    );
  };

  const renderDate = (createdAt, modifiedAt) => {
    if (createdAt === modifiedAt) {
      if (createdAt === null) {
        return "-";
      }

      return dayjs(createdAt).format("DD MMM YYYY");
    }

    return dayjs(modifiedAt).format("DD MMM YYYY");
  };

  return (
    <Template $isLongName={name.length > 46}>
      <TemplateBox>
        <Actions>
          {renderEditAction(object)}
          <div onClick={() => removeTemplate(object)}>
            <Icon icon="cancel-1" /> Delete
          </div>
          {renderDuplicateAction(object)}
        </Actions>
        <IframePreview>
          <iframe title="content-iframe" srcDoc={content} />
        </IframePreview>
      </TemplateBox>
      <TemplateBoxInfo>
        <h5>{name}</h5>
        <div>
          <TemplateInfo>
            <p>{createdAt === modifiedAt ? `Created at` : `Modified at`}</p>
            <p>{renderDate(createdAt, modifiedAt)}</p>
          </TemplateInfo>
          <TemplateInfo>
            <p>Created by</p>
            {createdUser ? (
              createdUser?.details?.fullName && (
                <p>{createdUser?.details?.fullName}</p>
              )
            ) : (
              <p>erxes Inc</p>
            )}
          </TemplateInfo>
        </div>
      </TemplateBoxInfo>
    </Template>
  );
};

export default Row;
