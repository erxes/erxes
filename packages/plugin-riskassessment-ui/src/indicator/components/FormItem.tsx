import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  Tip,
  __,
  colors,
  confirm,
} from '@erxes/ui/src';
import { COLORS, calculateMethods } from '../../common/constants';
import {
  ColorPick,
  ColorPicker,
  FormColumn,
  FormWrapper,
  ModalFooter,
} from '@erxes/ui/src/styles/main';
import {
  ContentWrapper,
  FormContainer,
  FormContent,
  PreviewWrapper,
  RemoveRow,
} from '../../styles';
import { IField, IFormProps } from '@erxes/ui/src/types';

import CreateForm from '@erxes/ui-forms/src/forms/containers/CreateForm';
import EditForm from '@erxes/ui-forms/src/forms/containers/EditForm';
import Popover from '@erxes/ui/src/components/Popover';
import React, { useState } from 'react';
import { RiskCalculateLogicType } from '../common/types';
import Select from 'react-select';
import { ShowPreview } from '@erxes/ui-forms/src/forms/styles';
import TwitterPicker from 'react-color/lib/Twitter';
import client from '@erxes/ui/src/apolloClient';
import { mutations } from '../graphql';
import { gql } from '@apollo/client';
type Props = {
  formId?: string;
  doc: any;
  handleChange: (doc) => void;
  totalFormsCount: number;
  max: number;
  remove: (id: string) => void;
};

// class Item extends React.Component<Props, State> {
//   constructor(props) {
//     super(props);

//     this.state = {
//       isReadyToSave: false,
//       doc: {},
//       formData:{}
//     };
//   }

//   handleCloseForm = (closeModal) => {
//     const { formId } = this.state.doc;
//     const { doc } = this.props;

//     if (formId && !doc) {
//       confirm(
//         `Are you sure you want to close.Your created form won't save`
//       ).then(() => {
//         client.mutate({
//           mutation: gql(mutations.removeUnusedRiskIndicatorForm),
//           variables: { formId },
//         });
//         return closeModal();
//       });
//     }
//     closeModal();
//   };

//   renderFormContent = ({ closeModal }) => {
//     const { doc } = this.props;

//     const formPreview = (previewRenderer, fields: IField[]) => {
//       const handleSaveForm = () => {
//         this.setState({ isReadyToSave: true });
//       };

//       const footer = (items: number) => {
//         if (items === 0) {
//           return null;
//         }

//         return (
//           <>
//             <ShowPreview>
//               <Icon icon="eye" /> {__("Form preview")}
//             </ShowPreview>
//             <ModalFooter>
//               <Button
//                 btnStyle="simple"
//                 type="button"
//                 icon="cancel-1"
//                 onClick={() => this.handleCloseForm(closeModal)}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 btnStyle="success"
//                 type="button"
//                 icon="cancel-1"
//                 onClick={handleSaveForm}
//               >
//                 Save
//               </Button>
//             </ModalFooter>
//           </>
//         );
//       };
//       return (
//         <PreviewWrapper>
//           {previewRenderer()}
//           {footer(fields ? fields.length : 0)}
//         </PreviewWrapper>
//       );
//     };
//     const afterDbSave = (formId: string) => {
//       this.setState({
//         isReadyToSave: false,
//       });
//       this.props.handleChange({ ...this.props.doc, formId });
//       closeModal();
//     };

//     const formProps = {
//       renderPreviewWrapper: formPreview,
//       afterDbSave,
//       onDocChange: formData => this.setState({ formData }),
//       type: 'risk-assessment',
//       isReadyToSave: this.state.isReadyToSave,
//       hideOptionalFields: true,
//     };
//     if (doc.formId) {
//       return (
//         <ContentWrapper>
//           <EditForm {...formProps} formId={doc.formId} />
//         </ContentWrapper>
//       );
//     }

//     return (
//       <ContentWrapper>
//         <CreateForm {...formProps} />
//       </ContentWrapper>
//     );
//   };

