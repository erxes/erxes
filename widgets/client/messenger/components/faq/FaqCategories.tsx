import * as React from "react";
import { Categories } from "../../containers/faq";
import { SearchBar } from "./";

type Props = {
  topicId: string;
};

interface IState {
  searchString: string;
}

class FaqCategories extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props);

    this.state = { searchString: "" };
  }

  search = (searchString: string) => {
    this.setState({ searchString });
  };

  render() {
    const { topicId } = this.props;
    const { searchString } = this.state;

    return (
      <>
        <SearchBar onSearch={this.search} searchString={searchString} />
        <div className="scroll-wrapper">
          <Categories topicId={topicId} searchString={searchString} />
        </div>
      </>
    );
  }
}

export default FaqCategories;
