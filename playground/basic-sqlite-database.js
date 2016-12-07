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

sequelize.sync().then(() => {
	console.log('Everything is synced');
	Todo.findById(300)
		.then((todo) => {
			if (todo) {
				console.log(todo.toJSON());
			} else {
				console.log('')
			}
		})
	/*Todo.create({description: 'do some cool stuff'})
		.then((todo) => {
			return Todo.create({
				description: 'clean house'
			})
		})
		.then(() => {
			// return Todo.findById(3)
			return Todo.findAll({
				where: {
					description: {
						$like: '%HOUSE%'
					}
				}
			})
		})
		.then((todos) => {
			todos.map( todo => {
				console.log(todo.toJSON());
			})
		})
		.catch((e) => {
			console.log(e);
		})*/
})