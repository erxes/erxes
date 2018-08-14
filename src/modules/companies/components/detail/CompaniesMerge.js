import React, { Fragment } from 'react';
import { InfoTitle, InfoDetail, Info } from 'modules/customers/styles';
import CocMerge from 'modules/customers/components/common/CocMerge';
import { COMPANY_INFO, COMPANY_DATAS } from '../../constants';

class CompaniesMerge extends CocMerge {
  renderDatas(company) {
    return (
      <Fragment>
        {this.renderFields(COMPANY_INFO.ALL, company)}
        {this.renderFields(COMPANY_DATAS.ALL, company)}
      </Fragment>
    );
  }

  renderTitle(key) {
    const title = COMPANY_INFO[key] || COMPANY_DATAS[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field, value) {
    switch (field) {
      case 'owner':
        return this.renderOwner(value);
      case 'parentCompany':
        return this.renderParentCompany(value);

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  }

  renderParentCompany(data) {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>{data.primaryName}</InfoDetail>
      </Info>
    );
  }

  renderOwner(data) {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>{data.details.fullName}</InfoDetail>
      </Info>
    );
  }
}

export default CompaniesMerge;
