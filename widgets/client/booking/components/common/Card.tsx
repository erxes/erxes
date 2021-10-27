import * as React from 'react';

type Props = {
  title: string;
  type: string;
  widgetColor: string;
  status?: string;
  description?: string;
};

class Card extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    const { title } = this.props;

    return (
      <div className="card">
        <h4> {title} </h4>
      </div>
    );
  }
}

export default Card;
