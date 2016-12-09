var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING, 
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync(/*{force: true}*/).then(() => {
	console.log('Everything is synced');
	User.findById(1)
		.then( user => {
			user.getTodos({where: {
					completed: true
				}
			})
			.then( todos => {
				todos.map( todo => {
					console.log(todo.toJSON());
				});
			})
		})
	// User.create({
	// 	email: 'test@email.com'
	// })
	// .then((user) => {
	// 	return Todo.create({
	// 		description: 'get new phone'
	// 	});
	// })
	// .then((todo) => {
	// 	User.findById(1)
	// 	.then( user => {
	// 		user.addTodo(todo);
	// 	});
	// })
})