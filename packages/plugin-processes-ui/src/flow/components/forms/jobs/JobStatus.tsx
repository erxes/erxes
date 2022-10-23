import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { FLOWJOB_TYPES } from '../../../../flow/constants';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IJob } from '../../../types';
import { IJobRefer } from '../../../../job/types';
import { IProduct } from '../../../../types';
import { DisabledSpan } from '../../../styles';

type Props = {
  closeModal: () => void;
  activeFlowJob: IJob;
  flowJobs: IJob[];
  setUsedPopup: (check: boolean) => void;
  jobRefers: IJobRefer[];
  products: IProduct[];
};

type State = {
  jobReferById: any;
  productById: any;
};

class JobStatus extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { jobRefers, products } = this.props;

    const jobReferById = {};
    for (const jobRefer of jobRefers) {
      jobReferById[jobRefer._id] = jobRefer;
    }

    const productById = {};
    for (const product of products) {
      productById[product._id] = product;
    }

    this.state = {
      jobReferById,
      productById
    };
  }

  renderProducts = (products, matchProducts: any[]) => {
    const matchProductIds = matchProducts.length
      ? matchProducts.map(p => p.product._id)
      : [];
    return products.map(product => {
      if (!product.product) {
        return <li>Unknown product</li>;
      }

      const productId = product.product._id;
      const name = `${product.product.code} - ${product.product.name}` || '';

      if (matchProducts.length && !matchProductIds.includes(productId)) {
        return (
          <DisabledSpan>
            <li>{name}</li>
          </DisabledSpan>
        );
      }

      return <li>{name}</li>;
    });
  };

  renderBlock(
    title,
    job: IJob,
    match?: { jobs: IJob[]; type: string },
    kind = 'result'
  ) {
    const { jobReferById, productById } = this.state;
    const jobConfig = job.config;
    let matchProducts: any[] = [];
    if (match) {
      for (const matchJob of match.jobs) {
        const matchConfig = matchJob.config;
        if (matchConfig.jobReferId) {
          const matchJobRefer = jobReferById[matchConfig.jobReferId] || {};
          matchProducts = matchProducts.concat(
            match.type === 'need'
              ? matchJobRefer.needProducts
              : matchJobRefer.resultProducts
          );
        }
        if (matchConfig.productId) {
          const matchProduct = productById[matchConfig.productId];
          if (
            (match.type === 'need' &&
              [FLOWJOB_TYPES.OUTLET, FLOWJOB_TYPES.MOVE].includes(
                matchJob.type
              )) ||
            (match.type === 'result' &&
              [FLOWJOB_TYPES.INCOME, FLOWJOB_TYPES.MOVE].includes(
                matchJob.type
              ))
          ) {
            matchProducts.push({ product: matchProduct });
          }
        }
      }
    }

    if (!jobConfig.jobReferId && !jobConfig.productId) {
      return (
        <ul key={Math.random()}>
          <b>{title}</b>
          <p>Wrong configured</p>
        </ul>
      );
    }

    let products = [];

    if (jobConfig.jobReferId) {
      if ([FLOWJOB_TYPES.JOB, FLOWJOB_TYPES.ENDPOINT].includes(job.type)) {
        const jobRefer = jobReferById[jobConfig.jobReferId] || {};
        products =
          kind === 'need' ? jobRefer.needProducts : jobRefer.resultProducts;
      }
    }

    if (jobConfig.productId) {
      if (kind === 'need') {
        if ([FLOWJOB_TYPES.OUTLET, FLOWJOB_TYPES.MOVE].includes(job.type)) {
          products =
            (productById[jobConfig.productId] && [
              { product: productById[jobConfig.productId] }
            ]) ||
            [];
        }
        if (job.type === FLOWJOB_TYPES.INCOME) {
          products = [];
        }
      } else {
        if ([FLOWJOB_TYPES.INCOME, FLOWJOB_TYPES.MOVE].includes(job.type)) {
          products =
            (productById[jobConfig.productId] && [
              { product: productById[jobConfig.productId] }
            ]) ||
            [];
        }
        if (job.type === FLOWJOB_TYPES.OUTLET) {
          products = [];
        }
      }
    }

    return (
      <ul key={Math.random()}>
        <b>{title}</b>
        {this.renderProducts(products, matchProducts)}
      </ul>
    );
  }

  render() {
    const { activeFlowJob, flowJobs } = this.props;

    if (!activeFlowJob) {
      return <>Not found active job</>;
    }

    const activeFlowJobId =
      activeFlowJob && activeFlowJob.id ? activeFlowJob.id : '';
    const beforeFlowJobs = flowJobs.filter(e =>
      (e.nextJobIds || []).includes(activeFlowJobId)
    );

    return (
      <FormWrapper>
        <FormColumn>
          <Label lblColor="#673FBD">Өмнөх дамжлагаас бэлэн болох:</Label>
          {(beforeFlowJobs || []).map(b =>
            this.renderBlock(`${b.label}`, b, {
              jobs: [activeFlowJob],
              type: 'need'
            })
          )}
        </FormColumn>

        <FormColumn>
          <Label lblColor="#3CCC38">Уг дамжлагад хэрэгцээт:</Label>
          {this.renderBlock(
            '',
            activeFlowJob,
            { jobs: beforeFlowJobs, type: 'result' },
            'need'
          )}

          <Label lblColor="#F7CE53">Уг дамжлагаас гарц:</Label>
          {this.renderBlock('', activeFlowJob)}
        </FormColumn>
      </FormWrapper>
    );
  }
}

export default JobStatus;
