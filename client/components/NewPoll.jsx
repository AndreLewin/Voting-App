import React from 'react';
import { Form, Button, Message } from 'semantic-ui-react'
import axios from 'axios';

class NewPoll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: "",
      question: "",
      choices: [],
      nbAnswers: 2
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAddAnswer = this.handleAddAnswer.bind(this);
    this.handleRemoveAnswer = this.handleRemoveAnswer.bind(this);
  }
  
  
  componentDidMount() {
    // Identify the user from the token in localStorage
    if (localStorage.getItem("token")) {
      axios.post('/authenticate', {}, { headers: { Authorization: localStorage.getItem("token") } })
        .catch((error) => (console.log(error)))
        .then((response) => {
          this.setState({ 
            user_id: response.data.id,
          });
        });
    } else {
      // The user has no token, they must first log in to get one
      window.location.replace(location.origin+'/#/login');
    }
  }


  handleAddAnswer() {
    this.setState((prevState) => ({ nbAnswers: prevState.nbAnswers + 1 }));
  }
  handleRemoveAnswer() {
    this.setState((prevState) => ({ nbAnswers: prevState.nbAnswers - 1 }));
  }
  
  
  handleSubmit(event) {
    event.preventDefault();
    const question = $("#question").val();    
    let choices = [];
    for (let i = 0; i < this.state.nbAnswers; i++) {
      const choice = $("#choice"+i).val();
      if (choice) {
        choices = choices.concat(choice);    
      }      
    }
    
    axios.post('/polls/new', { question: question, choices: choices }, { headers: { Authorization: localStorage.getItem("token") } } )
      .then((response) => {
        window.location.replace(location.origin+'/#/poll/' + response.data.poll_id);
      })
      .catch((error) => {
        console.log(error);
        this.setState({ failed: true });
      })
  }
  
  render() {
    const answerList = new Array(this.state.nbAnswers).fill(undefined).map((answer, index) => {
      return (
        <Form.Field key={index}>
          <label>{"Answer " + (index + 1)}</label>
          <input placeholder='Answer' id={'choice'+index} />
        </Form.Field>
      );  
    });
    
    return (
      <div>
        <div>
          <h2>Enter your poll info</h2>
          <br/>
        </div>
        <Form error={this.state.failed}>
          <Message error content='Creating the poll failed. Is everything correct?' />
          <Form.Field>
            <label>Question</label>
            <input placeholder='Question' id='question' />
          </Form.Field>
          {answerList}
        </Form>
        <br/>
        <Button.Group>
          <Button negative disabled={this.state.nbAnswers < 2} onClick={this.handleRemoveAnswer}>Remove Answer</Button>
          <Button.Or /> 
          <Button positive onClick={this.handleAddAnswer}>Add Answer</Button>
          <Button.Or />
          <Button color="blue" onClick={this.handleSubmit}>Submit Poll</Button>
        </Button.Group>
      </div>
    );    
  }
}

export default NewPoll;