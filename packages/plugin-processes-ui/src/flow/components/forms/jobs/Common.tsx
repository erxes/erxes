import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';
import { __ } from 'coreui/utils';
import { DrawerDetail } from '../../../styles';
import { DURATION_TYPES } from '../../../../constants';
import { FLOWJOB_TYPES } from '../../../constants';
import { FlowJobFooter } from './styles';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IJob } from '../../../types';
import { IJobRefer } from '../../../../job/types';
import { ScrolledContent } from '../../../styles';

type Props = {
  closeModal: () => void;
  activeFlowJob: IJob;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  name: string;
  description: string;
  config: any;
  children: React.ReactNode;
  jobRefer?: IJobRefer;
};

type State = {
  durationType: string;
  duration: number;
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
};

class CommonForm extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    const { jobRefer, activeFlowJob } = props;
    const { config } = activeFlowJob;

    this.state = {
      durationType:
        config.durationType ||
        (jobRefer || {}).durationType ||
        DURATION_TYPES.minut,
      duration: config.duration || (jobRefer || {}).duration || 1,
      inBranchId: config.inBranchId || '',
      inDepartmentId: config.inDepartmentId || '',
      outBranchId: config.outBranchId || '',
      outDepartmentId: config.outDepartmentId || ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeFlowJob !== this.props.activeFlowJob) {
      const { config } = nextProps.activeFlowJob;
      this.timer = setTimeout(() => {
        this.setState(
          {
            durationType:
              config.durationType ||
              (nextProps.jobRefer || {}).durationType ||
              DURATION_TYPES.minut,
            duration:
              config.duration || (nextProps.jobRefer || {}).duration || 1,
            inBranchId: config.inBranchId,
            inDepartmentId: config.inDepartmentId,
            outBranchId: config.outBranchId,
            outDepartmentId: config.outDepartmentId
          },
          () => {
            if (this.timer) {
              this.timer = undefined;
            }
          }
        );
      }, 100);
    }
  }

  onSave = () => {
    const { activeFlowJob, name, description } = this.props;
    if (!activeFlowJob) {
      return Alert.error('has not active FlowJob');
    }

    const {
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    switch (activeFlowJob.type) {
      case FLOWJOB_TYPES.INCOME:
        if (!outBranchId || !outDepartmentId) {
          return Alert.error('Must fill branch or department');
        }
        break;
      case FLOWJOB_TYPES.OUTLET:
        if (!inBranchId || !inDepartmentId) {
          return Alert.error('Must fill branch or department');
        }
        break;
      case FLOWJOB_TYPES.FLOW:
        break;
      default:
        if (
          !inBranchId ||
          !inDepartmentId ||
          !outBranchId ||
          !outDepartmentId
        ) {
          return Alert.error('Must fill branch or department');
        }
    }

    this.props.addFlowJob(
      { ...activeFlowJob, label: name, description },
      activeFlowJob.id,
      { ...this.props.config, ...this.state }
    );

    this.props.closeModal();
  };

  onSelect = (name, value) => {
    this.setState({ [name]: value } as any);
  };

  renderCommonContent() {
    const { activeFlowJob } = this.props;

    const {
      durationType,
      duration,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    if (activeFlowJob.type === FLOWJOB_TYPES.FLOW) {
      return <></>;
    }
    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Duration Type</ControlLabel>
              <FormControl
                name="durationType"
                componentClass="select"
                value={durationType}
                required={true}
                onChange={(e: any) => {
                  this.onSelect('durationType', e.target.value);
                }}
              >
                {Object.keys(DURATION_TYPES).map((typeName, index) => (
                  <option key={index} value={typeName}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Duration</ControlLabel>
              <FormControl
                name="duration"
                value={duration}
                required={true}
                type="number"
                onChange={(e: any) => {
                  this.onSelect('duration', e.target.value);
                }}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        {activeFlowJob.type !== FLOWJOB_TYPES.INCOME && (
          <>
            <FormWrapper>
              <ControlLabel uppercase={false}>
                <ul>Info of outgoing for NEED products:</ul>
              </ControlLabel>
            </FormWrapper>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>Branch</ControlLabel>
                  <SelectBranches
                    label="Choose branch"
                    name="selectedBranchIds"
                    initialValue={inBranchId}
                    onSelect={branchId => this.onSelect('inBranchId', branchId)}
                    multi={false}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>Department</ControlLabel>
                  <SelectDepartments
                    label="Choose department"
                    name="selectedDepartmentIds"
                    initialValue={inDepartmentId}
                    onSelect={departmentId =>
                      this.onSelect('inDepartmentId', departmentId)
                    }
                    multi={false}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>
          </>
        )}
        {activeFlowJob.type !== FLOWJOB_TYPES.OUTLET && (
          <>
            <FormWrapper>
              <ControlLabel uppercase={false}>
                <ul>Info of incoming for RESULT products:</ul>
              </ControlLabel>
            </FormWrapper>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>Branch</ControlLabel>
                  <SelectBranches
                    label="Choose branch"
                    name="selectedBranchIds"
                    initialValue={outBranchId}
                    onSelect={branchId =>
                      this.onSelect('outBranchId', branchId)
                    }
                    multi={false}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>Department</ControlLabel>
                  <SelectDepartments
                    label="Choose department"
                    name="selectedDepartmentIds"
                    initialValue={outDepartmentId}
                    onSelect={departmentId =>
                      this.onSelect('outDepartmentId', departmentId)
                    }
                    multi={false}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>
          </>
        )}
      </>
    );
  }

  render() {
    const { children, closeModal } = this.props;

    if (this.timer) {
      return <Spinner />;
    }

    return (
      <ScrolledContent>
        <DrawerDetail>
          {children}
          {this.renderCommonContent()}
        </DrawerDetail>
        <FlowJobFooter>
          <ModalFooter>
            <Button
              btnStyle="simple"
              type="button"
              onClick={closeModal}
              icon="times-circle"
            >
              {__('Cancel')}
            </Button>

            <Button btnStyle="success" icon="checked-1" onClick={this.onSave}>
              Save
            </Button>
          </ModalFooter>
        </FlowJobFooter>
      </ScrolledContent>
    );
  }
}

export default CommonForm;
