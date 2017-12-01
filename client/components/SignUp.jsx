import React from 'react';
import { Form, Message } from 'semantic-ui-react';
import axios from 'axios';

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      isUsernameAvailable: true,
      hasUsernameError: true,
      hasPasswordError: true,
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleChange(event) {
    axios.get('/users/availability/' + $("#username").val())
      .then((response) => {
        const isUsernameAvailable = response.data.available === true;
        this.setState({
          username: $("#username").val(),
          password: $("#password").val(),
          isUsernameAvailable: isUsernameAvailable,
          hasUsernameError: $("#username").val().length < 1 || !isUsernameAvailable,
          hasPasswordError: $("#password").val().length < 1 || $("#password").val().length > 50
        });
      })
      .catch((error) => (console.log(error)))
  }

  handleSubmit() {
    axios.post('/users/new', { username: this.state.username, password: this.state.password })
      .then((response) => {
        window.location.replace('https://vocxdona-apo.glitch.me/#/login');
      })
      .catch((error) => {
        console.log(error)
      })
  }
  
  render() {
    return (
      <div>
        <div>
          <h2>Sign up</h2>
          <br/>
        </div>
        <Form>
          {
            this.state.isUsernameAvailable ?
            <Message content='Please enter a username and a password' /> :
            <Message negative content='This username is not available' />            
          }
          
          <Form.Group>
            <Form.Input placeholder='Username' id='username' error={this.state.hasUsernameError} onChange={this.handleChange} />
            <Form.Input placeholder='Password' id='password' type="password" error={this.state.hasPasswordError} onChange={this.handleChange} />
            <Form.Button disabled={this.state.hasUsernameError || this.state.hasPasswordError} onClick={this.handleSubmit}>Submit</Form.Button>
          </Form.Group>
        </Form>
      </div>
    );    
  }
}

export default SignUp;