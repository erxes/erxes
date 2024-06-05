import React, { useEffect, useState } from "react";
import {
  __,
  Button,
  ControlLabel,
  FormControl,
  Icon,
  Table,
  Tip,
} from "@erxes/ui/src";
import { FlexItem, FlexRow } from "@erxes/ui-settings/src/styles";
import {
  FullContent,
  LinkButton,
  MiddleContent,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import { ITimeframe } from "../types";
import { FormTable, LevelOption, RemoveRow } from "../../styles";

type Props = {
  data: ITimeframe[];
  closeModal: () => void;
  edit: (doc: any) => void;
};

const ManageConfigs = (props: Props) => {
  const { data, closeModal, edit } = props;

  const [configsData, setConfigsData] = useState<ITimeframe[]>(
    data ? data : []
  );

  const [sumPercent, setSumPercent] = useState<number>(0);

  useEffect(() => {
    if (!data || data.length === 0) {
      setConfigsData([
        {
          name: "",
          description: "",
          percent: 0,
          startTime: 0,
          endTime: 0,
        },
      ]);
    } else {
      setConfigsData(data);
    }
    setSumPercent(
      data.length
        ? data.map((d) => d.percent || 0).reduce((sum, d) => sum + d)
        : 0
    );
  }, [data]);

  const addConfig = () => {
    setConfigsData([...configsData, {}]);
  };

  const removeConfigData = (index: number, _id?: string) => {
    const updatedConfigsData = [...configsData];
    const removedConfig = updatedConfigsData.splice(index, 1)[0];

    const newSumPercent = sumPercent - (removedConfig.percent || 0);

    setConfigsData(updatedConfigsData);
    setSumPercent(newSumPercent);
  };

  const onCancel = () => {
    closeModal();
  };

  const onSave = () => {
    edit(configsData);
  };

  const renderRemoveInput = (index, item) => {
    if (configsData.length <= 1) {
      return null;
    }

    return (
      <RemoveRow onClick={() => removeConfigData(index, item._id)}>
        <Icon icon="times" />
      </RemoveRow>
    );
  };

  const renderConfigData = () => {
    return configsData.map((item: any, index: number) => {
      const onChangeConfigData = (event: any, key: string) => {
        const updatedLabels = [...configsData];

        let value: any = (event.target as HTMLInputElement).value;
        if (["startTime", "endTime", "percent"].includes(key)) {
          value = Number(value);
        }
        item[key] = value;

        setConfigsData(updatedLabels);
        setSumPercent(
          configsData.length
            ? configsData.map((d) => d.percent || 0).reduce((sum, d) => sum + d)
            : 0
        );
      };

      return (
        <tr key={index}>
          <td>
            <FormControl
              type="text"
              id={`${index}`}
              value={item.name || ""}
              placeholder={"Name"}
              onChange={(event: any) => onChangeConfigData(event, "name")}
            />
          </td>
          <td>
            <FormControl
              id={`${index}`}
              value={item.description || ""}
              placeholder={"Description"}
              onChange={(event: any) =>
                onChangeConfigData(event, "description")
              }
            />
          </td>
          <td>
            <FormControl
              type="number"
              componentclass="number"
              min={0}
              max={100}
              id={`${index}`}
              value={item.percent || 0}
              onChange={(event: any) => onChangeConfigData(event, "percent")}
            />
          </td>
          <td>
            <FormControl
              type="number"
              componentclass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={item.startTime || ""}
              onChange={(event: any) => onChangeConfigData(event, "startTime")}
            />
          </td>
          <td>
            <FormControl
              type="number"
              componentclass="number"
              min={0}
              max={24}
              id={`${index}`}
              value={item.endTime || ""}
              onChange={(event: any) => onChangeConfigData(event, "endTime")}
            />
          </td>

          <td>{renderRemoveInput(index, item)}</td>
        </tr>
      );
    });
  };

  const renderContent = () => {
    return (
      <>
        <FormTable>
          <thead>
            <tr>
              <th>
                <ControlLabel>Name</ControlLabel>
              </th>
              <th>
                <ControlLabel>Description</ControlLabel>
              </th>
              <th>
                <ControlLabel>Percent</ControlLabel>
              </th>
              <th>
                <ControlLabel>Start time (Hour)</ControlLabel>
              </th>
              <th>
                <ControlLabel>End time (Hour)</ControlLabel>
              </th>
              <th />
            </tr>
          </thead>

          <tbody>{renderConfigData()}</tbody>
        </FormTable>

        <LevelOption>
          <FlexRow justifyContent="space-between">
            <LinkButton onClick={addConfig}>
              <Icon icon="add" /> {__("Add another config")}
            </LinkButton>
            Summary Percent: {sumPercent}
          </FlexRow>
        </LevelOption>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onCancel}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            type="button"
            onClick={onSave}
            icon="check-circle"
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return (
    <FullContent center={true} align={true}>
      <MiddleContent transparent={true}>{renderContent()}</MiddleContent>
    </FullContent>
  );
};
export default ManageConfigs;
