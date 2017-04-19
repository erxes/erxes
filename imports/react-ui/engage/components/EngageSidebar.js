import React from 'react';

class InboxSidebar extends React.Component {
  render() {
    return (
      <div className="sidebar-container">
        <div className="sidebar">
          <div className="box">
            <h3>
              Messages
              <a href="#" className="add pull-right">+</a>
            </h3>
            <ul className="list">
              <li>
                <a href="#">
                  <span className="low">#</span>
                  All
                  <span className="counter">3</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="low">#</span>
                  All Live
                  <span className="counter">9</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="low">#</span>
                  All Drafts
                  <span className="counter">10</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="low">#</span>
                  All Paused
                  <span className="counter">3</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="low">#</span>
                  All Schedule
                  <span className="counter">10</span>
                </a>
              </li>
            </ul>
            <div className="show-more">
              <a href="#">+10 more</a>
            </div>
          </div>

          <div className="box">
            <h3>
              Filter
            </h3>
            <ul className="filter">
              <li>
                <a href="#">
                  All Conversation
                  <span className="counter">3</span>
                </a>
              </li>
              <li>
                <a href="#">
                  Awaiting
                  <span className="counter">9</span>
                </a>
              </li>
              <li>
                <a href="#">
                  Participating
                  <span className="counter">10</span>
                </a>
              </li>
              <div className="divider" />
              <li>
                <a href="#">
                  All Unresolved
                  <span className="counter">3</span>
                </a>
              </li>
              <li>
                <a href="#">
                  All Archived
                  <span className="counter">10</span>
                </a>
              </li>
              <li>
                <a href="#">
                  Custom Label
                  <span className="counter">3</span>
                </a>
              </li>
              <li>
                <a href="#">
                  Started
                  <span className="counter">3</span>
                </a>
              </li>
            </ul>
            <div className="show-more">
              <a href="#">+10 more</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default InboxSidebar;
