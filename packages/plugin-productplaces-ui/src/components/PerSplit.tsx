import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import SelectSegments from "@erxes/ui-segments/src/containers/SelectSegments";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from "@erxes/ui/src/components";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils";
import React, { useState } from "react";
import { IConfigsMap } from "../types";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const { configsMap, currentConfigKey, save } = props;
  const [config, setConfig] = useState(props.config);

  const onChangeBoard = (boardId: string) => {
    setConfig({ ...config, boardId });
  };

  const onChangePipeline = (pipelineId: string) => {
    setConfig({ ...config, pipelineId });
  };

  const onChangeStage = (stageId: string) => {
    setConfig({ ...config, stageId });
  };

  const onSave = e => {
    e.preventDefault();
    const key = config.stageId;

    delete configsMap.dealsProductsDataSplit[currentConfigKey];
    configsMap.dealsProductsDataSplit[key] = config;
    save(configsMap);
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig({ ...config });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={currentConfigKey === "newPlacesConfig" ? true : false}
    >
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel>{"Title"}</ControlLabel>
            <FormControl
              defaultValue={config["title"]}
              onChange={onChangeInput.bind(this, "title")}
              required={true}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <BoardSelectContainer
              type="deal"
              autoSelectStage={false}
              boardId={config.boardId}
              pipelineId={config.pipelineId}
              stageId={config.stageId}
              onChangeBoard={onChangeBoard}
              onChangePipeline={onChangePipeline}
              onChangeStage={onChangeStage}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel>{"Product Category"}</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="productCategoryIds"
              initialValue={config.productCategoryIds || ""}
              onSelect={categoryIds =>
                onChangeConfig("productCategoryIds", categoryIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Exclude categories")}</ControlLabel>
            <SelectProductCategory
              name="excludeCategoryIds"
              label="Choose categories to exclude"
              initialValue={config.excludeCategoryIds}
              onSelect={categoryIds =>
                onChangeConfig("excludeCategoryIds", categoryIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Product Tags")}</ControlLabel>
            <SelectTags
              tagsType="core:product"
              name="productTagIds"
              label="Choose product tags"
              initialValue={config.productTagIds || ""}
              onSelect={tagsIds => onChangeConfig("productTagIds", tagsIds)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Exclude tags")}</ControlLabel>
            <SelectTags
              tagsType="core:product"
              name="excludeTagIds"
              label="Choose tags to exclude"
              initialValue={config.excludeTagIds}
              onSelect={tagIds => onChangeConfig("excludeTagIds", tagIds)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Exclude products")}</ControlLabel>
            <SelectProducts
              name="excludeProductIds"
              label="Choose products to exclude"
              initialValue={config.excludeProductIds}
              onSelect={productIds =>
                onChangeConfig("excludeProductIds", productIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Segment")}</ControlLabel>
            <SelectSegments
              name="segments"
              label="Choose segments"
              contentTypes={["core:product"]}
              initialValue={config.segments}
              multi={true}
              onSelect={segmentIds => onChangeConfig("segments", segmentIds)}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <ModalFooter>
        <Button
          btnStyle="simple"
          icon="cancel-1"
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>

        <Button
          btnStyle="primary"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
          disabled={config.stageId ? false : true}
        >
          Save
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};
export default PerSettings;
