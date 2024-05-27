import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import queryString from 'query-string';

import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import Uploader from '@erxes/ui/src/components/Uploader';

import { FlexRow } from '../styles';
import { ExpandWrapper } from '@erxes/ui-settings/src/styles';
import { Alert, __ } from '@erxes/ui/src/utils';
import {
  School,
  University,
  Soh,
  Khoroo,
  EnvInfo,
  Common,
  DistrictTown
} from '../types';
import Locations from './Locations';

type Props = {
  item: any;
  save: any;
  closeModal: () => void;
};

type State = {
  name: String;
  type: String;
  kindergardenData: School;
  schoolData: School;
  universityData: University;
  sohData: Soh;
  khorooData: Khoroo;
  envinfoData: EnvInfo;
  parkingData: Common;
  busStopData: Common;
  hospitalData: Common;
  pharmacyData: Common;
  districtTownData: DistrictTown;
  locationValues: [Number];
};

class Form extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);

    const {
      name,
      type,
      schoolData,
      kindergardenData,
      universityData,
      sohData,
      khorooData,
      envinfoData,
      parkingData,
      busStopData,
      hospitalData,
      pharmacyData,
      districtTownData
    } = props.item || {};

    this.state = {
      locationValues: [,],
      name: name,
      type: type,
      schoolData: schoolData,
      kindergardenData: kindergardenData,
      universityData: universityData,
      sohData: sohData,
      khorooData: khorooData,
      envinfoData: envinfoData,
      parkingData: parkingData,
      busStopData: busStopData,
      hospitalData: hospitalData,
      pharmacyData: pharmacyData,
      districtTownData: districtTownData
    };
  }

  save = () => {
    const doc = {};
    for (const key in this.state) {
      if (this.state[key]) {
        doc[key] = this.state[key];
      }
    }
    const { save } = this.props;
    if (doc) save(doc);
    else Alert.error('buglunu uu');

    this.props.closeModal();
  };

  remove = () => {
    const { save } = this.props;
    this.remove();
  };

  renderPopUpContent() {
    const {
      kindergardenData,
      schoolData,
      universityData,
      sohData,
      khorooData,
      envinfoData,
      parkingData,
      busStopData,
      hospitalData,
      pharmacyData,
      districtTownData
    } = this.state;
    let content;
    const queryParams = queryString.parse(location.search);

    const onChangeLocations = (name, data) => {
      this.setState({
        [name]: data
      });
    };

    switch (queryParams.type) {
      case 'kindergarden':
        const onChangeKindergardenInput = (e, key) => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          this.setState({
            kindergardenData: {
              ...this.state.kindergardenData,

              [key]: (e.target as HTMLInputElement).value
            }
          });
        };

        content = (
          <>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                value={
                  kindergardenData && kindergardenData.description
                    ? kindergardenData.description
                    : ''
                }
                type={'text'}
                componentClass="textarea"
                name="remainder"
                onChange={e => onChangeKindergardenInput(e, 'description')}
                required={false}
              ></FormControl>
            </FormGroup>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дүүрэг</ControlLabel>
                  <FormControl
                    value={
                      kindergardenData && kindergardenData.district
                        ? kindergardenData.district
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeKindergardenInput(e, 'district')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хороо</ControlLabel>
                  <FormControl
                    value={
                      kindergardenData && kindergardenData.khoroo
                        ? kindergardenData.khoroo
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeKindergardenInput(e, 'khoroo')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <Locations
              name="kindergardenData"
              data={this.state.kindergardenData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'school':
        const onChangeSchoolInput = (e, key) => {
          const queryParams = queryString.parse(location.search);
          this.setState({ type: queryParams.type });

          this.setState({
            schoolData: {
              ...this.state.schoolData,

              [key]: (e.target as HTMLInputElement).value
            }
          });
        };

        const latitude =
          schoolData &&
          schoolData.locationValue &&
          schoolData.locationValue.coordinates &&
          schoolData.locationValue.coordinates.length > 0 &&
          schoolData.locationValue.coordinates[0];
        const longitude =
          schoolData &&
          schoolData.locationValue &&
          schoolData.locationValue.coordinates &&
          schoolData.locationValue.coordinates.length > 1 &&
          schoolData.locationValue.coordinates[1];

        content = (
          <>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                value={
                  schoolData && schoolData.description
                    ? schoolData.description
                    : ''
                }
                type="text"
                componentClass="textarea"
                onChange={e => onChangeSchoolInput(e, 'description')}
                required={false}
              ></FormControl>
            </FormGroup>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дүүрэг</ControlLabel>
                  <FormControl
                    value={
                      schoolData && schoolData.district
                        ? schoolData.district
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeSchoolInput(e, 'district')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хороо</ControlLabel>
                  <FormControl
                    value={
                      schoolData && schoolData.khoroo ? schoolData.khoroo : ''
                    }
                    type="text"
                    onChange={e => onChangeSchoolInput(e, 'khoroo')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <Locations
              name="schoolData"
              data={this.state.schoolData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'university':
        const onChangeUniversityDescInput = e => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          this.setState({
            universityData: {
              ...this.state.universityData,

              description: (e.target as HTMLInputElement).value
            }
          });
        };

        content = (
          <>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                value={
                  universityData && universityData.description
                    ? universityData.description
                    : ''
                }
                type="text"
                componentClass="textarea"
                onChange={onChangeUniversityDescInput}
                required={false}
              ></FormControl>
            </FormGroup>
            <Locations
              name="universityData"
              data={this.state.universityData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'soh':
        const onChangeSohInput = (e, key) => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          this.setState({
            sohData: {
              ...this.state.sohData,

              [key]: (e.target as HTMLInputElement).value
            }
          });
        };
        content = (
          <>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дулаан</ControlLabel>
                  <FormControl
                    value={
                      sohData && sohData.thermality ? sohData.thermality : ''
                    }
                    type="text"
                    onChange={e => onChangeSohInput(e, 'thermality')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Цахилгаан</ControlLabel>
                  <FormControl
                    value={
                      sohData && sohData.electricity ? sohData.electricity : ''
                    }
                    type="text"
                    onChange={e => onChangeSohInput(e, 'electricity')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Харуул хамгаалалт</ControlLabel>
                  <FormControl
                    value={sohData && sohData.security ? sohData.security : ''}
                    type="text"
                    onChange={e => onChangeSohInput(e, 'security')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Интернэт, кабель</ControlLabel>
                  <FormControl
                    value={sohData && sohData.cable ? sohData.cable : ''}
                    type="text"
                    onChange={e => onChangeSohInput(e, 'cable')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
          </>
        );
        break;
      case 'khoroo':
        const onChangeKhorooSexInput = (e, key) => {
          let value: string | number = (e.target as HTMLInputElement).value;
          let ages;
          if (this.state.khorooData) {
            ages = this.state.khorooData.sex;
          }
          if (e.target.type === 'number') {
            value = Number(value);
            if (value > 100) value = 100;
          }
          this.setState({
            khorooData: {
              ...this.state.khorooData,
              sex: {
                ...ages,
                [key]: value
              }
            }
          });
        };
        const onChangeKhorooageGroupInput = (e, key) => {
          let value: string | number = (e.target as HTMLInputElement).value;
          let ages;
          if (this.state.khorooData) {
            ages = this.state.khorooData.ageGroup;
          }
          if (e.target.type === 'number') {
            value = Number(value);
            if (value > 100) value = 100;
          }
          this.setState({
            khorooData: {
              ...this.state.khorooData,
              ageGroup: {
                ...ages,
                [key]: value
              }
            }
          });
        };

        const onChangeKhorooInput = (e, key) => {
          const queryParams = queryString.parse(location.search);
          this.setState({ type: queryParams.type });
          let value: string | number = (e.target as HTMLInputElement).value;
          if (e.target.type === 'number') {
            value = Number(value);
            if (value > 100) value = 100;
          }

          this.setState({
            khorooData: {
              ...this.state.khorooData,

              [key]: value
            }
          });
        };

        content = (
          <>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хорооны дугаар</ControlLabel>
                  <FormControl
                    value={
                      khorooData && khorooData.khorooNumber
                        ? khorooData.khorooNumber
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeKhorooInput(e, 'khorooNumber')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Зай</ControlLabel>
                  <FormControl
                    value={
                      khorooData && khorooData.distance
                        ? khorooData.distance
                        : '' || ''
                    }
                    type="text"
                    onChange={e => onChangeKhorooInput(e, 'distance')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хаяг</ControlLabel>
                  <FormControl
                    value={
                      khorooData && khorooData.address ? khorooData.address : ''
                    }
                    type="text"
                    onChange={e => onChangeKhorooInput(e, 'address')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Утасны дугаар</ControlLabel>
                  <FormControl
                    value={
                      khorooData && khorooData.phoneNumber
                        ? khorooData.phoneNumber
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeKhorooInput(e, 'phoneNumber')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Өрхийн эмнэлэг</ControlLabel>
                  <FormControl
                    value={
                      khorooData && khorooData.hospital
                        ? khorooData.hospital
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeKhorooInput(e, 'hospital')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Насны бүлэглэл (%)</ControlLabel>
                  <FormControl
                    value={
                      khorooData &&
                      khorooData.ageGroup &&
                      khorooData.ageGroup.genz
                        ? khorooData.ageGroup.genz
                        : ''
                    }
                    placeholder="20-с дээш"
                    type="number"
                    onChange={e => onChangeKhorooageGroupInput(e, 'genz')}
                    required={false}
                  ></FormControl>
                  <FormControl
                    value={
                      khorooData &&
                      khorooData.ageGroup &&
                      khorooData.ageGroup.millennials
                        ? khorooData.ageGroup.millennials
                        : ''
                    }
                    placeholder="20-39"
                    type="number"
                    onChange={e =>
                      onChangeKhorooageGroupInput(e, 'millennials')
                    }
                    required={false}
                  ></FormControl>
                  <FormControl
                    value={
                      khorooData &&
                      khorooData.ageGroup &&
                      khorooData.ageGroup.genx
                        ? khorooData.ageGroup.genx
                        : ''
                    }
                    placeholder="40-59"
                    type="number"
                    onChange={e => onChangeKhorooageGroupInput(e, 'genx')}
                    required={false}
                  ></FormControl>
                  <FormControl
                    value={
                      khorooData &&
                      khorooData.ageGroup &&
                      khorooData.ageGroup.boomers
                        ? khorooData.ageGroup.boomers
                        : ''
                    }
                    placeholder="+60"
                    type="number"
                    onChange={e => onChangeKhorooageGroupInput(e, 'boomers')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>хүйс (%)</ControlLabel>
                  <FormControl
                    value={
                      khorooData && khorooData.sex && khorooData.sex.male
                        ? khorooData.sex.male
                        : ''
                    }
                    placeholder="эр"
                    type="number"
                    onChange={e => onChangeKhorooSexInput(e, 'male')}
                    required={false}
                  ></FormControl>
                  <FormControl
                    value={
                      khorooData && khorooData.sex && khorooData.sex.female
                        ? khorooData.sex.female
                        : ''
                    }
                    placeholder="эм"
                    type="number"
                    onChange={e => onChangeKhorooSexInput(e, 'female')}
                    required={false}
                  ></FormControl>
                  <br />
                  <ControlLabel>Орон сууцанд амьдардаг өрх (%)</ControlLabel>
                  <FormControl
                    value={
                      khorooData &&
                      khorooData.aptHouseholder &&
                      khorooData.aptHouseholder
                        ? khorooData.aptHouseholder
                        : ''
                    }
                    placeholder="өрх"
                    type="number"
                    onChange={e => onChangeKhorooInput(e, 'aptHouseholder')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <Locations
              name="khorooData"
              data={this.state.khorooData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'hospital':
        const onChangeHospitalInput = (e, key) => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          this.setState({
            hospitalData: {
              ...this.state.hospitalData,

              [key]: (e.target as HTMLInputElement).value
            }
          });
        };
        content = (
          <>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дүүрэг</ControlLabel>
                  <FormControl
                    value={
                      hospitalData && hospitalData.district
                        ? hospitalData.district
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeHospitalInput(e, 'district')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хороо</ControlLabel>
                  <FormControl
                    value={
                      hospitalData && hospitalData.khoroo
                        ? hospitalData.khoroo
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeHospitalInput(e, 'khoroo')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <Locations
              name="hospitalData"
              data={this.state.hospitalData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'busStop':
        const onChangeBusStopInput = (e, key) => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          this.setState({
            busStopData: {
              ...this.state.busStopData,

              [key]: (e.target as HTMLInputElement).value
            }
          });
        };
        content = (
          <>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дүүрэг</ControlLabel>
                  <FormControl
                    value={
                      busStopData && busStopData.district
                        ? busStopData.district
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeBusStopInput(e, 'district')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хороо</ControlLabel>
                  <FormControl
                    value={
                      busStopData && busStopData.khoroo
                        ? busStopData.khoroo
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeBusStopInput(e, 'khorooNumber')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <Locations
              name="busStopData"
              data={this.state.busStopData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'parking':
        const onChangeParkingInput = (e, key) => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          this.setState({
            parkingData: {
              ...this.state.parkingData,

              [key]: (e.target as HTMLInputElement).value
            }
          });
        };
        content = (
          <>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дүүрэг</ControlLabel>
                  <FormControl
                    value={
                      parkingData && parkingData.district
                        ? parkingData.district
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeParkingInput(e, 'district')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хороо</ControlLabel>
                  <FormControl
                    value={
                      parkingData && parkingData.khoroo
                        ? parkingData.khoroo
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeParkingInput(e, 'khoroo')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <Locations
              name="parkingData"
              data={this.state.parkingData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'pharmacy':
        const onChangePharmacyInput = (e, key) => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          this.setState({
            pharmacyData: {
              ...this.state.pharmacyData,

              [key]: (e.target as HTMLInputElement).value
            }
          });
        };
        content = (
          <>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дүүрэг</ControlLabel>
                  <FormControl
                    value={
                      pharmacyData && pharmacyData.district
                        ? pharmacyData.district
                        : ''
                    }
                    type="text"
                    onChange={e => onChangePharmacyInput(e, 'district')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хороо</ControlLabel>
                  <FormControl
                    value={
                      pharmacyData && pharmacyData.khoroo
                        ? pharmacyData.khoroo
                        : ''
                    }
                    type="text"
                    onChange={e => onChangePharmacyInput(e, 'khoroo')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <Locations
              name="pharmacyData"
              data={this.state.pharmacyData}
              onChange={onChangeLocations}
            />
          </>
        );
        break;
      case 'districtTown':
        const onChangeDistrictTownInput = (e, key) => {
          const queryParams = queryString.parse(location.search);

          this.setState({ type: queryParams.type });

          let value: string | number = (e.target as HTMLInputElement).value;

          if (e.target.type === 'number') {
            value = Number(value);
          }

          this.setState({
            districtTownData: {
              ...this.state.districtTownData,

              [key]: value
            }
          });
        };

        const onChangeAttachment = (file: any, key) => {
          // this.setState({districtTownData.marketAttachment})
          this.setState({
            districtTownData: {
              ...this.state.districtTownData,

              [key]: file
            }
          });
        };
        content = (
          <>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дундаж үнэ</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.averagePrice
                        ? districtTownData.averagePrice
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeDistrictTownInput(e, 'averagePrice')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дундаж м2</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.averageM2
                        ? districtTownData.averageM2
                        : ''
                    }
                    type="number"
                    onChange={e => onChangeDistrictTownInput(e, 'averageM2')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Хүн ам</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.population
                        ? districtTownData.population
                        : ''
                    }
                    type="number"
                    onChange={e => onChangeDistrictTownInput(e, 'population')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дундаж нас</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.averageAge
                        ? districtTownData.averageAge
                        : ''
                    }
                    type="number"
                    onChange={e => onChangeDistrictTownInput(e, 'averageAge')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Зах</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.market
                        ? districtTownData.market
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeDistrictTownInput(e, 'market')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <Uploader
                  onChange={e => onChangeAttachment(e, 'marketAttachment')}
                  defaultFileList={
                    districtTownData && districtTownData.marketAttachment
                      ? districtTownData.marketAttachment
                      : ''
                  }
                ></Uploader>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Дүүргийн профайл</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.districtProfile
                        ? districtTownData.districtProfile
                        : ''
                    }
                    type="text"
                    onChange={e =>
                      onChangeDistrictTownInput(e, 'districtProfile')
                    }
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <Uploader
                  onChange={e =>
                    onChangeAttachment(e, 'districtProfileAttachment')
                  }
                  defaultFileList={
                    districtTownData &&
                    districtTownData.districtProfileAttachment
                      ? districtTownData.districtProfileAttachment
                      : ''
                  }
                ></Uploader>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Төрийн үйлчилгээ</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.publicService
                        ? districtTownData.publicService
                        : ''
                    }
                    type="text"
                    onChange={e =>
                      onChangeDistrictTownInput(e, 'publicService')
                    }
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <Uploader
                  onChange={e =>
                    onChangeAttachment(e, 'publicServiceAttachment')
                  }
                  defaultFileList={
                    districtTownData && districtTownData.publicServiceAttachment
                      ? districtTownData.publicServiceAttachment
                      : ''
                  }
                ></Uploader>
              </ExpandWrapper>
            </FlexRow>
            <FlexRow>
              <ExpandWrapper>
                <FormGroup>
                  <ControlLabel>Онцлох газрууд</ControlLabel>
                  <FormControl
                    value={
                      districtTownData && districtTownData.featuredAds
                        ? districtTownData.featuredAds
                        : ''
                    }
                    type="text"
                    onChange={e => onChangeDistrictTownInput(e, 'featuredAds')}
                    required={false}
                  ></FormControl>
                </FormGroup>
              </ExpandWrapper>
              <ExpandWrapper>
                <Uploader
                  onChange={e => onChangeAttachment(e, 'featuredAdsAttachment')}
                  defaultFileList={
                    districtTownData && districtTownData.featuredAdsAttachment
                      ? districtTownData.featuredAdsAttachment
                      : ''
                  }
                ></Uploader>
              </ExpandWrapper>
            </FlexRow>
          </>
        );
        break;
    }
    const cancel = (
      <Button
        btnStyle="simple"
        type="button"
        onClick={this.props.closeModal}
        icon="times-circle"
        uppercase={false}
      >
        Cancel
      </Button>
    );
    const save = (
      <Button
        btnStyle="success"
        type="button"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );
    return (
      <>
        {content}
        <ModalFooter>
          {cancel}
          {save}
        </ModalFooter>
      </>
    );
  }
  render() {
    const onChangeNameInput = e => {
      this.setState({ name: (e.target as HTMLInputElement).value });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Нэр</ControlLabel>
          <FormControl
            value={this.state.name || ''}
            type="text"
            name="name"
            onChange={onChangeNameInput}
            required={false}
          ></FormControl>
        </FormGroup>
        {this.renderPopUpContent()}
      </>
    );
  }
}

export default Form;
