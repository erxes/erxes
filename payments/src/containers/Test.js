import React from 'react';
import Payments from './Payments';
// import { useParams } from 'react-router-dom';
import { BrowserRouter as Router, Route, useParams } from 'react-router-dom';

function App() {
  //  const params = useParams();
  // console.log(params);
  // return <Payments />;
  return (
    <Router>
      <Route path='/' component={Payments} />
      <Route path=':q' component={CourseId} />
    </Router>
  );
}

function CourseId() {
  const { q } = useParams();
  return (
    <div>
      <h1>URL Param is: ___ {q}</h1>
    </div>
  );
}

export default App;
