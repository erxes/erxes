import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import React from "react";
import { useReducer } from "react";
import {
  __,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  SortableList,
} from "@erxes/ui/src";
import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { Formgroup } from "@erxes/ui/src/components/form/styles";
import {
  ChecklistItem,
  ChecklistText,
} from "@erxes/ui-sales/src/checklists/styles";
import { FlexRow } from "@erxes/ui-settings/src/styles";

const reducer = (state, action) => {
  return { ...state, ...action };
};

export default function Checklist(props) {
  const [state, dispatch] = useReducer(reducer, {
    ...(props?.activeAction?.config || {}),
  });

  const onInputChange = (e: React.FormEvent<HTMLElement>) => {
    const { name, value } = e.currentTarget as HTMLInputElement;

    dispatch({ [name]: value });
  };

  const renderItem = ({ _id, isChecked, label, isEditing }) => {
    if (isEditing) {
      const onEdit = (e: React.FormEvent<HTMLElement>) => {
        const { value } = e.currentTarget as HTMLInputElement;
        dispatch({
          items: (state?.items || []).map(item =>
            item._id === _id ? { ...item, label: value } : item
          ),
        });
      };
      const onSave = () => {
        dispatch({
          items: (state?.items || []).map(item =>
            item._id === _id ? { ...item, isEditing: false } : item
          ),
        });
      };

      return (
        <FormControl
          type="Type a name of checklist item"
          onChange={onEdit}
          onBlur={e => {
            e.preventDefault();
            onSave();
          }}
          onKeyPress={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            }
          }}
        />
      );
    }

    return (
      <>
        <FormControl
          componentclass="checkbox"
          checked={isChecked}
          onChange={() =>
            dispatch({
              items: (state?.items || []).map(item =>
                item._id === _id
                  ? { ...item, isChecked: !item?.isChecked }
                  : item
              ),
            })
          }
        />

        <ChecklistText>{label}</ChecklistText>
      </>
    );
  };

  return (
    <Common {...props} config={state}>
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>{"Checklist Name"}</ControlLabel>
          <FormControl
            name="name"
            value={state.name}
            onChange={onInputChange}
            placeholder="Type a checklist name"
          />
        </FormGroup>
        <FormGroup>
          <FlexRow $justifyContent="space-between" $alignItems="center">
            <ControlLabel>{__("Checklist items")}</ControlLabel>
            <Button
              btnStyle="success"
              icon="add"
              onClick={() =>
                dispatch({
                  items: [
                    ...(state?.items || []),
                    {
                      _id: Math.random(),
                      label: "",
                      isChecked: false,
                      isEditing: true,
                    },
                  ],
                })
              }
            >
              {"Add checklist item"}
            </Button>
          </FlexRow>
          <DrawerDetail>
            <SortableList
              fields={state?.items || []}
              child={item => (
                <ChecklistItem key={item._id}>{renderItem(item)}</ChecklistItem>
              )}
              isModal={false}
              onChangeFields={values => dispatch({ items: values })}
              isDragDisabled={false}
              showDragHandler={false}
            />
          </DrawerDetail>
        </FormGroup>
      </DrawerDetail>
    </Common>
  );
}
