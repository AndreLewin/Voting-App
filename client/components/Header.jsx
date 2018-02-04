import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import axios from 'axios';


class Header extends React.Component {
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
      <Menu stackable inverted style={{"borderRadius": "0px"}}>
        <Menu.Item header onClick={() => {window.location.replace(location.origin)}}>Voting App</Menu.Item>
        {this.state.user_id && <Menu.Item><Link to="/mypolls">My polls</Link></Menu.Item>}
        {this.state.user_id && <Menu.Item><Link to="/newpoll">New poll</Link></Menu.Item>}
        <Menu.Item header position="right">Welcome {this.state.username}</Menu.Item>
        {!this.state.user_id && <Menu.Item><Link to="/signup">Create account</Link></Menu.Item>}
        {!this.state.user_id && <Menu.Item><Link to="/login">Log in</Link></Menu.Item>}
        {this.state.user_id && <Menu.Item>
          <Link to="/logout" onClick={() => {
            localStorage.clear();
            window.location.replace(location.origin);
          }}>Log out</Link></Menu.Item>
        }
      </Menu>
    );
  }
}

export default Header;