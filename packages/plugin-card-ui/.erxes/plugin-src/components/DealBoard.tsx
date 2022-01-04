// import Board from "@erxes/ui/src/boards/containers/Board";
// import MainActionBar from "@erxes/ui/src/boards/containers/MainActionBar";
// import { BoardContainer, BoardContent } from "@erxes/ui/src/boards/styles/common";
// import { __ } from "@erxes/ui/src/utils";
// import { menuDeal } from "@erxes/ui/src/utils/menus";
// import Header from "modules/layout/components/Header";
import React from "react";
// import DealMainActionBar from "../components/DealMainActionBar";
// import options from "../options";

type Props = {
  queryParams: any;
  viewType: string;
};

class DealBoard extends React.Component<Props> {
  // renderContent() {
  //   const { queryParams, viewType } = this.props;

  //   return (
  //     <Board viewType={viewType} queryParams={queryParams} options={options} />
  //   );
  // }

  // renderActionBar() {
  //   return <MainActionBar type="deal" component={DealMainActionBar} />;
  // }

  render() {
    return <div>HIIII, bro1</div>;

    // return (
    //   <BoardContainer>
    //     <Header title={__("Sales")} submenu={menuDeal} />
    //     <BoardContent transparent={true}>
    //       {this.renderActionBar()}
    //       {this.renderContent()}
    //     </BoardContent>
    //   </BoardContainer>
    // );
  }
}

export default DealBoard;
