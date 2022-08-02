import {
  __,
  Button,
  CollapseContent,
  ControlLabel,
  extractAttachment,
  Form,
  FormControl,
  FormGroup,
  generateCategoryOptions,
  MainStyleDateContainer as DateContainer,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Uploader from '@erxes/ui/src/components/Uploader';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import {
  BOW_TYPES,
  BRAKE_TYPES,
  CAR_FUEL_TYPES,
  CAR_STEERING_WHEEL,
  DOOR_CHANGE,
  DRIVING_CLASSIFICATION,
  ENGINE_CHANGE,
  FLOOR_TYPE,
  INTERVAL_TYPES,
  LIFT_CHANGE,
  LIFT_TYPE,
  LIFT_WAGON_CAPACITY_TYPES,
  MANUFACTURE_TYPES,
  OWNER_TYPES,
  REPAIR_SERVICE_TYPES,
  RUNNING_TYPES,
  SEAT_CHANGE,
  TIRE_LOAD_TYPES,
  TRAILER_TYPES,
  TRANSMISSION_TYPES,
  WAGON_CAPACITY_TYPES
} from '../../constants';
import { ICar, ICarCategory, ICarDoc } from '../../types';

const generateOptionsConstants = (items, isEmpty = false) => {
  const result: React.ReactNode[] = [];

  if (isEmpty) {
    result.push(
      <option key={''} value={''}>
        Сонгоно уу.
      </option>
    );
  }

  for (const item of items) {
    result.push(
      <option key={item.value} value={item.value}>
        {item.label}
      </option>
    );
  }

  return result;
};

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  car: ICar;
  closeModal: () => void;
  carCategories: ICarCategory[];
};

type State = {
  users?: IUser[];

  categoryId: string;

  fuelType: string;
  steeringWheel: string;
  ownerBy: string;
  manufacture: string;
  drivingClassification: string;
  repairService: string;
  transmission: string;
  engineChange: string;
  trailerType: string;
  tireLoadType: string;
  bowType: string;
  brakeType: string;
  floorType: string;
  liftType: string;
  doors: string;
  seats: string;
  interval: string[];
  running: string;
  wagonCapacity: string[];
  liftWagonCapacity: string[];
  listChange: string;

  generalClassification: string;

  nowYear: number;
  attachments: any;
  frontAttachments: any;
  leftAttachments: any;
  rightAttachments: any;
  backAttachments: any;
  floorAttachments: any;
  transformationAttachments: any;
  wagonLength: number;
  wagonWidth: number;
  height: number;
  volume: any;
  req: boolean;

  moreValues: any;
  activeSections: any;
};

class CarForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { car = {}, carCategories } = props;
    const nowYear = new Date().getFullYear();

    const activeSections = {
      renderMain: false,
      renderTechnicalSpecification: false,
      renderWagonInformation: false,
      renderBarrelInformation: false,
      renderVehicleImages: false,
      renderForceImformation: false
    };

    const category =
      car.category || (carCategories.length && carCategories[0]) || {};

    (category.collapseContent || []).map(c => (activeSections[c] = true));

    this.state = {
      users: [],
      categoryId: car.categoryId || '',

      ownerBy: car.ownerBy || '',
      fuelType: car.fuelType || '',
      steeringWheel: car.steeringWheel || '',
      manufacture: car.manufacture || '',
      drivingClassification: car.drivingClassification || '',
      repairService: car.repairService || '',
      transmission: car.transmission || '',
      engineChange: car.engineChange || '',
      trailerType: car.trailerType || '',
      tireLoadType: car.tireLoadType || '',
      bowType: car.bowType || '',
      brakeType: car.brakeType || '',
      floorType: car.floorType || '',
      liftType: car.liftType || '',
      doors: car.doors || '',
      seats: car.seats || '',
      interval: car.interval || [],
      running: car.running || [],
      wagonCapacity: car.wagonCapacity || [],
      liftWagonCapacity: car.liftWagonCapacity || [],
      listChange: car.listChange || '',

      wagonLength: car.wagonLength || 0,
      wagonWidth: car.wagonWidth || 0,
      height: car.height || 0,
      volume: car.volume || 0,
      req: true,

      generalClassification: car.generalClassification || '',

      nowYear,
      attachments: car.attachments || undefined,
      frontAttachments: car.frontAttachments || undefined,
      leftAttachments: car.leftAttachments || undefined,
      rightAttachments: car.rightAttachments || undefined,
      backAttachments: car.backAttachments || undefined,
      floorAttachments: car.floorAttachments || undefined,
      transformationAttachments: car.transformationAttachments || undefined,

      moreValues: { ...car },
      activeSections
    };
  }

  generateDoc = (values: { _id: string } & ICarDoc) => {
    const { car } = this.props;

    const finalValues = values;

    if (car) {
      finalValues._id = car._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      ...this.state.moreValues,
      description: finalValues.description,
      plateNumber: finalValues.plateNumber,
      vinNumber: finalValues.vinNumber,
      vintageYear: Number(finalValues.vintageYear),
      importYear: Number(finalValues.importYear),
      categoryId: finalValues.categoryId,
      trailerType: finalValues.trailerType,
      manufacture: finalValues.manufacture,
      steeringWheel: finalValues.steeringWheel,
      transmission: finalValues.transmission,
      drivingClassification: finalValues.drivingClassification,
      seats: finalValues.seats,
      doors: finalValues.doors,
      fuelType: finalValues.fuelType,
      engineChange: finalValues.engineChange,
      ownerBy: finalValues.ownerBy,
      repairService: finalValues.repairService,
      interval: finalValues.interval,
      running: finalValues.running,
      tireLoadType: finalValues.tireLoadType,
      bowType: finalValues.bowType,
      brakeType: finalValues.brakeType,
      liftType: finalValues.liftType,
      wagonCapacity: finalValues.wagonCapacity,
      liftWagonCapacity: finalValues.liftWagonCapacity,
      floorType: finalValues.floorType,
      listChange: finalValues.listChange,
      wagonLength: Number(this.state.wagonLength),
      wagonWidth: Number(this.state.wagonWidth),
      height: Number(this.state.height),
      volume: this.state.volume,
      attachments: (this.state.attachments || []).map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size
      })),
      frontAttachments: (this.state.frontAttachments || []).map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size
      })),
      leftAttachments: (this.state.leftAttachments || []).map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size
      })),
      rightAttachments: (this.state.rightAttachments || []).map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size
      })),
      backAttachments: (this.state.backAttachments || []).map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size
      })),
      floorAttachments: (this.state.floorAttachments || []).map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size
      })),
      transformationAttachments: (
        this.state.transformationAttachments || []
      ).map(a => ({
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size
      }))
    };
  };

  onChangeInput = e => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = Number(value);
    }

    this.setState({
      moreValues: { ...this.state.moreValues, [name]: value }
    } as any);
  };

  onChangeTrimInput = e => {
    const name = e.target.name;
    let value = e.target.value;

    if (e.target.type === 'number') {
      value = Number(value);
    }

    value = value.replace(/ /g, '');

    this.setState({
      moreValues: { ...this.state.moreValues, [name]: value }
    } as any);
  };

  onChangeWagonLength = e => {
    this.setState({ wagonLength: e.target.value });
  };

  onChangeWagonWidth = e => {
    this.setState({ wagonWidth: e.target.value });
  };

  onChangeHeigth = e => {
    this.setState({ height: e.target.value });
  };

  calculateVolume = () => {
    const { wagonLength, wagonWidth, height } = this.state;

    if (wagonLength !== 0 || wagonWidth !== 0 || height !== 0) {
      const length = wagonLength / 100;
      const width = wagonWidth / 100;
      const h = height / 100;
      return length * width * h;
    }

    return 0;
  };

  renderFormGroup = (label, props, isTrim = false) => {
    const car = this.props.car || ({} as ICar);
    const { name } = props;

    const wagons = [
      'liftType',
      'liftHeight',
      'liftWagonCapacity',
      'liftWagonCapacityValue'
    ];

    const foundWagon = wagons.find(element => element === name);

    if (
      foundWagon &&
      name !== 'listChange' &&
      this.state.listChange !== 'Yes'
    ) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl
          {...props}
          onChange={isTrim ? this.onChangeTrimInput : this.onChangeInput}
        />
      </FormGroup>
    );
  };

  renderFormSelect = (label, props, options) => {
    const { name } = props;

    const wagons = [
      'liftType',
      'liftHeight',
      'liftWagonCapacity',
      'liftWagonCapacityValue'
    ];

    const foundWagon = wagons.find(element => element === name);

    if (
      foundWagon &&
      name !== 'listChange' &&
      this.state.listChange !== 'Yes'
    ) {
      return null;
    }

    const state: any = {};

    const onChange = e => {
      state[name] = e.target.value;

      this.setState(state);
    };

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl onChange={onChange} {...props} componentClass="select">
          {generateOptionsConstants(options, true)}
        </FormControl>
      </FormGroup>
    );
  };

  onDateChange = (field, date) => {
    this.setState({
      moreValues: { ...this.state.moreValues, [field]: date }
    } as any);
  };

  renderDate = (name, formProps) => {
    return (
      <DateContainer>
        <DateControl
          {...formProps}
          required={false}
          name={name}
          value={this.state.moreValues[name]}
          onChange={this.onDateChange.bind(this, name)}
        />
      </DateContainer>
    );
  };

  onChangeAttachments = (key: any, files: any[]) => {
    this.setState(prevState => ({
      ...prevState,
      [key]: files ? files : undefined
    }));
  };

  onChangeAttachmentss = (key: any, files: any) => {
    this.setState({ ...this.state, [key]: files ? files : undefined });
  };

  updateCarCategoryValue(categoryId) {
    if (!categoryId) {
      return;
    }

    const category = this.props.carCategories.find(
      carCategories => carCategories._id === categoryId
    );

    if (!category) {
      return;
    }

    const activeSections = {
      renderMain: false,
      renderTechnicalSpecification: false,
      renderWagonInformation: false,
      renderBarrelInformation: false,
      renderVehicleImages: false,
      renderForceImformation: false
    };

    (category.collapseContent || []).map(c => (activeSections[c] = true));

    this.setState({ req: false }, () => {
      this.setState({ activeSections, req: true });
    });
  }

  onChangeContent = e => {
    this.updateCarCategoryValue(e.target.value);
  };

  renderMain = (formProps: IFormProps) => {
    const car = this.props.car || ({} as ICar);
    const { nowYear, req } = this.state;

    const isShow = this.state.activeSections.renderMain;

    if (!isShow) {
      return null;
    }

    return (
      <CollapseContent
        title={__('Ерөнхий мэдээлэл')}
        compact={true}
        open={true}
      >
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup(
              'Улсын дугаар',
              {
                ...formProps,
                name: 'plateNumber',
                value: this.state.moreValues.plateNumber || '',
                required: req
              },
              true
            )}

            {this.renderFormGroup('Арлын дугаар', {
              ...formProps,
              name: 'vinNumber',
              defaultValue: car.vinNumber || ''
            })}
            {this.renderFormGroup('Үйлдвэрлэсэн он', {
              ...formProps,
              name: 'vintageYear',
              defaultValue: car.vintageYear || nowYear,
              type: 'number',
              min: '1950',
              max: nowYear
            })}

            {this.renderFormGroup('Импортолсон он', {
              ...formProps,
              name: 'importYear',
              defaultValue: car.importYear || nowYear,
              type: 'number',
              min: 1950,
              max: nowYear
            })}

            <FormGroup>
              <ControlLabel>Оношлогоо огноо</ControlLabel>
              {this.renderDate('diagnosisDate', formProps)}
            </FormGroup>

            <FormGroup>
              <ControlLabel>Татвар огноо</ControlLabel>
              {this.renderDate('taxDate', formProps)}
            </FormGroup>

            {this.renderFormSelect(
              'Үйлдвэрлэгч',
              {
                ...formProps,
                name: 'manufacture',
                defaultValue: car.manufacture,
                required: req
              },
              MANUFACTURE_TYPES
            )}

            {this.renderFormSelect(
              'Чиргүүлийн холбоос',
              {
                ...formProps,
                name: 'trailerType',
                defaultValue: car.trailerType,
                required: req
              },
              TRAILER_TYPES
            )}
          </FormColumn>

          <FormColumn>
            {this.renderFormSelect(
              'Ангилал',
              {
                ...formProps,
                name: 'drivingClassification',
                defaultValue: car.drivingClassification,
                required: req
              },
              DRIVING_CLASSIFICATION
            )}
            {this.renderFormGroup('Модель', {
              ...formProps,
              name: 'carModel',
              defaultValue: car.carModel || ''
            })}
            {this.renderFormGroup('Марк', {
              ...formProps,
              name: 'mark',
              defaultValue: car.mark || ''
            })}
            {this.renderFormGroup('Нийт тэнхлэг', {
              ...formProps,
              name: 'totalAxis',
              defaultValue: car.totalAxis || ''
            })}
            {this.renderFormGroup('Өөрийн жин /кг/', {
              ...formProps,
              name: 'weight',
              defaultValue: car.weight || 0,
              type: 'number'
            })}
            {this.renderFormSelect(
              'Дугуйн даацын төрөл',
              {
                ...formProps,
                name: 'tireLoadType',
                defaultValue: car.tireLoadType,
                required: req
              },
              TIRE_LOAD_TYPES
            )}

            {this.renderFormSelect(
              'Нумны төрөл',
              {
                ...formProps,
                name: 'bowType',
                defaultValue: car.bowType,
                required: req
              },
              BOW_TYPES
            )}

            {this.renderFormSelect(
              'Тоормосны төрөл',
              {
                ...formProps,
                name: 'brakeType',
                defaultValue: car.brakeType,
                required: req
              },
              BRAKE_TYPES
            )}
          </FormColumn>

          <FormColumn>
            {this.renderFormGroup('Гэрчилгээний Төрөл', {
              ...formProps,
              name: 'type',
              defaultValue: car.type || ''
            })}

            {this.renderFormGroup('Өнгө', {
              ...formProps,
              name: 'color',
              defaultValue: car.color || '',
              required: req
            })}

            {this.renderFormSelect(
              'Эзэмшигч',
              {
                ...formProps,
                name: 'ownerBy',
                defaultValue: car.ownerBy
              },
              OWNER_TYPES
            )}

            {this.renderFormSelect(
              'Засвар үйлчилгээ',
              {
                ...formProps,
                name: 'repairService',
                defaultValue: car.repairService,
                required: req
              },
              REPAIR_SERVICE_TYPES
            )}

            {this.renderFormSelect(
              'Интервал',
              {
                ...formProps,
                name: 'interval',
                defaultValue: car.interval
              },
              INTERVAL_TYPES
            )}

            {this.renderFormGroup('Интервал утга', {
              ...formProps,
              name: 'intervalValue',
              defaultValue: car.intervalValue || ''
            })}

            {this.renderFormSelect(
              'Гүйлтийн төрөл',
              {
                ...formProps,
                name: 'running',
                defaultValue: car.running
              },
              RUNNING_TYPES
            )}

            {this.renderFormGroup('Гүйлтийн утга', {
              ...formProps,
              name: 'runningValue',
              defaultValue: car.runningValue || 0,
              type: 'number'
            })}
          </FormColumn>
        </FormWrapper>
        <FormGroup>
          <ControlLabel>Тодорхойлолт</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={car.description}
          />
        </FormGroup>
      </CollapseContent>
    );
  };

  renderTechnicalSpecification = (formProps: IFormProps) => {
    const car = this.props.car || ({} as ICar);
    const { req } = this.state;

    const isShow = this.state.activeSections.renderTechnicalSpecification;

    if (!isShow) {
      return null;
    }

    return (
      <CollapseContent title={__('Техник үзүүлэлт')} compact={true} open={true}>
        <FormWrapper>
          <FormColumn>
            {this.renderFormSelect(
              'Жолооны хүрд',
              {
                ...formProps,
                name: 'steeringWheel',
                defaultValue: car.steeringWheel,
                required: req
              },
              CAR_STEERING_WHEEL
            )}

            {this.renderFormSelect(
              'Хөдөлгүүр сольсон',
              {
                ...formProps,
                name: 'engineChange',
                defaultValue: car.engineChange,
                required: req
              },
              ENGINE_CHANGE
            )}

            {this.renderFormGroup(
              'Хөдөлгүүрийн багтаамж /сс/',
              {
                ...formProps,
                name: 'engineCapacity',
                value: this.state.moreValues.engineCapacity || ''
              },
              true
            )}
          </FormColumn>

          <FormColumn>
            {this.renderFormSelect(
              'Хурдны хайрцаг',
              {
                ...formProps,
                name: 'transmission',
                defaultValue: car.transmission,
                required: req
              },
              TRANSMISSION_TYPES
            )}

            {this.renderFormSelect(
              'Хаалганы тоо',
              {
                ...formProps,
                name: 'doors',
                defaultValue: car.doors,
                required: req
              },
              DOOR_CHANGE
            )}

            {this.renderFormSelect(
              'Суудлын тоо',
              {
                ...formProps,
                name: 'seats',
                defaultValue: car.seats,
                required: req
              },
              SEAT_CHANGE
            )}
          </FormColumn>
          <FormColumn>
            {this.renderFormSelect(
              'Шатахуун төрөл',
              {
                ...formProps,
                name: 'fuelType',
                defaultValue: car.fuelType,
                required: req
              },
              CAR_FUEL_TYPES
            )}

            {this.renderFormGroup('Залуурын тэнхлэг', {
              ...formProps,
              name: 'steeringAxis',
              defaultValue: car.steeringAxis || ''
            })}

            {this.renderFormGroup('Зүтгэх тэнхлэг', {
              ...formProps,
              name: 'forceAxis',
              defaultValue: car.forceAxis || ''
            })}
          </FormColumn>
        </FormWrapper>
      </CollapseContent>
    );
  };

  renderWagonInformation = (formProps: IFormProps) => {
    const car = this.props.car || ({} as ICar);
    const { req } = this.state;

    const isShow = this.state.activeSections.renderWagonInformation;

    if (!isShow) {
      return null;
    }

    return (
      <CollapseContent
        title={__('Тэвшний мэдээлэл')}
        compact={true}
        open={true}
      >
        <FormWrapper>
          <FormColumn>
            {this.renderFormSelect(
              'Даац багтаамж',
              {
                ...formProps,
                name: 'wagonCapacity',
                defaultValue: car.wagonCapacity
              },
              WAGON_CAPACITY_TYPES
            )}

            {this.renderFormGroup('Даац багтаамж утга', {
              ...formProps,
              name: 'wagonCapacityValue',
              defaultValue: car.wagonCapacityValue || ''
            })}

            {this.renderFormSelect(
              'Шалны төрөл',
              {
                ...formProps,
                name: 'floorType',
                defaultValue: car.floorType,
                required: req
              },
              FLOOR_TYPE
            )}

            {this.renderFormGroup('Порчекны өндөр /см/', {
              ...formProps,
              name: 'porchekHeight',
              defaultValue: car.porchekHeight || 0,
              type: 'number'
            })}
          </FormColumn>

          <FormColumn>
            {this.renderFormGroup('Тэвш Урт /см/', {
              ...formProps,
              name: 'wagonLength',
              defaultValue: car.wagonLength || 0,
              type: 'number'
            })}

            {this.renderFormGroup('Тэвш Өргөн /см/', {
              ...formProps,
              name: 'wagonWidth',
              defaultValue: car.wagonWidth || 0,
              type: 'number'
            })}

            {this.renderFormGroup('Ачааны дундаж өндөр /см/', {
              ...formProps,
              name: 'height',
              defaultValue: car.height || 0,
              type: 'number'
            })}

            {this.renderFormGroup('Эзлэхүүн /м3/', {
              ...formProps,
              name: 'volume',
              type: 'number'
            })}
          </FormColumn>

          <FormColumn>
            {this.renderFormSelect(
              'Өргөдөг эсэх',
              {
                ...formProps,
                name: 'listChange',
                defaultValue: car.listChange
              },
              LIFT_CHANGE
            )}
            {this.renderFormSelect(
              'Өргөлтийн төрөл',
              {
                ...formProps,
                name: 'liftType',
                defaultValue: car.liftType,
                required: req
              },
              LIFT_TYPE
            )}

            {this.renderFormGroup('Өргөлтийн өндөр /см/', {
              ...formProps,
              name: 'liftHeight',
              defaultValue: car.liftHeight || 0,
              type: 'number'
            })}

            {this.renderFormSelect(
              'Өргөлт Даац багтаамж',
              {
                ...formProps,
                name: 'liftWagonCapacity',
                defaultValue: car.liftWagonCapacity
              },
              LIFT_WAGON_CAPACITY_TYPES
            )}

            {this.renderFormGroup('Өргөлт Даац багтаамж утга', {
              ...formProps,
              name: 'liftWagonCapacityValue',
              defaultValue: car.liftWagonCapacityValue || ''
            })}
          </FormColumn>
        </FormWrapper>
      </CollapseContent>
    );
  };

  renderBarrelInformation = (formProps: IFormProps) => {
    const car = this.props.car || ({} as ICar);
    if (!this.state.activeSections.renderBarrelInformation) {
      return null;
    }

    return (
      <CollapseContent title={__('Торхны мэдээлэл')} compact={true} open={true}>
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('Торхны дугаар', {
              ...formProps,
              name: 'barrelNumber',
              defaultValue: car.barrelNumber || ''
            })}

            {this.renderFormGroup('Торхны Багтаамж /л/', {
              ...formProps,
              name: 'capacityL',
              defaultValue: car.capacityL || 0,
              type: 'number',
              required: true
            })}

            {this.renderFormGroup('Насосны чадал /л/мин/', {
              ...formProps,
              name: 'pumpCapacity',
              defaultValue: car.pumpCapacity || ''
            })}

            <FormGroup>
              <ControlLabel>Тоолуурын баталгаа</ControlLabel>
              {this.renderDate('meterWarranty', formProps)}
            </FormGroup>
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Торх #1', {
              ...formProps,
              name: 'barrel1',
              defaultValue: car.barrel1 || 0,
              type: 'number'
            })}
            {this.renderFormGroup('Торх #2', {
              ...formProps,
              name: 'barrel2',
              defaultValue: car.barrel2 || 0,
              type: 'number'
            })}
            {this.renderFormGroup('Торх #3', {
              ...formProps,
              name: 'barrel3',
              defaultValue: car.barrel3 || 0,
              type: 'number'
            })}
            {this.renderFormGroup('Торх #4', {
              ...formProps,
              name: 'barrel4',
              defaultValue: car.barrel4 || 0,
              type: 'number'
            })}
            {this.renderFormGroup('Торх #5', {
              ...formProps,
              name: 'barrel5',
              defaultValue: car.barrel5 || 0,
              type: 'number'
            })}
            {this.renderFormGroup('Торх #6', {
              ...formProps,
              name: 'barrel6',
              defaultValue: car.barrel6 || 0,
              type: 'number'
            })}
            {this.renderFormGroup('Торх #7', {
              ...formProps,
              name: 'barrel7',
              defaultValue: car.barrel7 || 0,
              type: 'number'
            })}
            {this.renderFormGroup('Торх #8', {
              ...formProps,
              name: 'barrel8',
              defaultValue: car.barrel8 || 0,
              type: 'number'
            })}
          </FormColumn>
        </FormWrapper>
      </CollapseContent>
    );
  };

  renderVehicleImages = () => {
    const car = this.props.car || ({} as ICar);
    if (!this.state.activeSections.renderVehicleImages) {
      return null;
    }

    const attachments =
      (car.attachments && extractAttachment(car.attachments)) || [];

    const frontAttachments =
      (car.frontAttachments && extractAttachment(car.frontAttachments)) || [];

    const leftAttachments =
      (car.leftAttachments && extractAttachment(car.leftAttachments)) || [];

    const rightAttachments =
      (car.rightAttachments && extractAttachment(car.rightAttachments)) || [];

    const backAttachments =
      (car.backAttachments && extractAttachment(car.backAttachments)) || [];

    const floorAttachments =
      (car.floorAttachments && extractAttachment(car.floorAttachments)) || [];

    const transformationAttachments =
      (car.transformationAttachments &&
        extractAttachment(car.transformationAttachments)) ||
      [];

    return (
      <CollapseContent
        title={__('Тээврийн хэрэгслийн зураг')}
        compact={true}
        open={true}
      >
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Гэрчилгээний зураг</ControlLabel>
              <Uploader
                defaultFileList={attachments}
                onChange={e => this.onChangeAttachments('attachments', e)}
                multiple={true}
                single={false}
                limit={6}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>Урд тал зураг</ControlLabel>
              <Uploader
                defaultFileList={frontAttachments}
                onChange={e => this.onChangeAttachmentss('frontAttachments', e)}
                multiple={false}
                single={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Зүүн тал зураг</ControlLabel>
              <Uploader
                defaultFileList={leftAttachments}
                onChange={e => this.onChangeAttachmentss('leftAttachments', e)}
                multiple={false}
                single={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Баруун тал зураг</ControlLabel>
              <Uploader
                defaultFileList={rightAttachments}
                onChange={e => this.onChangeAttachmentss('rightAttachments', e)}
                multiple={false}
                single={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Хойд тал зураг</ControlLabel>
              <Uploader
                defaultFileList={backAttachments}
                onChange={e => this.onChangeAttachmentss('backAttachments', e)}
                multiple={false}
                single={true}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>Шалны зураг</ControlLabel>
              <Uploader
                defaultFileList={floorAttachments}
                onChange={e => this.onChangeAttachments('floorAttachments', e)}
                multiple={true}
                single={false}
                limit={6}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>Тээвэрлэлтийн зураг</ControlLabel>
              <Uploader
                defaultFileList={transformationAttachments}
                onChange={e =>
                  this.onChangeAttachments('transformationAttachments', e)
                }
                multiple={true}
                single={false}
                limit={6}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </CollapseContent>
    );
  };

  renderForceImformation = (formProps: IFormProps) => {
    const car = this.props.car || ({} as ICar);
    if (!this.state.activeSections.renderForceImformation) {
      return null;
    }

    return (
      <CollapseContent
        title={__('Зүтгэх хүчний мэдээлэл')}
        compact={true}
        open={true}
      >
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('Даац багтаамж', {
              ...formProps,
              name: 'forceCapacityValue',
              defaultValue: car.forceCapacityValue || 0,
              type: 'number'
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Зүтгэх хүч', {
              ...formProps,
              name: 'forceValue',
              defaultValue: car.forceValue || 0,
              type: 'number'
            })}
          </FormColumn>
        </FormWrapper>
      </CollapseContent>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const car = this.props.car || ({} as ICar);
    const { closeModal, renderButton, carCategories } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Ерөнхий ангилал</ControlLabel>
            <FormControl
              {...formProps}
              name="categoryId"
              componentClass="select"
              defaultValue={car.categoryId}
              required={true}
              onChange={this.onChangeContent}
            >
              {generateCategoryOptions(carCategories, '', true)}
            </FormControl>
          </FormGroup>

          {this.renderMain(formProps)}
          {this.renderTechnicalSpecification(formProps)}
          {this.renderWagonInformation(formProps)}
          {this.renderBarrelInformation(formProps)}
          {this.renderVehicleImages()}
          {this.renderForceImformation(formProps)}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'car',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.car
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default CarForm;
