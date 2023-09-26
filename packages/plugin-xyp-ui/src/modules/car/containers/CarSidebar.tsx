import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import CarSidebar from '../components/CarSidebar';
import { mutations, queries } from '../graphql';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  id: string;
  car: any;
};
const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  // TODO: remove
  if (pkey) {
    options.type = String;
    options.default = () => 'randomId';
  }

  return options;
};
const carFields = {
  plateNumber: field({
    type: String,
    label: 'Plate number',
    index: true,
    optional: true
  }),
  vinNumber: field({
    type: String,
    label: 'VIN number',
    optional: true,
    index: true
  }),
  color: field({ type: String, label: 'Color', optional: true }),
  intervalValue: field({
    type: String,
    label: 'Interval value',
    optional: true
  }),
  carCategoryId: field({ type: String, label: 'Category', index: true }),
  parentCarCategoryId: field({
    type: String,
    label: 'Parent category',
    index: true
  }),

  vintageYear: field({
    type: Number,
    label: 'Vintage year',
    optional: true,
    default: new Date().getFullYear()
  }),
  importYear: field({
    type: Number,
    label: 'Imported year',
    optional: true,
    default: new Date().getFullYear()
  }),

  diagnosisDate: field({
    type: Date,
    optional: true,
    label: 'Оношлогоо огноо'
  }),
  taxDate: field({
    type: Date,
    optional: true,
    label: 'Татвар огноо'
  }),

  manufacture: field({
    type: String,

    default: '',
    optional: true,
    label: 'Manufacture',
    esType: 'keyword'
  }),

  steeringWheel: field({
    type: String,

    default: 'left',
    optional: true,
    label: 'Status',
    esType: 'keyword',

    index: true
  }),

  transmission: field({
    type: String,

    default: '',
    optional: true,
    label: 'Transmission',
    esType: 'keyword'
  }),

  drivingClassification: field({
    type: String,

    default: '',
    optional: true,
    label: 'Driving classification',
    esType: 'keyword'
  }),

  carModel: field({
    type: String,
    optional: true,
    label: 'Car model'
  }),

  mark: field({
    type: String,
    optional: true,
    label: 'Mark'
  }),

  doors: field({
    type: String,

    default: '',
    optional: true,
    label: 'Door',
    esType: 'keyword'
  }),

  seats: field({
    type: String,
    default: '',
    optional: true,
    label: 'Seat',
    esType: 'keyword'
  }),

  fuelType: field({
    type: String,

    default: '',
    optional: true,
    label: 'Brand',
    esType: 'keyword'
  }),

  engineCapacity: field({
    type: String,
    optional: true,
    label: 'Хөдөлгүүрийн багтаамж'
  }),

  engineChange: field({
    type: String,

    default: '',
    optional: true,
    label: 'Engine change',
    esType: 'keyword'
  }),

  listChange: field({
    type: String,

    default: '',
    optional: true,
    label: 'Lift change',
    esType: 'keyword'
  }),

  type: field({
    type: String,
    optional: true,
    label: 'Type'
  }),

  ownerBy: field({
    type: String,

    default: '',
    optional: true,
    label: 'Owner',
    esType: 'keyword'
  }),

  repairService: field({
    type: String,

    default: '',
    optional: true,
    label: 'Repair service',
    esType: 'keyword'
  }),

  interval: field({
    type: [String],

    default: '',
    optional: true,
    label: 'Interval type',
    esType: 'keyword'
  }),

  running: field({
    type: String,

    default: '',
    optional: true,
    label: 'Running',
    esType: 'keyword'
  }),

  trailerType: field({
    type: String,

    default: '',
    optional: true,
    label: 'Trailer type',
    esType: 'keyword'
  }),

  tireLoadType: field({
    type: String,

    default: '',
    optional: true,
    label: 'Tire load type',
    esType: 'keyword'
  }),

  valve: field({
    type: String,

    default: '',
    optional: true,
    label: 'Valve',
    esType: 'keyword'
  }),

  bowType: field({
    type: String,

    default: '',
    optional: true,
    label: 'Bow type',
    esType: 'keyword'
  }),

  brakeType: field({
    type: String,

    default: '',
    optional: true,
    label: 'Brake type',
    esType: 'keyword'
  }),

  liftType: field({
    type: String,

    default: '',
    optional: true,
    label: 'Lift type',
    esType: 'keyword'
  }),

  liftWagonCapacity: field({
    type: [String],

    default: '',
    optional: true,
    label: 'Өргөлт Даац багтаамж',
    esType: 'keyword'
  }),

  liftWagonCapacityValue: field({
    type: String,
    optional: true,
    label: 'Өргөлт Даац багтаамж'
  }),

  wagonCapacity: field({
    type: [String],

    default: '',
    optional: true,
    label: 'Даац багтаамж',
    esType: 'keyword'
  }),

  wagonCapacityValue: field({
    type: String,
    optional: true,
    label: 'Даац багтаамж утга'
  }),

  totalAxis: field({
    type: String,
    optional: true,
    label: 'Нийт тэнхлэг'
  }),

  steeringAxis: field({
    type: String,
    optional: true,
    label: 'Залуурын тэнхлэг'
  }),

  forceAxis: field({
    type: String,
    optional: true,
    label: 'Зүтгэх тэнхлэг'
  }),

  floorType: field({
    type: String,

    default: '',
    optional: true,
    label: 'Floor type',
    esType: 'keyword'
  }),

  pumpCapacity: field({
    type: String,
    optional: true,
    label: 'Насосны чадал /л/мин/'
  }),

  barrelNumber: field({
    type: String,
    optional: true,
    label: 'Торхны дугаар'
  }),

  status: field({
    type: String,

    default: 'Active',
    optional: true,
    label: 'Status',
    esType: 'keyword',

    index: true
  }),

  description: field({
    type: String,
    optional: true,
    label: 'Description'
  }),

  // Merged car ids
  mergedIds: field({
    type: [String],
    optional: true,
    label: 'Merged cars'
  }),

  searchText: field({ type: String, optional: true, index: true }),

  barrelWarranty: field({
    type: Date,
    optional: true,
    label: 'Торхны баталгаа'
  }),

  liftHeight: field({
    type: Number,
    optional: true,
    label: 'Өргөлтийн өндөр'
  }),

  height: field({
    type: Number,
    optional: true,
    label: 'Ачилтын өндөр'
  }),

  weight: field({ type: Number, optional: true, label: 'Жин' }),

  wagonLength: field({
    type: Number,
    optional: true,
    label: 'Тэвш Урт /см/'
  }),
  wagonWidth: field({
    type: Number,
    optional: true,
    label: 'Тэвш Өргөн /см/'
  }),

  porchekHeight: field({
    type: Number,
    optional: true,
    label: 'Порчекны өндөр'
  }),
  runningValue: field({
    type: Number,
    optional: true,
    label: 'Гүйлтийн төрөл'
  }),
  volume: field({
    type: Number,
    optional: true,
    label: 'Эзлэхүүн /м3/'
  }),
  capacityL: field({ type: Number, label: 'Багтаамж /л/' }),
  barrel1: field({ type: Number, optional: true, label: 'Торх #1' }),
  barrel2: field({ type: Number, optional: true, label: 'Торх #2' }),
  barrel3: field({ type: Number, optional: true, label: 'Торх #3' }),
  barrel4: field({ type: Number, optional: true, label: 'Торх #4' }),
  barrel5: field({ type: Number, optional: true, label: 'Торх #5' }),
  barrel6: field({ type: Number, optional: true, label: 'Торх #6' }),
  barrel7: field({ type: Number, optional: true, label: 'Торх #7' }),
  barrel8: field({ type: Number, optional: true, label: 'Торх #8' }),
  forceCapacityValue: field({
    type: Number,
    optional: true,
    label: 'Даац багтаамж'
  }),
  forceValue: field({
    type: Number,
    optional: true,
    label: 'Зүтгэх хүч'
  })
};
const carFieldsKV: any[] = [];
for (const [key, value] of Object.entries(carFields)) {
  carFieldsKV.push({ value: key, label: value.label });
}

