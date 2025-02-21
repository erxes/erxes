import { Content, ContentWrapper, TitleRow } from "../../styles/item";
import {
  EditorActions,
  EditorWrapper,
} from "@erxes/ui-internalnotes/src/components/Form";
import { IItem, IOptions } from "../../types";
import React, { useEffect, useState } from "react";
import { __, extractAttachment } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IAttachment } from "@erxes/ui/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import { RichTextEditor } from "@erxes/ui/src/components/richTextEditor/TEditor";
import Uploader from "@erxes/ui/src/components/Uploader";
import xss from "xss";

type DescProps = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  contentType: string;
};

const Description = (props: DescProps) => {
  const { item, saveItem, contentType } = props;
  const [edit, setEdit] = useState(false);
  const [isSubmitted, setSubmit] = useState(false);
  const [description, setDescription] = useState(item.description);

  useEffect(() => {
    setDescription(item.description);
  }, [item.description]);

  useEffect(() => {
    if (isSubmitted) {
      setEdit(false);
    }
  }, [isSubmitted]);

  const onSend = () => {
    saveItem({ description });
    setSubmit(true);
  };

  const toggleEdit = () => {
    setEdit((currentValue) => !currentValue);
    setSubmit(false);
  };

  const onChangeDescription = (content: string) => {
    setDescription(content);
  };

  const renderFooter = () => {
    return (
      <EditorActions>
        <Button
          icon="times-circle"
          btnStyle="simple"
          size="small"
          onClick={toggleEdit}
        >
          Cancel
        </Button>
        {item.description !== description && (
          <Button
            onClick={onSend}
            btnStyle="success"
            size="small"
            icon="check-circle"
          >
            Save
          </Button>
        )}
      </EditorActions>
    );
  };

  return (
    <FormGroup>
      <ContentWrapper $isEditing={edit}>
        <TitleRow>
          <ControlLabel uppercase={true}>
            <Icon icon="align-left-justify" />
            {__("Description")}
          </ControlLabel>
        </TitleRow>

        {!edit ? (
          <Content
            onClick={toggleEdit}
            dangerouslySetInnerHTML={{
              __html: item.description
                ? xss(item.description)
                : `${__("Add a more detailed description")}...`,
            }}
          />
        ) : (
          <EditorWrapper>
            <RichTextEditor
              content={description}
              onChange={onChangeDescription}
              height={"max-content"}
              isSubmitted={isSubmitted}
              autoFocus={true}
              name={`${contentType}_description_${item._id}`}
              toolbar={[
                "bold",
                "italic",
                "orderedList",
                "bulletList",
                "link",
                "unlink",
                "|",
                "image",
              ]}
              onCtrlEnter={onSend}
            />

            {renderFooter()}
          </EditorWrapper>
        )}
      </ContentWrapper>
    </FormGroup>
  );
};

type Props = {
  item: IItem;
  options: IOptions;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
};

const FileAndDescription = (props: Props) => {
  const { item, saveItem, options } = props;

  const onChangeAttachment = (files: IAttachment[]) =>
    saveItem({ attachments: files });

  const attachments =
    (item.attachments && extractAttachment(item.attachments)) || [];

  return (
    <>
      <FormGroup>
        <TitleRow>
          <ControlLabel uppercase={true}>
            <Icon icon="paperclip" />
            {__("Attachments")}
          </ControlLabel>
        </TitleRow>

        <Uploader defaultFileList={attachments} onChange={onChangeAttachment} />
      </FormGroup>

      <Description item={item} saveItem={saveItem} contentType={options.type} />
    </>
  );
};

export default FileAndDescription;
