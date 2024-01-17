import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import {
  CompanyProductConfig,
  InsuranceProduct,
  Risk,
  RiskConfig,
} from '../../../gql/types';
import SelectRisks from '../../risks/containers/SelectRisks';
import PriceRow from './PriceRow';
import TravelPriceRow from './TravelPriceRow';
import SelectCategory from '../../categories/containers/SelectCategory';
import RiskRow from './RiskRow';
import CustomFieldSection from './CustomFieldSection';

type Props = {
  product?: InsuranceProduct;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  refetch: () => void;
  closeModal: () => void;
};

const ProductForm = (props: Props) => {
  console.log('props', props);
  const [category, setCategory] = React.useState<any>(
    props.product ? props.product.category : undefined,
  );
  const [product, setProduct] = React.useState<any>(
    props.product || {
      code: '',
      name: '',
      description: '',
      price: 0,
      categoryId: '',
    },
  );

  React.useEffect(() => {
    if (props.product) {
      setProduct(props.product);
    }
  }, [props.product]);

  const [riskConfigs, setRiskConfigs] = React.useState<any[]>(
    product.riskConfigs || [],
  );

  const [companyConfigs, setCompanyConfigs] = React.useState<
    CompanyProductConfig[]
  >(product.companyProductConfigs || []);

  const [travelConfigs, setTravelConfigs] = React.useState<any[]>(
    product.travelProductConfigs || [],
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (props.product) {
      finalValues._id = props.product._id;
    }

    Object.keys(product).forEach((key) => {
      if (product[key] !== undefined) {
        finalValues[key] = product[key];
      }
    });

    finalValues.price = parseFloat(finalValues.price);
    finalValues.companyProductConfigs = companyConfigs.map((companyConfig) => {
      return {
        companyId: companyConfig.companyId,
        specificPrice: Number(companyConfig.specificPrice || 0),
      };
    });

    finalValues.riskConfigs = riskConfigs.map((riskConfig) => {
      return {
        riskId: riskConfig.riskId,
        coverage: Number(riskConfig.coverage || 0),
        coverageLimit: Number(riskConfig.coverageLimit || 0),
      };
    });

    return {
      ...finalValues,
    };
  };

  // const save = (data, callback) => {
  //   editMutation({
  //     variables: { _id, ...data }
  //   })
  //     .then(() => {
  //       productDetailQuery.refetch();
  //       callback();
  //     })
  //     .catch(e => {
  //       callback(e);
  //     });
  // };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const renderInput = (
      name: string,
      type: string,
      value: any,
      label: string,
      required?: boolean,
      useNumberFormat?: boolean,
    ) => {
      const onChangeInput = (e: any) => {
        setProduct({
          ...product,
          [name]: e.target.value,
        });
      };

      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <FormControl
            {...formProps}
            id={name}
            name={name}
            type={type}
            required={required}
            useNumberFormat={useNumberFormat}
            defaultValue={value}
            value={value}
            onChange={onChangeInput}
          />
        </FormGroup>
      );
    };

    const renderRisks = () => {
      if (!product.categoryId) {
        return null;
      }

      if (category.code === '2') {
        return null;
      }

      if (riskConfigs.length === 0) {
        return null;
      }

      return (
        <>
          <ControlLabel>{__('Risks')}</ControlLabel>
          {riskConfigs.map((risk, i) => {
            return (
              <RiskRow
                key={i}
                riskName={risk.name}
                config={risk}
                index={i}
                onChange={(index, riskConfig) => {
                  const tempConfigs = [...riskConfigs];
                  tempConfigs[index] = riskConfig;
                  setRiskConfigs(tempConfigs);
                }}
              />
            );
          })}
        </>
      );
    };

    const renderFee = () => {
      if (!product.categoryId) {
        return null;
      }
      if (category.code === '2') {
        return null;
      }

      return (
        <>
          {renderInput(
            'price',
            'number',
            product.price,
            'Fee percent',
            true,
            true,
          )}
          or
          <FormGroup>
            <ControlLabel>Specific fee percent for vendors</ControlLabel>
            {companyConfigs.map((companyConfig, index) => (
              <PriceRow
                key={index}
                index={index}
                productConfig={companyConfig}
                onChange={(rowIndex, productConfig) => {
                  const newCompanyConfigs = [...companyConfigs];
                  newCompanyConfigs[rowIndex] = productConfig;
                  setCompanyConfigs(newCompanyConfigs);
                }}
                remove={(rowIndex) => {
                  setCompanyConfigs(
                    companyConfigs.filter((c, i) => i !== rowIndex),
                  );
                }}
              />
            ))}
            <br />

            <LinkButton
              onClick={() => {
                setCompanyConfigs([
                  ...companyConfigs,
                  { companyId: '', specificPrice: 0 },
                ]);
              }}
            >
              <Icon icon="plus-1" /> Add
            </LinkButton>
          </FormGroup>
        </>
      );
    };

    const renderCustomFields = () => {
      if (!category) {
        return null;
      }
      return (
        <div style={{ width: '50%', padding: '20px', height: '100%' }}>
          <CustomFieldSection
            isDetail={true}
            _id={props.product ? props.product._id : ''}
            product={props.product}
            refetch={props.refetch}
            categoryCode={category ? category.code : ''}
          />
        </div>
      );
    };

    const renderTravelConfigs = () => {
      if (!product.categoryId) {
        return null;
      }

      if (category.code !== '2') {
        return null;
      }

      return (
        <>
          <FormGroup>
            <ControlLabel>Prices</ControlLabel>
            {travelConfigs.map((config, index) => (
              <TravelPriceRow
                key={index}
                index={index}
                config={config}
                onChange={(rowIndex, productConfig) => {
                  const newConfigs = [...travelConfigs];
                  newConfigs[rowIndex] = productConfig;
                  setTravelConfigs(newConfigs);
                }}
                remove={(rowIndex) => {
                  setTravelConfigs(
                    travelConfigs.filter((c, i) => i !== rowIndex),
                  );
                }}
              />
            ))}

            <br />

            <LinkButton
              onClick={() => {
                setTravelConfigs([
                  ...travelConfigs,
                  { duration: '', prices: [] },
                ]);
              }}
            >
              <Icon icon="plus-1" /> Add
            </LinkButton>
          </FormGroup>
        </>
      );
    };

    return (
      <>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              width: props.product ? '50%' : '100%',
              padding: '20px',
              height: '100%',
            }}
          >
            {renderInput('code', 'text', product.code, 'Code', true)}
            {renderInput('name', 'text', product.name, 'Name', true)}
            {renderInput(
              'description',
              'text',
              product.description,
              'Description',
            )}
            <FormGroup>
              <ControlLabel>{__('Category')}</ControlLabel>
              <SelectCategory
                value={product.categoryId}
                onChange={(category, categoryRisks: Risk[]) => {
                  console.log('category', category);
                  setProduct({
                    ...product,
                    categoryId: category._id,
                  });

                  const newConfigs: RiskConfig[] = categoryRisks.map((risk) => {
                    return {
                      riskId: risk._id,
                      name: risk.name,
                      coverage: 0,
                      coverageLimit: 0,
                    };
                  });
                  setCategory(category);
                  setRiskConfigs(newConfigs);
                }}
              />
            </FormGroup>
            {renderRisks()}
            {renderFee()}
            {renderTravelConfigs()}
          </div>
          {renderCustomFields()}
        </div>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'product',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: product,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
