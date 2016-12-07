var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API root');
});

// GET /todos --  get the todos collection
app.get('/todos', (req, res) => {
	res.json(todos);
});
// GET /todos/:id -- get a specific todo by id.
app.get('/todos/:id', (req, res) => {
	var todoID = parseInt(req.params.id, 10);
	// var matchedTodo = todos.find( todo => {
	// 	return todo.id === todoID;
	// });
	var matchedTodo = _.findWhere(todos, {id: todoID});
	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send(`oops! can't find a todo with the id of ${todoID}`);
	}
});
// POST /todos
app.post('/todos', (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');
	// check body
	if (!_.isString(body.description) || !_.isBoolean(body.completed) || body.description.trim().length === 0) {
		return res.status(400).send()
	}
	body.description = body.description.trim();
	// add an ID to the request body and increment the value
	body.id = todoNextId++;
	// push the post body to the todos array
	todos.push(body);
	res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoID});
	if(matchedTodo) {
		console.log(matchedTodo)
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo)
	} else {
		res.status(404).json({"error": `couldn't find a to do with the ID of ${todoID}`});
	}
})

app.listen( PORT, () => {
	console.log('Todo API running. Listening on port ' + PORT);
})