//   renderLogic(
//     { _id, name, logic, value, value2, color }: RiskCalculateLogicType,
//     formProps
//   ) {
//     const handleRow = (e) => {
//       const { doc, handleChange } = this.props;
//       const { name, value } = e.currentTarget as HTMLInputElement;
//       const newVariables =
//         doc.calculateLogics &&
//         doc?.calculateLogics.map((logic) =>
//           logic._id === _id
//             ? {
//                 ...logic,
//                 [name]: ["value", "value2"].includes(name)
//                   ? parseInt(value)
//                   : value,
//               }
//             : logic
//         );
//       handleChange({ ...doc, calculateLogics: newVariables });
//     };

//     const removeLogicRow = (e) => {
//       const { doc, handleChange } = this.props;
//       const removedLogicRows =
//         doc.calculateLogics &&
//         doc?.calculateLogics.filter((logic) => logic._id !== _id);
//       handleChange({
//         ...doc,
//         calculateLogics: removedLogicRows,
//       });
//     };

//     const onChangeColor = (hex) => {
//       const { doc, handleChange } = this.props;
//       const newVariables =
//         doc.calculateLogics &&
//         doc.calculateLogics.map((logic) =>
//           logic._id === _id ? { ...logic, color: hex } : logic
//         );
//       handleChange({
//         ...doc,
//         calculateLogics: newVariables,
//       });
//     };

//     const renderColorSelect = (selectedColor) => {
//       return (
//         <Popover
//           placement="bottom-start"
//           trigger={
//             <ColorPick>
//               <ColorPicker style={{ backgroundColor: selectedColor }} />
//             </ColorPick>
//           }
//         >
//           <TwitterPicker
//             width="266px"
//             triangle="hide"
//             color={selectedColor}
//             onChange={(e) => onChangeColor(e.hex)}
//             colors={COLORS}
//           />
//         </Popover>
//       );
//     };

//     return (
//       <FormWrapper style={{ margin: "5px 0" }} key={_id}>
//         <FormColumn>
//           <FormControl
//             {...formProps}
//             name="name"
//             type="text"
//             defaultValue={name}
//             onChange={handleRow}
//             required
//           />
//         </FormColumn>
//         <FormColumn>
//           <FormControl
//             name="logic"
//             {...formProps}
//             componentclass="select"
//             required
//             defaultValue={logic}
//             onChange={handleRow}
//           >
//             <option />
//             {["(>) greater than", "(<) lower than", "(≈) between"].map(
//               (value) => (
//                 <option value={value} key={value}>
//                   {value}
//                 </option>
//               )
//             )}
//           </FormControl>
//         </FormColumn>
//         <FormColumn>
//           <FormContainer $row $gap align="center">
//             <FormControl
//               {...formProps}
//               name="value"
//               type="number"
//               defaultValue={value}
//               onChange={handleRow}
//               required
//             />
//             {logic === "(≈) between" && (
//               <>
//                 <span>-</span>
//                 <FormControl
//                   {...formProps}
//                   name="value2"
//                   type="number"
//                   defaultValue={value2}
//                   onChange={handleRow}
//                   required
//                 />
//               </>
//             )}
//           </FormContainer>
//         </FormColumn>
//         <FormColumn>{renderColorSelect(color)}</FormColumn>
//         <Tip text="Remove Row" placement="bottom">
//           <Button
//             btnStyle="danger"
//             icon="times"
//             onClick={removeLogicRow}
//             style={{ marginLeft: "10px" }}
//           />
//         </Tip>
//       </FormWrapper>
//     );
//   }

//   renderLogics(formProps) {
//     const { doc } = this.props;

//     return (
//       doc.calculateLogics &&
//       doc.calculateLogics.map((logic) => this.renderLogic(logic, formProps))
//     );
//   }

//   renderContent = (formProps: IFormProps) => {
//     const { doc, totalFormsCount, max } = this.props;

//     const formTrigger = (
//       <Button
//         btnStyle="link"
//         icon={!!this.props.doc.formId ? "file-edit-alt" : "file-plus-alt"}
//         iconColor={colors.colorPrimary}
//       >
//         {__(!!this.props.doc?.formId ? "Edit a form" : "Build a form")}
//       </Button>
//     );

