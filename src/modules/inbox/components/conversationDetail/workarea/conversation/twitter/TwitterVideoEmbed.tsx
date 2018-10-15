import * as React from 'react';
import script from 'scriptjs';

script('https://platform.twitter.com/widgets.js', 'twitter-embed');

type Props = {
  id: string;
};

class TwitterVideoEmbed extends React.Component<Props, {}> {
  private embedContainer;

  constructor(props) {
    super(props);

    this.embedContainer = React.createRef();
  }

  componentDidMount() {
    script.ready('twitter-embed', () => {
      if (!(window as any).twttr) {
        console.error('Failure to load window.twttr, aborting load.');
        return;
      }

      (window as any).twttr.widgets.createVideo(
        this.props.id,
        this.embedContainer
      );
    });
  }

  render() {
    // style for embed margin 8px
    const containerStyle = { marginLeft: '-8px', marginRight: '-8px' };

    return <div style={containerStyle} ref={this.embedContainer} />;
  }
}

export default TwitterVideoEmbed;
