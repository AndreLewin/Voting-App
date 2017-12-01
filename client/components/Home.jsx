import React from 'react';
import { List } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import axios from 'axios';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      polls: [],
    };
  }
  
  componentDidMount() {
    axios.get('/polls/all')
      .catch((error) => { console.log('error fetching polls')})
      .then((response) => {
        this.setState({ polls: response.data.polls });
      }) 
  }
  
  render() {
    const pollList = this.state.polls.map((poll, index) => {
      return (
        <List.Item key={poll._id}>
          <Link to={"/poll/"+poll._id}>{poll.question}</Link>
        </List.Item>
      );  
    });
    
    return (
      <div>
        <div>
          <h2>Polls from the community</h2>
        </div>
        <List divided relaxed>
          {pollList}
        </List>
      </div>
    );    
  }
}

export default Home;