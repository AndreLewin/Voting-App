import React from 'react';
import { Form, Message } from 'semantic-ui-react'
import axios from 'axios';

class LogIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      failed: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(event) {
    event.preventDefault();
    const username = $("#username").val();    
    const password = $("#password").val();  
    
    axios.post('/login', { username: username, password: password })
      .then((response) => {
        // A response has a token, that prooves the identity of the user
        console.log(response);
        localStorage.setItem('token', response.data.token);
        window.location.replace(location.origin);
      })
      .catch((error) => {
        console.log(error);
        this.setState({ failed: true });  
      })
  }
  
  render() {
    return (
      <div>
        <div>
          <h2>Login</h2>
          <br/>
        </div>
        <Form error={this.state.failed} action="/login" method="post" onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Input placeholder='Name' name='username' id='username' />
            <Form.Input placeholder='Password' name='password' type="password" id='password' />
            <Form.Button>Connect</Form.Button>
          </Form.Group>
          <Message error content='Invalid credentials, please try again' />
        </Form>  
      </div>
    );    
  }
}

export default LogIn;