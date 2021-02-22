import Icon from 'modules/common/components/Icon';
import Spinner from 'modules/common/components/Spinner';
import { colors } from 'modules/common/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const MainContainer = styled.div`
  i {
    cursor: pointer;
  }

  input {
    margin-right: 5px;
  }
`;

const Results = styled.div`
  position: absolute;
  width: 800px;
  max-height: 500px;
  overflow-x: auto;
  z-index: 10;
  right: 350px;
  padding: 20px 40px;

  background-color: #f7f7f7;
  border: 1px solid #dfdfdf;

  ul,
  ul > li {
    list-style: none;
    padding: 0px;
    margin: 0px;
  }

  .title {
    text-transform: capitalize;
  }

  h4 {
    margin-bottom: 20px;
  }

  em {
    color: ${colors.colorCoreRed};
  }

  h5 {
    margin: 0px;
    padding: 0px;
    color: #bdb7b7;
  }

  .module {
    margin-bottom: 40px;
  }

  .highlight {
    border: 1px solid #eae7e7;
    margin-bottom: 20px;
    padding: 4px 8px;

    p {
      color: ${colors.colorPrimaryDark};
    }
  }

  .highlight:hover {
    background-color: #eaeaea;
  }
`;

type Props = {
  onSearch: (e) => void;
  results;
  loading: boolean;
};

class Search extends React.Component<Props, { showInput: boolean }> {
  constructor(props) {
    super(props);

    this.state = { showInput: false };
  }

  renderTitle = module => {
    let text = module;

    if (module === 'conversationMessages') {
      text = 'Conversations';
    }

    if (module === 'engageMessages') {
      text = 'Campaigns';
    }

    return <h4 className="title">{text}</h4>;
  };

  renderItem = (module, item) => {
    const highlights = item.highlight || {};
    const keys = Object.keys(highlights);

    return keys.map((key, index) => {
      const source = item.source;

      let keyText = key;

      if (keyText === 'firstName') {
        keyText = 'first name';
      }

      if (keyText === 'lastName') {
        keyText = 'last name';
      }

      if (keyText === 'primaryPhone') {
        keyText = 'primary phone';
      }

      if (keyText === 'primaryEmail') {
        keyText = 'primary email';
      }

      let href = '#';

      if (module === 'conversationMessages') {
        href = `/inbox/index?_id=${source.conversationId}`;
      }

      if (module === 'contacts') {
        href = `/contacts/details/${source._id}`;
      }

      if (module === 'companies') {
        href = `/companies/details/${source._id}`;
      }

      if (module === 'engageMessages') {
        href = `/campaigns/show/${source._id}`;
      }

      if (module === 'deals') {
        href = `/deal/board?id=${source.boardId}&itemId=${source._id}&pipelineId=${source.pipelineId}`;
      }

      if (module === 'tasks') {
        href = `/task/board?id=${source.boardId}&itemId=${source._id}&pipelineId=${source.pipelineId}`;
      }

      if (module === 'tickets') {
        href = `/inbox/ticket/board?id=${source.boardId}&itemId=${source._id}&pipelineId=${source.pipelineId}`;
      }

      return (
        <li key={index} className="highlight">
          <Link to={href}>
            <h5>Found in {keyText} field:</h5>
            <p dangerouslySetInnerHTML={{ __html: highlights[key] || '' }} />
          </Link>
        </li>
      );
    });
  };

  renderResult = (result, index) => {
    if (result.items.length === 0) {
      return null;
    }

    return (
      <li key={index} className="module">
        {this.renderTitle(result.module)}

        <ul>
          {result.items.map(item => this.renderItem(result.module, item))}
        </ul>
      </li>
    );
  };

  renderResults = () => {
    const { results, loading } = this.props;
    const { showInput } = this.state;

    if (!showInput) {
      return null;
    }

    if (loading) {
      return (
        <Results>
          <h2>Searching ... </h2>

          <div>
            <Spinner />
          </div>
        </Results>
      );
    }

    if (!results) {
      return null;
    }

    let totalItems = 0;

    results.forEach(result => {
      totalItems += result.items.length;
    });

    if (totalItems === 0) {
      return (
        <Results>
          <h2>Search results: </h2>
          <h6>No results found</h6>
        </Results>
      );
    }

    return (
      <Results>
        <h2>Search results: </h2>
        <ul>
          {results.map((result, index) => this.renderResult(result, index))}
        </ul>
      </Results>
    );
  };

  toggleInput = () => {
    this.setState({ showInput: !this.state.showInput });
  };

  renderInput = () => {
    const { onSearch } = this.props;
    const { showInput } = this.state;

    return (
      <>
        {showInput ? <input onKeyDown={onSearch} /> : null}
        <Icon icon="search-alt" size={21} onClick={this.toggleInput} />
      </>
    );
  };

  render() {
    return (
      <MainContainer>
        {this.renderInput()}
        {this.renderResults()}
      </MainContainer>
    );
  }
}

export default Search;