//     const handleAddLevel = (e) => {
//       const { doc, handleChange } = this.props;
//       const variables = {
//         _id: Math.random().toString(),
//         name: "",
//         value: 0,
//         logic: "",
//       };

//       handleChange({
//         ...doc,
//         calculateLogics: [...(doc.calculateLogics || []), variables],
//       });
//     };

//     const handleChangeCalculateMethod = ({ value }: any) => {
//       const { doc, handleChange } = this.props;

//       handleChange({ ...doc, calculateMethod: value });
//     };

//     const handleChangePercentWeight = (e) => {
//       const { doc, handleChange } = this.props;
//       const { value } = e.currentTarget as HTMLInputElement;

//       handleChange({ ...doc, percentWeight: parseInt(value) });
//     };

//     const removeRow = (id) => {
//       const { doc, remove } = this.props;

//       if (doc.formId) {
//         return confirm(
//           "Are you sure.If you remove this row you will lose created form data"
//         ).then(() => {
//           client.mutate({
//             mutation: gql(mutations.removeUnusedRiskIndicatorForm),
//             variables: { formId: doc.formId },
//           });
//           remove(id);
//         });
//       }
//     };

//     return (
//       <div key={doc._id}>
//         {totalFormsCount > 1 && (
//           <RemoveRow onClick={removeRow.bind(this, doc._id)}>
//             <Icon icon="times-circle" />
//           </RemoveRow>
//         )}
//         <FormWrapper>
//           <FormColumn>
//             <FormGroup>
//               <ControlLabel>{__('Calculate Methods')}</ControlLabel>
//               <Select
//                 placeholder={__('Select Calculate Method')}
//                 value={calculateMethods.find(
//                   o => o.value === doc?.calculateMethod
//                 )}
//                 options={calculateMethods}
//                 isMulti={false}
//                 isClearable={true}
//                 onChange={handleChangeCalculateMethod}
//               />
//             </FormGroup>
//           </FormColumn>
//           {totalFormsCount > 1 && (
//             <FormGroup>
//               <ControlLabel>{__('Percent weight')}</ControlLabel>
//               <FormControl
//                 type="number"
//                 name="percentWeight"
//                 value={doc?.percentWeight}
//                 max={50}
//                 maxLength={50}
//                 min={0}
//                 onChange={handleChangePercentWeight}
//               />
//             </FormGroup>
//           )}
//           <ModalTrigger
//             title={!!this.props.doc.formId ? 'Edit Form' : 'Build New Form'}
//             enforceFocus={false}
//             size="xl"
//             content={this.renderFormContent}
//             trigger={formTrigger}
//           />
//         </FormWrapper>
//         {totalFormsCount === 1 && (
//           <>
//             <FormWrapper>
//               {['Name', 'Logic', 'Value', 'Status Color'].map(head => (
//                 <FormColumn key={head}>
//                   <ControlLabel required>{head}</ControlLabel>
//                 </FormColumn>
//               ))}
//               <Tip text="Add Level" placement="bottom">
//                 <Button
//                   btnStyle="default"
//                   icon="add"
//                   onClick={handleAddLevel}
//                 />
//               </Tip>
//             </FormWrapper>
//             {this.renderLogics(formProps)}
//           </>
//         )}
//       </div>
//     );
//   };

//   render() {
//     return (
//       <FormContent>
//         <CommonForm renderContent={this.renderContent} />
//       </FormContent>
//     );
//   }
// }

