alert('Reloaded!');

import initReactFastclick from '../../../src/';
initReactFastclick();

import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

class Home extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      value: '',
      changeCount: 0
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange (event) {
    this.setState({
      value: event.target.value,
      changeCount: this.state.changeCount + 1
    });
  }

  render () {
    return (
      <div>
        <h2>Home</h2>
        <input type="text" value={this.state.value} onChange={this.onChange} />
        <p>
          Change count: {this.state.changeCount}
        </p>
      </div>
    );
  }
}

const About = () => (
  <div>
    <h2>About</h2>
  </div>
);

const Topic = ({ match }) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
);

const NoTopic = () => (
  <h3>Please select a topic.</h3>
);

const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Route path={`${match.url}/:topicId`} component={Topic} />
    <Route
      exact
      path={match.url}
      render={NoTopic}
    />
  </div>
);

const App = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/topics">Topics</Link></li>
      </ul>

      <hr />

      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
    </div>
  </Router>
);

ReactDOM.render(<App />, document.getElementById('app'));
