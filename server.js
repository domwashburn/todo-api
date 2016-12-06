var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.send('Todo API root');
});

app.listen( PORT, () => {
	console.log('Todo API running. Listening on port ' + PORT);
})