const Item = ({ doc, totalFormsCount, max, handleChange, remove }: Props) => {
  const [stateDoc, setStateDoc] = useState<any>();
  const [isReadyToSave, setIsReadyToSave] = useState(false);

  const renderFormContent = ({ closeModal }) => {
    const handleCloseForm = closeModal => {
      const { formId } = stateDoc;

      if (formId && !doc) {
        confirm(
          `Are you sure you want to close.Your created form won't save`
        ).then(() => {
          client.mutate({
            mutation: gql(mutations.removeUnusedRiskIndicatorForm),
            variables: { formId },
          });
          return closeModal();
        });
      }
      closeModal();
    };

    const formPreview = (previewRenderer, fields: IField[]) => {
      const handleSaveForm = () => {
        setIsReadyToSave(true);
      };

      const footer = (items: number) => {
        if (items === 0) {
          return null;
        }

        return (
          <>
            <ShowPreview>
              <Icon icon="eye" /> {__('Form preview')}
            </ShowPreview>
            <ModalFooter>
              <Button
                btnStyle="simple"
                type="button"
                icon="cancel-1"
                onClick={() => handleCloseForm(closeModal)}
              >
                Cancel
              </Button>

              <Button
                btnStyle="success"
                type="button"
                icon="cancel-1"
                onClick={handleSaveForm}
              >
                Save
              </Button>
            </ModalFooter>
          </>
        );
      };
      return (
        <PreviewWrapper>
          {previewRenderer()}
          {footer(fields ? fields.length : 0)}
        </PreviewWrapper>
      );
    };
    const afterDbSave = (formId: string) => {
      //  this.setState({
      //    isReadyToSave: false,
      //  });
      setIsReadyToSave(false);
      handleChange({ ...doc, formId });
      closeModal();
    };

    const formProps = {
      renderPreviewWrapper: formPreview,
      afterDbSave,
      type: 'risk-assessment',
      isReadyToSave,
      isAviableToSaveWhenReady: true,
      hideOptionalFields: true,
      fieldTypes: ['input', 'textarea', 'check', 'radio', 'select'],
      name: 'RiskAssessment',
    };
    if (doc.formId) {
      return (
        <ContentWrapper>
          <EditForm {...formProps} formId={doc.formId} />
        </ContentWrapper>
      );
    }

    return (
      <ContentWrapper>
        <CreateForm {...formProps} />
      </ContentWrapper>
    );
  };

  const renderLogic = (
    { _id, name, logic, value, value2, color }: RiskCalculateLogicType,
    formProps
  ) => {
    const handleRow = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;
      const newVariables =
        doc.calculateLogics &&
        doc?.calculateLogics.map(logic =>
          logic._id === _id
            ? {
                ...logic,
                [name]: ['value', 'value2'].includes(name)
                  ? parseInt(value)
                  : value,
              }
            : logic
        );
      handleChange({ ...doc, calculateLogics: newVariables });
    };

    const removeLogicRow = e => {
      const removedLogicRows =
        doc.calculateLogics &&
        doc?.calculateLogics.filter(logic => logic._id !== _id);
      handleChange({
        ...doc,
        calculateLogics: removedLogicRows,
      });
    };

    const onChangeColor = hex => {
      const newVariables =
        doc.calculateLogics &&
        doc.calculateLogics.map(logic =>
          logic._id === _id ? { ...logic, color: hex } : logic
        );
      handleChange({
        ...doc,
        calculateLogics: newVariables,
      });
    };

    const renderColorSelect = selectedColor => {
      return (
        <Popover
          placement="bottom-start"
          trigger={
            <ColorPick>
              <ColorPicker style={{ backgroundColor: selectedColor }} />
            </ColorPick>
          }
        >
          <TwitterPicker
            width="266px"
            triangle="hide"
            color={selectedColor}
            onChange={e => onChangeColor(e.hex)}
            colors={COLORS}
          />
        </Popover>
      );
    };

    return (
      <FormWrapper style={{ margin: '5px 0' }} key={_id}>
        <FormColumn>
          <FormControl
            {...formProps}
            name="name"
            type="text"
            defaultValue={name}
            onChange={handleRow}
            required
          />
        </FormColumn>
        <FormColumn>
          <FormControl
            name="logic"
            {...formProps}
            componentclass="select"
            required
            defaultValue={logic}
            onChange={handleRow}
          >
            <option />
            {['(>) greater than', '(<) lower than', '(≈) between'].map(
              value => (
                <option value={value} key={value}>
                  {value}
                </option>
              )
            )}
          </FormControl>
        </FormColumn>
        <FormColumn>
          <FormContainer $row $gap align="center">
            <FormControl
              {...formProps}
              name="value"
              type="number"
              defaultValue={value}
              onChange={handleRow}
              required
            />
            {logic === '(≈) between' && (
              <>
                <span>-</span>
                <FormControl
                  {...formProps}
                  name="value2"
                  type="number"
                  defaultValue={value2}
                  onChange={handleRow}
                  required
                />
              </>
            )}
          </FormContainer>
        </FormColumn>
        <FormColumn>{renderColorSelect(color)}</FormColumn>
        <Tip text="Remove Row" placement="bottom">
          <Button
            btnStyle="danger"
            icon="times"
            onClick={removeLogicRow}
            style={{ marginLeft: '10px' }}
          />
        </Tip>
      </FormWrapper>
    );
  };

  const renderLogics = formProps => {
    return (
      doc.calculateLogics &&
      doc.calculateLogics.map(logic => renderLogic(logic, formProps))
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const formTrigger = (
      <Button
        btnStyle="link"
        icon={!!doc.formId ? 'file-edit-alt' : 'file-plus-alt'}
        iconColor={colors.colorPrimary}
      >
        {__(!!doc?.formId ? 'Edit a form' : 'Build a form')}
      </Button>
    );

    const handleAddLevel = e => {
      const variables = {
        _id: Math.random().toString(),
        name: '',
        value: 0,
        logic: '',
      };

      handleChange({
        ...doc,
        calculateLogics: [...(doc.calculateLogics || []), variables],
      });
    };

    const handleChangeCalculateMethod = ({ value }: any) => {
      handleChange({ ...doc, calculateMethod: value });
    };

    const handleChangePercentWeight = e => {
      const { value } = e.currentTarget as HTMLInputElement;

      handleChange({ ...doc, percentWeight: parseInt(value) });
    };

    const removeRow = id => {
      if (doc.formId) {
        return confirm(
          'Are you sure.If you remove this row you will lose created form data'
        ).then(() => {
          client.mutate({
            mutation: gql(mutations.removeUnusedRiskIndicatorForm),
            variables: { formId: doc.formId },
          });
          remove(id);
        });
      }
    };

    return (
      <div key={doc._id}>
        {totalFormsCount > 1 && (
          <RemoveRow onClick={removeRow.bind(this, doc._id)}>
            <Icon icon="times-circle" />
          </RemoveRow>
        )}
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Calculate Methods')}</ControlLabel>
              <Select
                placeholder={__('Select Calculate Method')}
                value={calculateMethods.find(
                  o => o.value === doc?.calculateMethod
                )}
                options={calculateMethods}
                isMulti={false}
                isClearable={true}
                onChange={handleChangeCalculateMethod}
              />
            </FormGroup>
          </FormColumn>
          {totalFormsCount > 1 && (
            <FormGroup>
              <ControlLabel>{__('Percent weight')}</ControlLabel>
              <FormControl
                type="number"
                name="percentWeight"
                value={doc?.percentWeight}
                max={50}
                maxLength={50}
                min={0}
                onChange={handleChangePercentWeight}
              />
            </FormGroup>
          )}
          <ModalTrigger
            title={!!doc.formId ? 'Edit Form' : 'Build New Form'}
            enforceFocus={false}
            size="xl"
            content={renderFormContent}
            trigger={formTrigger}
          />
        </FormWrapper>
        {totalFormsCount === 1 && (
          <>
            <FormWrapper>
              {['Name', 'Logic', 'Value', 'Status Color'].map(head => (
                <FormColumn key={head}>
                  <ControlLabel required>{head}</ControlLabel>
                </FormColumn>
              ))}
              <Tip text="Add Level" placement="bottom">
                <Button
                  btnStyle="default"
                  icon="add"
                  onClick={handleAddLevel}
                />
              </Tip>
            </FormWrapper>
            {renderLogics(formProps)}
          </>
        )}
      </div>
    );
  };
  return (
    <FormContent>
      <CommonForm renderContent={renderContent} />
    </FormContent>
  );
};

export default Item;
