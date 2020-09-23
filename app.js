const express = require('express')
const app = express()
const port = 3000
const bodyParser = require("body-parser");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

app.set('view engine', 'ejs');
var indexRouter = require('./routes/index.js')

app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
