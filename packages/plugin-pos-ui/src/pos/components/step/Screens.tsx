import React, { useState } from "react";
import { IPos, IScreenConfig } from "../../../types";
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle,
} from "@erxes/ui/src";
import {
  Block,
  BlockRow,
  BlockRowUp,
  FlexColumn,
  FlexItem,
  DomainRow,
} from "../../../styles";
import { LeftItem } from "@erxes/ui/src/components/step/styles";

type Props = {
  onChange: (name: "pos", value: any) => void;
  pos: IPos;
  checkRemainder: boolean;
};

const ScreensConfig = (props: Props) => {
  const { pos, onChange } = props;

  const [config, setConfig] = useState<any>(
    pos && pos.erkhetConfig
      ? pos.erkhetConfig
      : {
          isSyncErkhet: false,
          userEmail: "",
          defaultPay: "",
          getRemainder: false,
        }
  );

  const [checkRemainder, setCheckRemainder] = useState<boolean>(
    props.checkRemainder
  );

  const renderWaitingScreen = () => {
    let waitingScreen: IScreenConfig = {
      isActive: false,
      type: "time",
      value: 0,
      contentUrl: "",
    };

    if (pos) {
      waitingScreen = pos.waitingScreen || {
        isActive: false,
        type: "time",
        value: 0,
        contentUrl: "",
      };
    }

    if (!waitingScreen.isActive) {
      return (
        <FormGroup>
          <DomainRow></DomainRow>
        </FormGroup>
      );
    }

    const onChangeType = (e) => {
      e.preventDefault();
      onChange("pos", {
        ...pos,
        waitingScreen: {
          ...waitingScreen,
          type: e.target.value,
        },
      });
    };

    const onChangeValue = (e) => {
      e.preventDefault();
      onChange("pos", {
        ...pos,
        waitingScreen: {
          ...waitingScreen,
          value: e.target.value,
        },
      });
    };

    const onChangeContentUrl = (e) => {
      e.preventDefault();
      onChange("pos", {
        ...pos,
        waitingScreen: {
          ...waitingScreen,
          contentUrl: e.target.value,
        },
      });
    };

    const typeOptions = [
      { label: "Time", value: "time" },
      { label: "Count", value: "count" },
    ];

    const valueTitle =
      waitingScreen.type === "time" ? "Change time (min)" : "Change count";

    return (
      <FormGroup>
        <DomainRow>
          <ControlLabel>Change type</ControlLabel>
          <FormControl
            name="changeType"
            componentclass="select"
            placeholder={__("Select type")}
            defaultValue={waitingScreen.type}
            onChange={onChangeType}
            required={true}
          >
            <option />
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormControl>

          <br />

          <ControlLabel>{valueTitle}</ControlLabel>

          <FormControl
            id="changeValue"
            type="text"
            value={waitingScreen.value}
            onChange={onChangeValue}
          />

          <br />
          <ControlLabel>Content Url</ControlLabel>

          <FormControl
            id="contentUrl"
            type="text"
            value={waitingScreen.contentUrl || ""}
            onChange={onChangeContentUrl}
          />
        </DomainRow>
      </FormGroup>
    );
  };

  const renderFilterProducts = () => {
    const showType = pos.kitchenScreen.showType;
    if (showType !== "filtered") {
      return <></>;
    }

    return <></>; // TODO: segment and category filter
  };

  const renderKitchen = () => {
    let kitchenScreen: IScreenConfig = {
      isActive: false,
      showType: "",
      type: "time",
      value: 0,
    };

    if (pos) {
      kitchenScreen = pos.kitchenScreen || {
        isActive: false,
        isPrint: false,
        showType: "",
        type: "time",
        value: 0,
      };
    }

    if (!kitchenScreen.isActive) {
      const onChangeSwitchIsPrint = (e) => {
        onChange("pos", {
          ...pos,
          kitchenScreen: { ...pos.kitchenScreen, isPrint: e.target.checked },
        });
      };

      return (
        <FormGroup>
          <DomainRow>
            <ControlLabel>Print</ControlLabel>
            <Toggle
              id={"isPrint"}
              checked={
                pos && pos.kitchenScreen ? pos.kitchenScreen.isPrint : false
              }
              onChange={onChangeSwitchIsPrint}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>,
              }}
            />
          </DomainRow>
        </FormGroup>
      );
    }

    const onChangeType = (e) => {
      e.preventDefault();
      const name = e.target.name;
      const value = e.target.value;
      onChange("pos", {
        ...pos,
        kitchenScreen: {
          ...kitchenScreen,
          [name]: value,
        },
      });
    };

    const onChangeValue = (e) => {
      e.preventDefault();
      onChange("pos", {
        ...pos,
        kitchenScreen: {
          ...kitchenScreen,
          value: e.target.value,
        },
      });
    };

    const typeOptions = [
      { label: "Time", value: "time" },
      { label: "Manual", value: "manual" },
    ];

    const showOptions = [
      { label: "All saved orders", value: "" },
      { label: "Paid all orders", value: "paid" },
      // { label: 'Orders containing certain products', value: 'filtered' },
      { label: "Defined orders only", value: "click" },
    ];

    return (
      <FormGroup>
        <DomainRow>
          <ControlLabel>show types</ControlLabel>
          <FormControl
            name="showType"
            componentclass="select"
            placeholder={__("Select type")}
            defaultValue={kitchenScreen.showType}
            onChange={onChangeType}
            required={true}
          >
            {showOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormControl>
          {renderFilterProducts}
          <br />

          <ControlLabel>Status change /leave/</ControlLabel>
          <FormControl
            name="type"
            componentclass="select"
            placeholder={__("Select type")}
            defaultValue={kitchenScreen.type}
            onChange={onChangeType}
            required={true}
          >
            <option />
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormControl>

          <br />

          {kitchenScreen.type === "time" ? (
            <>
              <ControlLabel>Time (minute)</ControlLabel>
              <FormControl
                id="changeValue"
                type="text"
                value={kitchenScreen.value}
                onChange={onChangeValue}
              />
            </>
          ) : null}
        </DomainRow>
      </FormGroup>
    );
  };

  const onChangeSwitch = (e) => {
    onChange("pos", {
      ...pos,
      [e.target.id]: { ...pos[e.target.id], isActive: e.target.checked },
    });
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__("Main")}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Kitchen screen</ControlLabel>
                <Toggle
                  id={"kitchenScreen"}
                  checked={
                    pos && pos.kitchenScreen
                      ? pos.kitchenScreen.isActive
                      : false
                  }
                  onChange={onChangeSwitch}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>,
                  }}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Waiting screen</ControlLabel>
                <Toggle
                  id={"waitingScreen"}
                  checked={
                    pos && pos.waitingScreen
                      ? pos.waitingScreen.isActive
                      : false
                  }
                  onChange={onChangeSwitch}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>,
                  }}
                />
              </FormGroup>
            </BlockRow>
            <BlockRowUp>
              {renderKitchen()}
              {renderWaitingScreen()}
            </BlockRowUp>
          </Block>

          <Block />
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default ScreensConfig;