export const removeTypeNameFromGQLResult = (result: Record<string, any>) => {
  return JSON.parse(
    JSON.stringify(result, (key, value) => {
      if (key === '__typename') return;
      return value;
    })
  );
};

const CarSidebarContainer = (props: Props) => {
  const detail = useQuery(gql(queries.detail), {
    variables: { contentTypeId: props.id, contentType: 'contacts:customers' },
    fetchPolicy: 'network-only'
  });

  const carQuery = useQuery(gql(queries.carDetail), {
    variables: { _id: props.car._id }
  });

  const serviceChoosen = useQuery(gql(queries.serviceChoosen), {
    fetchPolicy: 'network-only'
  });

  const xypServiceList = useQuery(gql(queries.xypServiceList), {});
  const [xypRequest] = useLazyQuery(gql(queries.xypRequest), {
    fetchPolicy: 'network-only'
  });

  const [add] = useMutation(gql(mutations.add));
  const [edit] = useMutation(gql(mutations.add));
  const [carsEdit] = useMutation(gql(mutations.carsEdit));

  const fetchData = (serviceName: string, params: any, paramsOutput: any) => {
    console.log(params);
    console.log(paramsOutput);

    // params = regnum : "LRg7bBkPh3znA3Ecz"
    // key = xyp систем рүү service дуудах фараметрийн нэр // etc regnum
    // value = fieldsGroup field string id бөгөөд fieldsgroupээс шүүж, contacts-ын фиэлд нэрийг олно,
    const _in: any[] = [];
    const car = carQuery.data.carDetail as any;
    let xypParams = {};
    for (const [key, value] of Object.entries(params)) {
      let fieldName = value as string;
      xypParams[key] = fieldName in car ? car[fieldName] : '';
    }

    xypRequest({
      variables: {
        wsOperationName: serviceName,
        params: xypParams
      }
    }).then(({ data }) => {
      let list: { field: string; value: any }[] = [];
      if (data?.xypRequest?.return?.resultCode === 0) {
        for (const [key, value] of Object.entries(
          data?.xypRequest?.return?.response
        )) {
          const obj = { field: key, value: value };
          list.push(obj);
        }
        const response = data?.xypRequest?.return?.response;
        const editCarParams = {};
        for (const [key, value] of Object.entries(paramsOutput)) {
          let fieldName = value as string;
          editCarParams[fieldName] = response[key];
        }

        let fullParams = Object.assign({}, car, editCarParams);

        if (true) {
          carsEdit({
            variables: {
              _id: props.car._id,
              ...removeTypeNameFromGQLResult(fullParams)
            }
          })
            .then(({ data }) => {
              if (data.carsEdit?._id) {
                Alert.success('Successfully updated a car');
              } else {
                Alert.error('error');
              }
            })
            .catch(e => console.log(e));
        }
        // if (!detail?.data?.xypDataDetail) {
        //   add({
        //     variables: {
        //       contentType: 'contacts:customers',
        //       contentTypeId: props.id,
        //       data: list,
        //     },
        //   }).then(({ data }) => {
        //     detail.refetch();
        //     if (data.xypDataAdd?._id) {
        //       Alert.success('Successfully added an item');
        //     } else {
        //       Alert.error('error');
        //     }
        //   });
        // } else {
        //   Alert.success('Successfully Edited an item');
        // }
      } else {
        Alert.error(`${data?.xypRequest?.return?.resultMessage}`);
      }
    });
  };

  if (detail.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    xypdata: detail?.data?.xypDataDetail,
    // customer: customer.data?.customerDetail,
    loading: detail.loading || xypServiceList.loading,
    error: xypServiceList?.error?.name || '',
    carFields: carFieldsKV,
    refetch: detail.refetch,
    xypServiceList: xypServiceList?.data?.xypServiceList || [],
    serviceChoosenLoading: serviceChoosen.loading,
    list: serviceChoosen?.data?.xypServiceListChoosen,
    fetchData: fetchData
  };

  return <CarSidebar {...updatedProps} />;
};

export default CarSidebarContainer;
