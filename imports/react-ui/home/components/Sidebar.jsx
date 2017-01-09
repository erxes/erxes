import React from 'react';
import Wrapper from '../../layout/components/Wrapper';


function Sidebar() {
  const top = (
    <div className="btn-group btn-group-sm" role="group">
      <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        All Segments (1240) <span className="caret"></span>
      </button>
      <ul className="dropdown-menu">
        <li><a href="#">Dropdown link</a></li>
        <li><a href="#">Dropdown link</a></li>
      </ul>
    </div>
  );

  return (
    <Wrapper.Sidebar top={top}>
      <div className="box">
        <ul className="list-group bordered">
          <li>
            <div className="title">
              <div className="full-name">
                <a href="/details">Anar-Erdene Batjargal </a>
              </div>
              <div>anarerdene.b@nmtec.co</div>
              <small className="date">
                About 11min ago
              </small>
            </div>
          </li>
          <li>
            <div className="title">
              <div className="full-name">
                <a href="/details">Anar-Erdene Batjargal </a>
              </div>
              <div>anarerdene.b@nmtec.co</div>
              <small className="date">
                About 11min ago
              </small>
            </div>
          </li>
        </ul>
      </div>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
