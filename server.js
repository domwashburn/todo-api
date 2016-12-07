var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API root');
});

// GET /todos --  get the todos collection
app.get('/todos', (req, res) => {
	var query = req.query;
	var where = {};
	// var filteredTodos = todos;
	if ( query.hasOwnProperty('completed') && query.completed === 'true' ) {
		where.completed = true;
	} else if ( query.hasOwnProperty('completed') && query.completed === 'false' ) {
		where.completed = false;
	}
	if ( query.hasOwnProperty('q') && query.q.length > 0 ) {
		where.description = {
			$like: `%${query.q}%`
		};
	}
	db.todo.findAll({where: where})
		.then((todos) => {
			res.json(todos);
		})
		.catch( e => {
			res.status(500).send();
		});
});
// GET /todos/:id -- get a specific todo by id.
app.get('/todos/:id', (req, res) => {
	var todoID = parseInt(req.params.id, 10);
	db.todo.findById(todoID)
		.then( todo => {
			if (!!todo) {
				res.json(todo.toJSON());
			} else {
				res.status(404).send();
			}
		})
		.catch( e => {
			res.status(500).send();
		});
});
// POST /todos
app.post('/todos', (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');
	db.todo.create(body)
		.then( todo => {
			res.json(todo.toJSON());
		})
		.catch( e => {
			res.status(400).json(e);
		});
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

// PUT /todos/:id
app.put('/todos/:id', (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoID});
	console.log('matchedTodo', matchedTodo);
	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')){
		return res.status(400).send();
	}
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description.trim();
	} else if (body.hasOwnProperty('description')){
		return res.status(400).send();
	}
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
})

db.sequelize.sync()
	.then(() => {
		app.listen( PORT, () => {
			console.log('Todo API running. Listening on port ' + PORT);
		});
	});
