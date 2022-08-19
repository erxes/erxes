import React from 'react';

import Leftbar from './Leftbar';
import PluginPreview from './PluginPreview';
import Wrapper from './Wrapper';

import { ImageWrapper } from '../styles';

type State = {
  plugins: any[];
  searchField: string;
  filterField: string;
};

class Installer extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      plugins: [],
      searchField: '',
      filterField: ''
    };
  }

  async componentDidMount() {
    fetch('https://erxes.io/plugins')
      .then(async response => {
        const plugins = await response.json();

        this.setState({ plugins });
      })
      .catch(e => {
        console.log(e);
      });
  }

  renderContent() {
    const { plugins, searchField, filterField } = this.state;

    // Fake data
    const categories = [
      { category: 'Premium Marketing Sales' },
      { category: 'Free Sales' },
      { category: 'Premium Services' }
    ];

    const pluginsFakeData = plugins.map((plugin, index) => ({
      ...plugin,
      ...(categories[index]
        ? categories[index]
        : { category: 'Free Marketing' })
    }));

    const filteredByCategory = pluginsFakeData.filter(plugin => {
      return plugin.category
        .toLowerCase()
        .includes(filterField && filterField.toLowerCase());
    });

    const finalFilteredPlugins = filteredByCategory.filter(plugin => {
      return plugin.title
        .toLowerCase()
        .includes(searchField && searchField.toLowerCase());
    });

    return (
      <>
        <ImageWrapper>
          <span>Product Experience management template</span>
          <img src="/images/marketplace.png" alt="installer" />
        </ImageWrapper>
        <PluginPreview plugins={finalFilteredPlugins} />
      </>
    );
  }

  render() {
    const onSearch = e => {
      this.setState({ searchField: e.target.value || '' });
    };

    const onFilter = (cat: string) => {
      this.setState({ filterField: cat || '' });
    };

    return (
      <Wrapper
        content={this.renderContent()}
        leftSidebar={<Leftbar onSearch={onSearch} onFilter={onFilter} />}
      />
    );
  }
}

export default Installer;
