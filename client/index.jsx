import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import axios from 'axios';

import Home from './components/Home.jsx'
import SignUp from './components/SignUp.jsx'
import LogIn from './components/LogIn.jsx'
import NewPoll from './components/NewPoll.jsx'
import PollPage from './components/PollPage.jsx'
import MyPolls from './components/MyPolls.jsx'

import './css/style.sass'

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      user_id: false,
      username: "guest"
    }
  }

  componentDidMount() {
    if (localStorage.getItem("token")) {
      axios.post('/authenticate', {}, { headers: { Authorization: localStorage.getItem("token") } })
        .catch((error) => (console.log(error)))
        .then((response) => {
          this.setState({
            user_id: response.data.id,
            username: response.data.username
          })
        })  
    }
  }
  
  render() {
    return (
      <HashRouter>
        <div>
          <Menu stackable inverted style={{"borderRadius": "0px"}}>
            <Menu.Item header onClick={() => {window.location.replace('https://vocxdona-apo.glitch.me/')}}>Voting App</Menu.Item>
            {this.state.user_id && <Menu.Item><Link to="/mypolls">My polls</Link></Menu.Item>}
            {this.state.user_id && <Menu.Item><Link to="/newpoll">New poll</Link></Menu.Item>}
            <Menu.Item header position="right">Welcome {this.state.username}</Menu.Item>
            {!this.state.user_id && <Menu.Item><Link to="/signup">Create account</Link></Menu.Item>}
            {!this.state.user_id && <Menu.Item><Link to="/login">Log in</Link></Menu.Item>}
            {this.state.user_id && <Menu.Item>
              <Link to="/logout" onClick={() => {
                localStorage.clear();
                window.location.replace('https://vocxdona-apo.glitch.me/')
              }}>Log out</Link></Menu.Item>
            }
          </Menu>
          <div style={{"padding": "0.5rem 2rem"}}>
            <Route exact path="/" component={Home}/>
            <Route path="/signup" component={SignUp}/>
            <Route path="/login" component={LogIn}/>
            <Route path="/mypolls" component={MyPolls}/>
            <Route path="/newpoll" component={NewPoll}/>
            <Route path="/poll/:id" component={PollPage}/>
          </div>
        </div>
      </HashRouter>
    );
  }
};

ReactDOM.render(<App />, document.getElementById('root'));