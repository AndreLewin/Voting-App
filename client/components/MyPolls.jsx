import React from 'react';
import { List, Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import axios from 'axios';

class MyPolls extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      user_id: "",
      polls: [],
    };
    
    this.handleDeletePoll = this.handleDeletePoll.bind(this);
  }
  
  componentDidMount() {
    
    // Identify the user from the token in localStorage
    if (localStorage.getItem("token")) {
      axios.post('/authenticate', {}, { headers: { Authorization: localStorage.getItem("token") } })
        .catch((error) => (console.log(error)))
        .then((response) => {
        
          // Use the token to find user's polls
          axios.get('/polls/all?user_id=' + response.data.id)
            .catch((error2) => { console.log('error fetching polls')})
            .then((response2) => {
            
              this.setState({ 
                user_id: response.data.id,
                polls: response2.data.polls 
              
              });
            }) 
        })  
    } else {
      // The user has no token, they must first log in to get one
      window.location.replace(location.origin+'/#/login');
    }
  }
  
  handleDeletePoll(poll_id) {
    return () => {
      axios.delete('/polls/delete/' + poll_id, { headers: { Authorization: localStorage.getItem("token") } })
        .then((response) => { window.location.reload(); })     
        .catch((error) => (console.log(error)))
    }
  }
  
  render() {
    const pollList = this.state.polls.map((poll, index) => {
      return (
        <div key={poll._id}>
          <Button onClick={this.handleDeletePoll(poll._id)} circular icon='close'/>
          <List.Item style={{"display": "inline-block"}}>
            <Link to={"/poll/"+poll._id}>{poll.question}</Link>
          </List.Item>
        </div>
      );  
    });
    
    return (
      <div>
        <div>
          <h2>My polls</h2>
        </div>
        <List divided relaxed>
          {pollList}
        </List>
      </div>
    );    
  }
}

export default MyPolls;