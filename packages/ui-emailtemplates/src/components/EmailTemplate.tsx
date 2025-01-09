import {
  Actions,
  IframeFullScreen,
  IframePreview,
  Template,
  TemplateBox,
  TemplateBoxInfo,
  TemplateInfo
} from "../styles";
import { Icon, ModalTrigger } from "@erxes/ui/src";

import React from "react";
import dayjs from "dayjs";

type Props = {
  handleSelect?: (_id: string) => void;
  template: any;
  templateId: string;
  selectedTemplateId?: string;
  onlyPreview?: boolean;
  width?: string;
};

const EmailTemplate = (props: Props) => {
  const {
    selectedTemplateId,
    template,
    handleSelect,
    templateId,
    onlyPreview,
    width
  } = props;
  const { _id, name, createdAt, modifiedAt, createdUser, content } = template;

  const renderDate = (createdAt, modifiedAt) => {
    if (createdAt === modifiedAt) {
      if (createdAt === null) {
        return "-";
      }

      return dayjs(createdAt).format("DD MMM YYYY");
    }

    return dayjs(modifiedAt).format("DD MMM YYYY");
  };

  const renderView = content => {
    const trigger = (
      <div>
        <Icon icon="eye" /> View
      </div>
    );
    const form = () => {
      return (
        <IframeFullScreen>
          <iframe title="content-iframe" srcDoc={content} />
        </IframeFullScreen>
      );
    };

    return (
      <ModalTrigger
        content={form}
        trigger={trigger}
        hideHeader={true}
        title=""
        size="lg"
      />
    );
  };

  const renderActions = () => {
    return (
      <Actions>
        {renderView(content)}
        {!onlyPreview && (
          <div onClick={handleSelect && handleSelect.bind(this, templateId)}>
            <Icon icon="clicker" /> Select
          </div>
        )}
      </Actions>
    );
  };

  return (
    <Template
      key={_id}
      className={selectedTemplateId === _id ? "active" : ""}
      width={width}
      isPreview={onlyPreview}
    >
      <TemplateBox>
        {renderActions()}
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

export default EmailTemplate;
