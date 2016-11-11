import React from 'react';
import { Wrapper } from '../../layout/components';


function Sidebar() {
  return (
    <Wrapper.Sidebar>
      <div className="box">
        <h3>
          #Channels
          <a href="#" className="add pull-right">+</a>
        </h3>
        <ul className="list">
          <li>
            <a href="#">
              <span className="low">#</span>
              New Media
              <span className="counter">3</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="low">#</span>
              It Support
              <span className="counter">9</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="low">#</span>
              Social
              <span className="counter">10</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="low">#</span>
              New Media
              <span className="counter">3</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="low">#</span>
              Social
              <span className="counter">10</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="low">#</span>
              New Media
              <span className="counter">3</span>
            </a>
          </li>
        </ul>
        <div className="show-more">
          <a href="#" >+10 more</a>
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
          <div className="divider"></div>
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
          <a href="#" >+10 more</a>
        </div>
      </div>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
