import * as React from "react";

import {
  Actions,
  EllipsedRow,
  IframePreview,
  Template,
  TemplateBox,
  TemplateBoxInfo,
  TemplateInfo,
  Templates,
} from "@erxes/ui-emailtemplates/src/styles";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __, router } from "coreui/utils";

import { Count } from "@erxes/ui/src/styles/main";
import { EMPTY_CONTENT_SCRIPT } from "@erxes/ui-settings/src/constants";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import Form from "../containers/Form";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import { ICommonListProps } from "@erxes/ui-settings/src/common/types";
import Icon from "@erxes/ui/src/components/Icon";
import InstallCode from "./InstallCode";
import List from "@erxes/ui-settings/src/common/components/List";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { renderToString } from "react-dom/server";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  changeStatus: (_id: string, status: string) => void;
  queryParams: any;
} & ICommonListProps;

const ScriptList = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const renderForm = (props) => {
    return <Form {...props} renderButton={props.renderButton} />;
  };

  const renderEditAction = (object) => {
    const { save } = props;

    const content = (props) => {
      return renderForm({ ...props, object, save });
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

  const installCodeAction = (object) => {
    const content = (props) => <InstallCode {...props} script={object} />;

    return (
      <ModalTrigger
        enforceFocus={false}
        title="Install code"
        size="lg"
        trigger={
          <div>
            <Icon icon="code" /> Install code
          </div>
        }
        content={content}
      />
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter") {
      const { value, name } = e.currentTarget as HTMLInputElement;

      router.setParams(navigate, location, { [name]: value });
    }
  };

  const onSelect = (values: string[] | string, name: string) => {
    router.setParams(navigate, location, { [name]: values });
  };

  const renderForms = (forms) => {
    if (forms.length === 0) {
      return "-";
    }

    const showEllipsis = forms.length > 2 ? true : false;

    return (
      <>
        <EllipsedRow>{forms.map((lead) => `${lead.name},`)}</EllipsedRow>
        <span>&nbsp;{showEllipsis && "..."}</span>
      </>
    );
  };

  const renderContent = () => {
    const { objects, remove } = props;

    return (
      <Templates>
        {objects.map((object, index) => {
          const contentHtml = renderToString(<InstallCode script={object} />);

          return (
            <Template key={index} position="flex-start">
              <TemplateBox>
                <Actions>
                  {renderEditAction(object)}
                  <div onClick={() => remove(object._id)}>
                    <Icon icon="cancel-1" /> Delete
                  </div>
                  {installCodeAction(object)}
                </Actions>
                <IframePreview>
                  <iframe title="scripts-iframe" srcDoc={contentHtml} />
                </IframePreview>
              </TemplateBox>
              <TemplateBoxInfo>
                <h5>{object.name}</h5>
                <div>
                  <TemplateInfo>
                    <p>
                      <Icon icon="comment-1" />
                      &nbsp;{__("Messenger")}
                    </p>
                    <p>{object.messenger ? object.messenger.name : "-"}</p>
                  </TemplateInfo>
                  <TemplateInfo>
                    <p>
                      <Icon icon="book-open" />
                      &nbsp;{__("Knowledge Base")}
                    </p>
                    <p>{object.kbTopic ? object.kbTopic.title : "-"}</p>
                  </TemplateInfo>
                  <TemplateInfo>
                    <p>
                      {" "}
                      <Icon icon="window" />
                      &nbsp;{__("Forms")}
                      &nbsp;({object.leads.length || 0})
                    </p>
                    <p className="flex">{renderForms(object.leads)}</p>
                  </TemplateInfo>
                </div>
              </TemplateBoxInfo>
            </Template>
          );
        })}
      </Templates>
    );
  };

  return (
    <List
      formTitle="New widget script"
      breadcrumb={[
        { title: __("Settings"), link: "/settings" },
        { title: __("Widget Script Manager") },
      ]}
      title={__("Widget Script Manager")}
      leftActionBar={
        <HeaderDescription
          icon="/images/actions/23.svg"
          title="Scripts"
          description={`${__(
            "Script manager allows erxes users to quickly and easily generate and update related scripts for any of their business websites"
          )}.${__(
            `Set up once and your team will be able to easily display multiple erxes widgets on any of their businesses websites`
          )}`}
        />
      }
      emptyContent={<EmptyContent content={EMPTY_CONTENT_SCRIPT} />}
      renderForm={renderForm}
      renderContent={renderContent}
      {...props}
      queryParams={props.queryParams}
      location={location}
      navigate={navigate}
    />
  );
};

export default ScriptList;
