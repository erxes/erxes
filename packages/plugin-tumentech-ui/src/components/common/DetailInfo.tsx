import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { ICar } from '../../types';

type Props = {
  car: ICar;
};

class DetailInfo extends React.Component<Props> {
  renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  render() {
    const { car } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('Улсын дугаар', car.plateNumber)}
        {this.renderRow('Арлын дугаар', car.vinNumber)}
        {this.renderRow(
          'Ангилал',
          car.category ? car.category.name : 'Unknown'
        )}
        {this.renderRow('Үйлдвэрлэсэн он', car.vintageYear)}
        {this.renderRow('Импортолсон он', car.importYear)}
        {this.renderRow('Оношлогоо огноо', car.diagnosisDate)}
        {this.renderRow('Татвар огноо', car.taxDate)}
        {this.renderRow('Үйлдвэрлэгч', car.manufacture)}
        {this.renderRow('Чиргүүлийн холбоос', car.trailerType)}
        {this.renderRow('Ангилал', car.drivingClassification)}
        {this.renderRow('Модел', car.carModel)}
        {this.renderRow('Марк', car.mark)}
        {this.renderRow('Жин', car.weight)}
        {this.renderRow('Дугуйн даацын төрөл', car.tireLoadType)}
        {this.renderRow('Нумны төрөл', car.bowType)}
        {this.renderRow('Тоормосны төрөл', car.brakeType)}
        {this.renderRow('Гэрчилгээний төрөл', car.type)}
        {this.renderRow('Өнгө', car.color)}
        {this.renderRow('Эзэмшигч', car.ownerBy)}
        {this.renderRow('Засвар үйлчилгээ', car.repairService)}
        {this.renderRow('Интервал', car.interval)}
        {this.renderRow('Интервал утга', car.intervalValue)}
        {this.renderRow('Гүйлтийн төрөл', car.running)}
        {this.renderRow('Гүйлтийн утга', car.runningValue)}

        {this.renderRow('Steering wheel', car.steeringWheel)}
        {this.renderRow('Хөдөлгүүр сольсон', car.engineChange)}
        {this.renderRow('Хөдөлгүүрийн багтаамж', car.engineCapacity)}
        {this.renderRow('Хурдны хайрцаг', car.transmission)}
        {this.renderRow('Хаалганы тоо', car.doors)}
        {this.renderRow('Суудлын тоо', car.seats)}
        {this.renderRow('Fuel Type', car.fuelType)}
        {this.renderRow('Нийт тэнхлэг', car.totalAxis)}
        {this.renderRow('Залуурын тэнхлэг', car.steeringAxis)}
        {this.renderRow('Зүтгэх тэнхлэг', car.forceAxis)}

        {this.renderRow('Тэвш Даац /кг/', car.wagonCapacity)}
        {this.renderRow('Тэвш Даац утга /кг/', car.wagonCapacityValue)}
        {this.renderRow('Шалны төрөл', car.floorType)}
        {this.renderRow('Өргөдөг эсэх', car.listChange)}
        {this.renderRow('Өргөлтийн төрөл', car.liftType)}
        {this.renderRow('Тэвш Урт /см/', car.wagonLength)}
        {this.renderRow('Тэвш Өргөн /см/', car.wagonWidth)}
        {this.renderRow('Порчекны өндөр', car.porchekHeight)}
        {this.renderRow('Эзлэхүүн /м3/', car.volume)}
        {this.renderRow('Өргөлтийн өндөр', car.liftHeight)}
        {this.renderRow('Ачилтын өндөр', car.height)}
        {this.renderRow('Өргөлт Даац /кг/', car.liftWagonCapacity)}
        {this.renderRow('Өргөлт Даац утга/кг/', car.liftWagonCapacityValue)}

        {this.renderRow('Торхны дугаар', car.barrelNumber)}
        {this.renderRow('Багтаамж /л/', car.capacityL)}
        {this.renderRow('Насосны чадал /л/мин/', car.pumpCapacity)}
        {this.renderRow('Тоолуурын баталгаа', car.meterWarranty)}
        {this.renderRow('Торх #1', car.barrel1)}
        {this.renderRow('Торх #2', car.barrel2)}
        {this.renderRow('Торх #3', car.barrel3)}
        {this.renderRow('Торх #4', car.barrel4)}
        {this.renderRow('Торх #5', car.barrel5)}
        {this.renderRow('Торх #6', car.barrel6)}
        {this.renderRow('Торх #7', car.barrel7)}
        {this.renderRow('Торх #8', car.barrel8)}

        {this.renderRow('Зүтгэх хүч', car.forceCapacityValue)}
        {this.renderRow('Зүтгэх багтаамж', car.forceValue)}
      </SidebarList>
    );
  }
}

export default DetailInfo;
