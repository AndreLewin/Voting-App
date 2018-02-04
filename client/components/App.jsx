import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Header from './Header.jsx'
import Home from './Home.jsx'
import SignUp from './SignUp.jsx'
import LogIn from './LogIn.jsx'
import NewPoll from './NewPoll.jsx'
import PollPage from './PollPage.jsx'
import MyPolls from './MyPolls.jsx'


class App extends React.Component {
  render() {
    return (
      <div>
        <Header/>
        <div style={{"padding": "0.5rem 2rem"}}>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/signup" component={SignUp}/>
            <Route path="/login" component={LogIn}/>
            <Route path="/mypolls" component={MyPolls}/>
            <Route path="/newpoll" component={NewPoll}/>
            <Route path="/poll/:id" component={PollPage}/>
          </Switch>
        </div>
      </div>
    );
  }
};

export default App;