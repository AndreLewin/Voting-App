import React from 'react';
import { Form, Button, Message, List, Input } from 'semantic-ui-react'
import axios from 'axios';
import {HorizontalBar} from 'react-chartjs-2';

class PollPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      poll_id: props.match.params.id,
      poll: {},
      choices: []
    };
    
    this.handleVoteClick = this.handleVoteClick.bind(this);
    this.handleNewResponse = this.handleNewResponse.bind(this);
  }
  
  componentDidMount() {
    axios.get('/polls/' + this.state.poll_id)
      .then((response) => {
        this.setState({
          poll: response.data.poll,
          choices: response.data.choices
        })
      
        document.getElementById("chart").style.height = 50+30*response.data.choices.length+"px";
        // Setting the height directly in render() does not work because the chart is not rerendered after mounting
      }) 
      .catch((error) => (console.log(error)));
  }

  handleVoteClick(choice, index) {
    return () => {      
      axios.post(`/polls/choices/${choice._id}/votes/new`)
        .then((response) => { 
          let choices = JSON.parse(JSON.stringify(this.state.choices));
          choices[index].hasVoted = response.data.hasVoted === true;
          this.setState({choices: choices});  
        })
        .catch((error) => (console.log(error)));
    }
  }
  
  handleNewResponse() {
    axios.post(`/polls/${this.state.poll_id}/choices/new`, { response: $("#newResponse").val() }, { headers: { Authorization: localStorage.getItem("token") } })
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => (console.log(error)));
  }
  
  render() {
    const responseList = this.state.choices.map((choice, index) => {
      return (
        <List.Item key={choice._id}>
          <Button color={choice.hasVoted ? "red" : "green"} onClick={this.handleVoteClick(choice, index)}>
            {choice.hasVoted ? "Unvote" : "Vote"}
          </Button>
          <List.Content style={{"display": "inline-block"}}>
            <List.Header>{choice.response}</List.Header>
            <List.Description>Votes: {choice.otherVotes + choice.hasVoted}</List.Description> 
          </List.Content>
        </List.Item>
      );  
    });  
    
    // Prepare ChartJS horizontal bar chart
    const data =
    {
      labels: this.state.choices.map((choice) => {return choice.response}),
      // For some reasons, "return" is compulsory here
      datasets: [
        {
          backgroundColor: ['#3366CC','#DC3912','#FF9900','#109618','#990099','#3B3EAC','#0099C6','#DD4477','#66AA00','#B82E2E','#316395','#994499','#22AA99','#AAAA11','#6633CC','#E67300','#8B0707','#329262','#5574A6','#3B3EAC'],
          // Chart.js can not generate random colors. Most questions will have less than 20 answers.
          data: this.state.choices.map((choice) => {return choice.otherVotes + choice.hasVoted})
        }
      ]
    };
    const options =
    {
      title: {
        display: false
      },
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function(value) {if (value % 1 === 0) {return value;}}
            // Integer graduation
          }
        }]
      }
    };
    
    return (
      <div>
        <div>
          <h2>{this.state.poll.question}</h2>
        </div>
        <List divided relaxed>
          {responseList}
        </List>
        
        { /* If the user has no token (not logged in), hide the button to add a response */
        localStorage.getItem("token") &&
        <div>
          <Input placeholder='New response' id='newResponse' />
          <Button color="blue" onClick={this.handleNewResponse}>Add new response</Button>
        </div>
        }
        
        <div id="chart">
          <HorizontalBar data={data} options={options} />
        </div>
        
      </div>
    );    
  }
}

export default PollPage;