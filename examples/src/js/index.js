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
      changeCount: 0,
      checkbox: false
    };

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
  }

  onChange (event) {
    this.setState({
      value: event.target.value,
      changeCount: this.state.changeCount + 1
    });
  }

  onClick (event) {
    alert(`Fastclick: ${event.fastclick}, Type: ${event.type}`);
  }

  onChangeCheckbox (event) {
    console.log(`Change value: ${event.target.value}, Change checked: ${event.target.checked}`);

    this.setState({
      checkbox: event.target.checked
    });
  }

  onClickCheckbox (event) {
    console.log(`Click value: ${event.target.value}, Click checked: ${event.target.checked}`);
  }

  onNoop () {
    return null;
  }

  render () {
    return (
      <div>
        <h2>Home</h2>
        <p>
          <input type="text" value={this.state.value} onChange={this.onChange} />
        </p>
        <p>
          Change count: {this.state.changeCount}
        </p>
        <p>
          <button onClick={this.onClick}>
            Check event type
          </button>
        </p>
        <p>
          <button onClick={this.onNoop}>
            Button with onClick
          </button>
        </p>
        <p>
          <button>
            Button without onClick
          </button>
        </p>
        <p>
          <Link to="/">
            React router link
          </Link>
        </p>
        <p>
          <a href="#">
            Regular link
          </a>
        </p>
        <p>
          <input
            type="checkbox"
            value={this.state.checkbox}
            onChange={this.onChangeCheckbox}
            onClick={this.onClickCheckbox}
          />
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
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/topics">Topics</Link></li>
        </ul>
      </nav>

      <main>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/topics" component={Topics} />
      </main>
    </div>
  </Router>
);

ReactDOM.render(<App />, document.getElementById('app'));
