import './modal.css';
import { PAYMENTS } from './constants';
import { Component } from 'react';
import QpaySection from './Qpay';

type Props = {
  handleClose: any;
  show: boolean;
  datas: any[];
}

type State = {
  id: string;
}

class Modal extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      id: ""
    };
  }

  onClick = (id: string) => {
    this.setState({ id })
  }

  imageRender = (url: string, name: string, paymentConfigId: string) => {

    const { id } = this.state;
    const checked = id === paymentConfigId ? true : false;

    return (
      <div key={paymentConfigId} className="grid-sub-container" onClick={this.onClick.bind(this, paymentConfigId)}>
        <div className='grid-radio-item'><input type="radio" name="payment" checked={checked} onChange={this.onClick.bind(this, paymentConfigId)} /></div>
        <div className="grid-image-item"><img src={url} alt="payment config" width="100px" /></div>
        <div className="grid-name-item">{name}</div>
      </div>
    )
  }

  paymentOptionRender = (datas: any[]) => {

    return (
      <div className="grid-container">
        <div className="grid-item">
          <div style={{ height: '30em', overflow: 'auto' }}>
            {
              datas.map((data: any) => {
                const paymentConstant = PAYMENTS.find(p => p.type === data.type);

                return (
                  this.imageRender(paymentConstant ? paymentConstant.logo : "", data.name, data._id)
                );
              })
            }
          </div>
        </div>
        <div className="grid-item">
          {this.state.id && <QpaySection
            paymentConfigId={this.state.id}
            amountValue="10"
            descriptionValue="qpay test invoice"
          />}
        </div>

      </div>
    );

  }

  render() {
    const { show, datas, handleClose } = this.props;
    const showHideClassName = show ? 'modal display-block' : 'modal display-none';

    return (
      <div className={showHideClassName}>
        <section className='modal-main'>
          {this.paymentOptionRender(datas)}
        </section>
      </div>
    )
  }
}

export default Modal;
