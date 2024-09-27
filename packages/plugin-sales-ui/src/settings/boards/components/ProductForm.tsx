import React, { Fragment, useEffect, useState } from 'react';
import { __, generateTree } from 'coreui/utils';

import { Dialog, Transition } from '@headlessui/react';
import {
  DialogContent,
  DialogWrapper,
  ModalFooter,
  ModalOverlay,
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import { IPipeline } from '@erxes/ui-sales/src/boards/types';
import { IOption } from '../types';
import PaymentsStep from './PaymentsStep';

type Props = {
  onChange: (name: 'pos' | 'description' | 'groups', value: any) => void;
  show: boolean;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  pipeline?: IPipeline;
  options?: IOption;
};

type State = {
  initialCategoryIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken?: string;
};

const ProductForm = (props: Props) => {
  const { onChange, show, closeModal, pipeline } = props;

  const [state, setState] = useState<State>({
    initialCategoryIds: props.pipeline?.initialCategoryIds || [],
    excludeCategoryIds: props.pipeline?.excludeCategoryIds || [],
    excludeProductIds: props.pipeline?.excludeProductIds || [],
    paymentIds: pipeline?.paymentIds || [],
    paymentTypes: pipeline?.paymentTypes || [],
    erxesAppToken: pipeline?.erxesAppToken || '',
  });

  const onChangeValue = (name, value) => {
    setState(prevState => ({ ...prevState, [name]: value }));

    // onChange('pos', { ...pos, [name]: value });
  };

  const generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { pipeline } = props;

    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      type: 'deal',
      boardId: pipeline?.boardId,
      visibility: pipeline?.visibility,
      name: pipeline?.name,
      initialCategoryIds: state.initialCategoryIds || [],
      excludeCategoryIds: state.excludeCategoryIds || [],
      excludeProductIds: state.excludeProductIds || [],
      paymentIds: state?.paymentIds || [],
      paymentTypes: state?.paymentTypes || [],
      erxesAppToken: state?.erxesAppToken || '',
    };
  };
  const renderContent = (formProps: IFormProps) => {
    const { pipeline, renderButton, closeModal, options } = props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);
    const pipelineName =
      options && options.pipelineName
        ? options.pipelineName.toLowerCase()
        : 'pipeline';
    return (
      <div id='manage-pipeline-modal'>
        <div>
          <h4>{__('Initial product categories')}</h4>

          <FormGroup>
            <ControlLabel>Product Category</ControlLabel>
            <SelectProductCategory
              label='Choose product category'
              name='productCategoryId'
              initialValue={state.initialCategoryIds}
              customOption={{
                value: '',
                label: '...Clear product category filter',
              }}
              onSelect={categoryIds =>
                onChangeValue('initialCategoryIds', categoryIds)
              }
              multi={true}
            />
          </FormGroup>
        </div>

        <div>
          <h4>{__('pipeline exclude products')}</h4>
          <FormGroup>
            <ControlLabel>Categories</ControlLabel>
            <SelectProductCategory
              label={'Pipeline'}
              name='excludeCategoryIds'
              initialValue={state.excludeCategoryIds}
              onSelect={categoryIds =>
                onChangeValue('excludeCategoryIds', categoryIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Products</ControlLabel>
            <SelectProducts
              label={'Pipeline'}
              name='excludeProductIds'
              initialValue={state.excludeProductIds}
              onSelect={productIds =>
                onChangeValue('excludeProductIds', productIds)
              }
              multi={true}
            />
          </FormGroup>
          <PaymentsStep {...state} onChange={onChangeValue} />
          <ModalFooter>
            <Button
              btnStyle='simple'
              type='button'
              icon='times-circle'
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: 'pipelineName',
              values: generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object: pipeline,
              confirmationUpdate: true,
            })}
          </ModalFooter>
        </div>
      </div>
    );
  };
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as='div' onClose={closeModal} className={` relative z-10`}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <ModalOverlay />
        </Transition.Child>
        <DialogWrapper>
          <DialogContent>
            <Dialog.Panel className={`dialog-size-xl`}>
              <Dialog.Title as='h3'>
                Edit
                <Icon icon='times' size={24} onClick={closeModal} />
              </Dialog.Title>
              <Transition.Child>
                <div className='dialog-description'>
                  <Form renderContent={renderContent} />
                </div>
              </Transition.Child>
            </Dialog.Panel>
          </DialogContent>
        </DialogWrapper>
      </Dialog>
    </Transition>
  );
};

export default ProductForm;
