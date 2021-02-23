import EmptyState from 'erxes-ui/lib/components/EmptyState';
import { __ } from 'erxes-ui/lib/utils/core';
import Icon from 'modules/common/components/Icon';
import Spinner from 'modules/common/components/Spinner';
import { colors, dimensions } from 'modules/common/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const MainContainer = styledTS<{ active?: boolean }>(styled.div)`
  background-color: ${props =>
    props.active ? colors.colorWhite : colors.bgMain};
  border: 1px solid ${props =>
    props.active ? colors.borderDarker : colors.bgMain};
  border-radius: 35px;
  height: 32px;
  position: relative;
  transition: .3s all;
  width: ${props => (props.active ? '280px' : '120px')};
  display: flex;
  padding: 0 ${dimensions.unitSpacing}px;
  align-items: center;
  position: relative;

  > span {
    color: ${colors.colorCoreGray};
    padding-left: ${dimensions.unitSpacing}px;
  }
  
  i {
    cursor: pointer;
    color: ${colors.colorCoreDarkGray};
  }

  input {
    background: 0 0;
    border: none;
    padding: 5px ${dimensions.unitSpacing}px;
    flex: 1;
    height: 100%;
    outline: 0;

    &:focus {
      outline: 0;
    }
  }
`;

const Suggest = styled.div`
  font-size: 12px;
  margin-top: -${dimensions.unitSpacing}px;
  color: ${colors.colorCoreLightGray};
`;

const Results = styled.div`
  position: absolute;
  width: 440px;
  max-width: 100vw;
  max-height: 100vh;
  max-height: 400px;
  max-height: 50vh;
  overflow-x: auto;
  z-index: 10;
  right: 0;
  top: 36px;
  background-color: ${colors.colorWhite};
  border-radius: 4px;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);

  ul {
    list-style: none;
    padding: 0px;
    margin: 0 0 ${dimensions.unitSpacing}px;

    li {
      padding: 0 ${dimensions.unitSpacing}px;
      margin-bottom: 5px;
      line-height: 18px;

      p {
        margin: 0;
      }

      &::last-child {
        margin-bottom: 0;
      }
    }

    li a {
      padding: 5px ${dimensions.unitSpacing}px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: ${colors.colorCoreDarkGray};
      background: rgba(0, 0, 0, 0.02);

      &:hover {
        background: ${colors.bgActive};
      }
    }
  }

  em {
    font-style: normal;
    background-color: ${colors.bgInternal};
    flex-shrink: 1;
  }

  small {
    margin: 0 0 0 ${dimensions.unitSpacing}px;
    padding: 0;
    color: ${colors.colorCoreLightGray};
    flex-shrink: 0;
    font-style: italic;
    font-size: ${dimensions.unitSpacing}px;
  }
`;

const SearchTitle = styled.h4`
  margin: 0;
  font-size: 12px;
  text-transform: capitalize;
  color: ${colors.colorCoreGray};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  position: sticky;
  top: 0;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.borderDarker};
  margin-bottom: ${dimensions.unitSpacing}px;
`;

type Props = {
  onSearch: (e) => void;
  results;
  loading: boolean;
};

class Search extends React.Component<
  Props,
  { showInput: boolean; searchValue: string }
> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = { showInput: false, searchValue: '' };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showInput: false });
    }
  };

  renderTitle = module => {
    let text = module;

    if (module === 'conversationMessages') {
      text = 'Conversations';
    }

    if (module === 'engageMessages') {
      text = 'Campaigns';
    }

    return <SearchTitle>{text}</SearchTitle>;
  };

  renderItem = (module, item) => {
    const highlights = item.highlight || {};
    const keys = Object.keys(highlights);

    return keys.map((key, index) => {
      const source = item.source;

      let keyText = key;

      if (keyText === 'firstName') {
        keyText = 'First name';
      }

      if (keyText === 'lastName') {
        keyText = 'Last name';
      }

      if (keyText === 'primaryPhone') {
        keyText = 'Primary phone';
      }

      if (keyText === 'primaryEmail') {
        keyText = 'Primary email';
      }

      if (keyText === 'primaryName') {
        keyText = 'Primary name';
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
        <li key={index}>
          <Link to={href}>
            <p dangerouslySetInnerHTML={{ __html: highlights[key] || '' }} />
            <small>Found in {keyText}</small>
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
      <div key={index}>
        {this.renderTitle(result.module)}

        <ul>
          {result.items.map(item => this.renderItem(result.module, item))}
        </ul>
      </div>
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
          <Spinner />
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
          <EmptyState
            image="/images/actions/5.svg"
            text={__('No results found')}
            size="full"
            extra={
              <Suggest>
                {__('It seems we can’t find any results based on your search')}
              </Suggest>
            }
          />
        </Results>
      );
    }

    return (
      <Results>
        {results.map((result, index) => this.renderResult(result, index))}
      </Results>
    );
  };

  openInput = () => {
    this.setState({ showInput: true });
  };

  closeInput = e => {
    e.stopPropagation();
    this.setState({ showInput: false, searchValue: '' });
  };

  handleInput = e => {
    this.setState({ searchValue: e.target.value });
  };

  renderInput = () => {
    const { onSearch } = this.props;
    const { showInput, searchValue } = this.state;

    return (
      <>
        <Icon icon="search-1" size={18} />
        {showInput ? (
          <>
            <input
              placeholder={__('Search')}
              value={searchValue}
              autoFocus={true}
              onKeyDown={onSearch}
              onChange={this.handleInput}
            />
            <Icon icon="times" size={18} onClick={this.closeInput} />
          </>
        ) : (
          <span>{__('Search')}...</span>
        )}
      </>
    );
  };

  render() {
    return (
      <MainContainer
        innerRef={this.setWrapperRef}
        active={this.state.showInput}
        onClick={this.openInput}
      >
        {this.renderInput()}
        {this.renderResults()}
      </MainContainer>
    );
  }
}

export default Search;
