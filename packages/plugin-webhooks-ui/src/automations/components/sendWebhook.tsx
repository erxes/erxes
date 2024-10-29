import React, { useState, useEffect } from "react";
import {
  FormGroup,
  FormControl,
  ControlLabel,
  __,
  Toggle,
  Button,
  colors,
  Icon,
} from "@erxes/ui/src";
import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import SelectFields from "@erxes/ui-automations/src/containers/forms/actions/SelectFields";
import { IAction } from "@erxes/ui-automations/src/types";
import { LinkButton } from "@erxes/ui/src/styles/main";
import { Columns } from "@erxes/ui/src/styles/chooser";
import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import { EndColumn, FirstColumn, ListItem, Padding } from "../styles";
import Select from "react-select";

type Props = {
  activeAction: IAction;
  triggerType: string;
  closeModal: () => void;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

const RESP_METHODS = [
  {
    value: "POST",
    label: "POST",
  },
  {
    value: "PUT",
    label: "PUT",
  },
  {
    value: "DELETE",
    label: "DELETE",
  },
  {
    value: "PATCH",
    label: "PATCH",
  },
];

const SendWebhook = (props: Props) => {
  const { triggerType, closeModal, activeAction, addAction } = props;

  const [config, setConfig] = useState<any>();
  const [useSpecifiedFields, setUseSpecifiedFields] = useState<boolean>();

  useEffect(() => {
    const specifiedField =
      !!Object.keys(activeAction?.config?.specifiedFields || {}).length ||
      false;

    setUseSpecifiedFields(specifiedField);
    setConfig(activeAction?.config || {});
  }, []);

  const handleOnChange = (config) => {
    setConfig(config);
  };

  const handleOnChangeFields = (rConf) => {
    setConfig((prevConfig) => {
      return {
        ...prevConfig,
        specifiedFields: { ...(prevConfig?.specifiedFields || {}), ...rConf },
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.currentTarget as HTMLInputElement;

    handleOnChange({ ...config, [name]: value });
  };

  const handleSelect = ({ value }: any) => {
    handleOnChange({ ...config, method: value });
  };

  const renderParam = (param) => {
    const { params } = config || {};

    const onChange = (e) => {
      const { name, value } = e.currentTarget as HTMLInputElement;

      const updatedParams = params.map((h) =>
        h._id === param._id ? { ...h, [name]: value } : h
      );

      setConfig((prevConfig) => {
        return { ...prevConfig, params: updatedParams };
      });
    };

    const handleRemove = () => {
      const updatedParams = params.filter((h) => h._id !== param._id);
      setConfig((prevConfig) => {
        return { ...prevConfig, params: updatedParams };
      });
    };

    return (
      <ListItem key={param._id}>
        <Columns>
          <FirstColumn>
            <FormGroup>
              <FormControl
                name="key"
                placeholder="key"
                value={param?.key}
                onChange={onChange}
              />
            </FormGroup>
          </FirstColumn>
          <EndColumn>
            <FormGroup>
              <FormControl
                name="value"
                value={param?.value}
                placeholder="value"
                onChange={onChange}
              />
            </FormGroup>
          </EndColumn>
          <Button
            icon="trash-alt"
            iconColor={colors.colorCoreRed}
            btnStyle="link"
            onClick={handleRemove}
          />
        </Columns>
      </ListItem>
    );
  };

  const renderParams = () => {
    const addParam = () => {
      setConfig((prevConfig) => {
        return {
          ...prevConfig,
          params: [
            ...(config?.params || []),
            { _id: Math.random(), key: "", value: "" },
          ],
        };
      });
    };

    return (
      <>
        {(config?.params || []).map((param) => renderParam(param))}
        <LinkButton onClick={addParam}>
          <Icon icon="plus-1" />
          {"Add param"}
        </LinkButton>
      </>
    );
  };

  const renderHeader = (header) => {
    const { headers } = config || {};

    const onChange = (e) => {
      const { name, value } = e.currentTarget as HTMLInputElement;

      const updatedHeaders = headers.map((h) =>
        h._id === header._id ? { ...h, [name]: value } : h
      );

      setConfig((prevConfig) => {
        return {
          ...prevConfig,
          headers: updatedHeaders,
        };
      });
    };

    const handleRemove = () => {
      const updatedHeaders = headers.filter((h) => h._id !== header._id);
      setConfig((prevConfig) => {
        return {
          ...prevConfig,
          headers: updatedHeaders,
        };
      });
    };

    return (
      <ListItem key={header._id}>
        <Columns>
          <FirstColumn>
            <FormGroup>
              <FormControl
                name="key"
                placeholder={__("key")}
                value={header?.key}
                onChange={onChange}
              />
            </FormGroup>
          </FirstColumn>
          <EndColumn>
            <FormGroup>
              <FormControl
                name="value"
                value={header?.value}
                placeholder={__("value")}
                onChange={onChange}
              />
            </FormGroup>
          </EndColumn>
          <Button
            icon="trash-alt"
            iconColor={colors.colorCoreRed}
            btnStyle="link"
            onClick={handleRemove}
          />
        </Columns>
      </ListItem>
    );
  };

  const renderHeaders = () => {
    const addHeader = () => {
      setConfig((prevConfig) => {
        return {
          ...prevConfig,
          headers: [
            ...(config?.headers || []),
            { _id: Math.random(), key: "", value: "" },
          ],
        };
      });
    };

    return (
      <>
        {(config?.headers || []).map((header) => renderHeader(header))}
        <LinkButton onClick={addHeader}>
          <Icon icon="plus-1" />
          {__("Add header")}
        </LinkButton>
      </>
    );
  };

  return (
    <DrawerDetail>
      <Common
        closeModal={closeModal}
        addAction={addAction}
        activeAction={activeAction}
        config={config}
      >
        <Columns>
          <FirstColumn>
            <FormGroup>
              <ControlLabel>{__("Method")}</ControlLabel>

              <Select
                value={RESP_METHODS.find(
                  (o) => o.value === (config?.method || "POST")
                )}
                options={RESP_METHODS}
                name="method"
                isClearable={false}
                onChange={handleSelect}
              />
            </FormGroup>
          </FirstColumn>
          <EndColumn>
            <FormGroup>
              <ControlLabel required>{__("Post Url")}</ControlLabel>
              <FormControl
                name="url"
                value={config?.url}
                placeholder="https://erxes.io/..."
                onChange={handleChange}
              />
            </FormGroup>
          </EndColumn>
        </Columns>

        <DrawerDetail>
          <ControlLabel>{__("Headers (optional)  ")}</ControlLabel>
          {renderHeaders()}
        </DrawerDetail>
        <Padding />
        <DrawerDetail>
          <ControlLabel>{__("Params (optional)  ")}</ControlLabel>
          {renderParams()}
        </DrawerDetail>
        <FormGroup>
          <ControlLabel>{__("Use specified fields")}</ControlLabel>
          <Toggle
            onChange={() => {
              setUseSpecifiedFields((prevFields) => !prevFields);

              setConfig((prevConfig) => {
                return {
                  ...prevConfig,
                  specifiedFields: !useSpecifiedFields ? {} : undefined,
                };
              });
            }}
          />
        </FormGroup>

        {useSpecifiedFields && (
          <SelectFields
            config={config?.specifiedFields || {}}
            triggerType={triggerType}
            onSelect={handleOnChangeFields}
            actionType={triggerType}
            label={__("Add Fields")}
            withDefaultValue={true}
          />
        )}
      </Common>
    </DrawerDetail>
  );
};

export default SendWebhook;
