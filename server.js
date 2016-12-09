var express = require('express');
var _ = require('underscore');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var db = require('./db');
var middleware = require('./middleware')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API root');
});

// GET /todos --  get the todos collection
app.get('/todos', middleware.requireAuthentication, (req, res) => {
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
app.get('/todos/:id', middleware.requireAuthentication, (req, res) => {
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
app.post('/todos', middleware.requireAuthentication, (req, res) => {
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
app.delete('/todos/:id', middleware.requireAuthentication, (req, res) => {
	var todoID = parseInt(req.params.id, 10);
	db.todo.destroy({
			where: {
				id: todoID
			}
		})
		.then( deletedRows => {
			if (deletedRows === 0) {
				res.status(404).json({
					error: 'No todo with id'
				});
			} else {
				res.status(204).send();
			}
		})
		.catch( e => {
			res.status(500).send();
		});
})

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};
	var todoID = parseInt(req.params.id, 10);

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}
	db.todo.findById(todoID)
	.then((todo) => {
		if (todo) {
			todo.update(attributes)
			.then((todo) => {
				res.json(todo.toJSON());
			}, (e) => {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, () => {
		res.status(500).send();
	})
});

app.post('/users', (req, res) => {
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body)
		.then( user => {
			res.json(user.toPublicJSON());
		})
		.catch( e => {
			res.status(400).json(e);
		});
});

app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, 'email', 'password');
	db.user.authenticate(body)
		.then( user => {
			var token = user.generateToken('authentication');
			if (token) {
				res.header('Auth', token).json(user.toPublicJSON());
			} else {
				res.status(401).send();
			}
		}, () => {
			res.status(401).send();
		});
});

db.sequelize.sync({force: true})
	.then(() => {
		app.listen( PORT, () => {
			console.log('Todo API running. Listening on port ' + PORT);
		});
	});
