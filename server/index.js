const express = require('express');
const app = express();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware'); // I still don't understand the point of this
const bodyParser = require('body-parser'); // Necessary for reading the body
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcrypt');

const User = require('./model/User');
const Poll = require('./model/Poll');
const Choice = require('./model/Choice');
const Vote = require('./model/Vote');

// Configure Mongoose
mongoose.connect(process.env.DB_URI, { useMongoClient: true });
mongoose.Promise = global.Promise; 

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Configure webpack 
const config = require('../webpack.dev.config');
const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {colors: true}
}));



// Check if a username is available
app.get('/users/availability/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  user ? res.status(200).send({available: false}) : res.status(200).send({available: true});
});


// Create a new user in the DB, if a user with the same name does not already exist
app.post('/users/new', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS), (err, hash) => {
      const user = new User({ username: req.body.username, password: hash });
      user.save();
      res.status(201).send("Created: A new user with this username has been created");
    });  
  } else {
    res.status(409).send("Conflict: A user with this username already exists. We can't create it.");
  }
});
   

// Gets username and password, check if they match, if true, return a token
// Every other authentified action will send the token, it will verify the identity of the user
app.post('/login', async (req, res) => {  
  const user = await User.findOne({ username: req.body.username }); 
  if (user) { 
    bcrypt.compare(req.body.password, user.password, (err, resp) => {
      if (resp) {
        let token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_PKEY, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({token: token, message: "OK: Welcome back user, have a good stay"});
      } else {
        res.status(401).send("Unauthorized: The password doesn't match the username");
      } 
    })    
  } else {
    res.status(404).send("Not Found: User for this username not found");  
  };
});


// Get info from the token of log-in each time the menu is mounted
app.post('/authenticate', async (req, res) => {
  const token = req.headers.authorization;
  if (token) {
    const decoded = await authenticate(token);
    if (decoded) {
      res.status(200).send({id: decoded.id, username: decoded.username, message: "OK: Token valid"});
    } else {
      res.status(204).send("No content: Your token is invalid (too old?), you will have to log again");
    };
  } else {
    res.status(204).send("No content: No token: Logged out or never logged in");
  }
})


// Create a new poll and its choices in the DB
// Authenticated only
app.post('/polls/new', async (req, res) => {
  
  const user = await authenticate(req.headers.authorization);
  
  if (user) {
    // Add the poll to the DB
    const poll = new Poll({ user_id: user.id, question: req.body.question });
    poll.save();

    // Add the choices to the DB
    const choices = req.body.choices;
    for (let i = 0; i < choices.length; i++) {
      const choice = new Choice({ poll_id: poll._id, response: choices[i] })
      choice.save();
    }
    
    res.status(201).send({ poll_id: poll._id, message: "Created: A new poll and choices were created" });
    
  } else {
    res.status(401).send("Unauthorized: Only authenticated users can create a poll.")  
  };
});


// Delete a poll
// Authenticated only
app.delete('/polls/delete/:poll_id', async (req, res) => {  
  
  const token = req.headers.authorization;
  const user = await authenticate(token);
  
  if (user) {
    
    const user_id = user.id;
    const poll_id = req.params.poll_id;
    const poll = await Poll.findOne( { _id: poll_id });
    
    if (poll) {
      
      if ( poll.user_id === user_id ) {
        poll.remove();
        res.status(204).send("No content: The poll has been deleted");
      } else {
        res.status(403).send("Forbidden: That's not your poll, you can not delete it.") 
      }
      
    } else {
      res.status(404).send("Not Found: Can't found a poll with this ID");  
    }
    
  } else {
    res.status(401).send("Unauthorized: Only authenticated users can delete a poll.")  
  };
});


// Return a list of all polls, from all users, or from a specific user (user_id in query)
// For specific informations about the choices, see GET /polls/:id
app.get('/polls/all', async (req, res) => {
  const user_id = req.query.user_id;
  let polls;
  user_id ? polls = await Poll.find({user_id: user_id}).lean() : polls = await Poll.find().lean();  
  res.status(200).send({polls: polls});
});


// Return poll info and the different choices
// For each choice, we add if the user has voted (based on IP) and the sum of votes
app.get('/polls/:poll_id', async (req, res) => {
  
  const poll_id = req.params.poll_id;  
  const poll = await Poll.findOne({ _id: poll_id });
  const choices = await Choice.find({ poll_id: poll_id }).lean();
  // A Choice is a Moongoose document, it is not a normal object to which we can set properties
  // (using console.log() and typeof even changes the type!)
  // we have to use .lean() to get real plain JS objects
  
  const ip = req.headers['x-forwarded-for'].split(',')[0];
  const ip_hash = await bcrypt.hash(ip, process.env.IP_SALT);
  
  for (let i = 0; i < choices.length; i++) {
    const vote = await Vote.findOne({ choice_id: choices[i]._id, ip_hash: ip_hash });
    choices[i].hasVoted = vote ? true : false;
    const votes = await Vote.find({ choice_id: choices[i]._id });
    choices[i].otherVotes = votes.length - (vote ? 1 : 0);
  }
  
  res.status(200).send({poll: poll, choices: choices});
});


// Add a new vote or remove it from a poll choice
// Not authenticated only, but based on hashed IP
app.post('/polls/choices/:choice_id/votes/new', async (req, res) => {  
  
  const choice_id = req.params.choice_id;
  const ip = req.headers['x-forwarded-for'].split(',')[0];
  const ip_hash = await bcrypt.hash(ip, process.env.IP_SALT);
  const vote = await Vote.findOne( { choice_id: choice_id, ip_hash: ip_hash });
  // We use a fixed salt, so we will always get the same ip_hash, that we can use to compare

  if (vote) {
    vote.remove();
  } else {
    const newVote = new Vote({ ip_hash: ip_hash, choice_id: choice_id });
    newVote.save();
  } 
    
  res.status(200).send({hasVoted: !vote});
  // Send the opposite (true or false) since the opposite was just made
});


// Add a new choice to an existing poll
// Authenticated only
app.post('/polls/:poll_id/choices/new', async (req, res) => {  
  
  const token = req.headers.authorization;
  const user = await authenticate(token);
  
  if (user) {
    const poll_id = req.params.poll_id;
    const response = req.body.response;

    if (response) {
      const newChoice = new Choice({ poll_id: poll_id, response: response });
      newChoice.save();
      res.status(204).send("No content: choice created for the poll " + poll_id);
    } else {
      res.status(400).send("Bad request: the new choice should contain a response");
    }
    
  } else {
    res.status(401).send("Unauthorized: Only authenticated users can create a choice for a poll.") 
  };
});


const authenticate = async (token) => {
  const decoded = await jwt.verify(token, process.env.JWT_PKEY);
  return decoded ? decoded : false;
};


// listen for requests
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
