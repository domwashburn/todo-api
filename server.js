var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'do something',
	completed: false
},{
	id: 2,
	description: 'do something else',
	completed: false
},{
	id: 3,
	description: 'do this first',
	completed: true
}];

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
	var matchedTodo = todos.find( todo => {
		return todo.id === todoID;
	});
	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send(`oops! can't find a todo with the id of ${todoID}`);
	}
});

app.listen( PORT, () => {
	console.log('Todo API running. Listening on port ' + PORT);
})