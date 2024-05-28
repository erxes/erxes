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
  renderRow = (label, value, editable = false) => {
    return (
      <li>
        {!editable ? (
          <FieldStyle>{__(`${label}`)}</FieldStyle>
        ) : (
          <FieldStyle>
            <span style={{ color: '#b90e0a' }}>{__(`${label}`)} </span>
          </FieldStyle>
        )}
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  render() {
    const { car } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('ТӨРӨЛ', car.xyp_type, true)}

        {this.renderRow(
          'Category',
          car.parentCategory ? car.parentCategory.name : '-'
        )}
        {this.renderRow('Sub category', car.category ? car.category.name : '-')}
        {this.renderRow('Улсын дугаар', car.plateNumber)}
        {this.renderRow('Арлын дугаар', car.vinNumber, true)}

        {this.renderRow('Үйлдвэрлэсэн он', car.vintageYear, true)}
        {this.renderRow('ОРЖ ИРСЭН ОГНОО', car.xyp_importDate, true)}

        {this.renderRow('Оношлогоо огноо', car.diagnosisDate)}
        {this.renderRow('Татвар огноо', car.taxDate)}
        {this.renderRow('Үйлдвэрлэгч', car.manufacture)}
        {this.renderRow('Чиргүүлийн холбоос', car.trailerType)}
        {this.renderRow('Ангилал', car.drivingClassification)}
        {this.renderRow('КЛАСС', car.xyp_className, true)}

        {this.renderRow('Модел', car.carModel, true)}
        {this.renderRow('Марк', car.mark, true)}
        {this.renderRow('Жин', car.weight)}
        {this.renderRow('Дугуйн даацын төрөл', car.tireLoadType)}
        {this.renderRow('Нумны төрөл', car.bowType)}
        {this.renderRow('Тоормосны төрөл', car.brakeType)}
        {this.renderRow('Гэрчилгээний төрөл', car.type)}
        {this.renderRow('Өнгө', car.color, true)}
        {this.renderRow('Эзэмшигч', car.ownerBy)}
        {this.renderRow('Засвар үйлчилгээ', car.repairService)}
        {this.renderRow('Интервал', car.interval)}
        {this.renderRow('Интервал утга', car.intervalValue)}
        {this.renderRow('Гүйлтийн төрөл', car.running)}
        {this.renderRow('Гүйлтийн утга', car.runningValue)}

        {this.renderRow('Steering wheel', car.steeringWheel)}
        {this.renderRow('ХҮРДНИЙ БАЙРЛАЛ', car.xyp_wheelPosition, true)}

        {this.renderRow('Хөдөлгүүр сольсон', car.engineChange)}
        {this.renderRow('Хөдөлгүүрийн багтаамж', car.engineCapacity)}
        {this.renderRow('Хурдны хайрцаг', car.transmission)}
        {this.renderRow('Хаалганы тоо', car.doors)}
        {this.renderRow('Суудлын тоо', car.seats)}
        {this.renderRow('Fuel Type', car.fuelType)}
        {this.renderRow('ШАТХУУНЫ ТӨРӨЛ', car.xyp_fueltype, true)}

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
        {this.renderRow('Угын хаалт', car.valve)}
        {this.renderRow('Торхны баталгаа', car.barrelWarranty)}
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

        {this.renderRow(
          'АРХИВЫН АНХЛАН БҮРТГЭЛИЙН ДУГААР',
          car.xyp_archiveFirstNumber,
          true
        )}
        {this.renderRow(
          'АРХИВЫН БҮРТГЭЛИЙН ДУГААР ',
          car.xyp_archiveNumber,
          true
        )}
        {this.renderRow('АРАЛ', car.xyp_axleCount, true)}

        {this.renderRow('ЧАДАЛ', car.xyp_capacity, true)}
        {this.renderRow('CERTIFICATENUMBER', car.xyp_certificateNumber, true)}
        {this.renderRow('УЛСЫН НЭР', car.xyp_countryName, true)}
        {this.renderRow('MANCOUNT', car.xyp_manCount, true)}
        {this.renderRow('MASS', car.xyp_mass, true)}
        {this.renderRow('ЭЗЭМШИГЧИЙН УЛС', car.xyp_ownerCountry, true)}
        {this.renderRow('ЭЗЭМШИГЧИЙН НЭР', car.xyp_ownerFirstname, true)}
        {this.renderRow('ЭЗЭМШИГЧИЙН ГАР УТАС', car.xyp_ownerHandphone, true)}
        {this.renderRow('ЭЗЭМШИГЧИЙН ОВОГ', car.xyp_ownerLastname, true)}
        {this.renderRow(
          'ЭЗЭМШИГЧИЙН РЕГИСТРИЙН ДУГААР',
          car.xyp_ownerRegnum,
          true
        )}
        {this.renderRow('ЭЗЭМШИГЧИЙН ТӨРӨЛ', car.xyp_ownerType, true)}
        {this.renderRow('ӨРГӨН', car.xyp_width, true)}
        {this.renderRow('УРТ', car.xyp_length, true)}
        {this.renderRow('ӨНДӨР', car.xyp_height, true)}
      </SidebarList>
    );
  }
}

export default DetailInfo;
