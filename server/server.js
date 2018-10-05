//Libraries/frameworks imports
var express = require("express");
var bodyParser = require("body-parser");
var {ObjectID} = require("mongodb");
//Local imports
var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

var Port = process.env.PORT || 3000;

var app = express();
//Express middleware
app.use(bodyParser.json());

//Post route
app.post("/todos", (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

//Get route
app.get("/todos", (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

//Get a single todo
app.get("/todos/:id", (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.listen(Port, () => {
  console.log(`Http server running on localhost:${Port}`);
});


module.exports = {
  app
};
