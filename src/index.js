const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const userSelected = users.find(user => user.username === username);
  if (!userSelected) {
    return response.status(404).json({ statusCode: 404, error: 'user not found' });    
  }
  request.user = userSelected;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  if(users.some(user => user.username === username)) {
     return response.status(400).json({ statusCode: 400, error: 'username already exists' }) 
  }
  users.push(newUser);
  
  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {  
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    create_at: new Date()
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({ statusCode: 404, error: 'Todo not found' });
  } 
  todo.title = !title ? todo.title : title;
  todo.deadline = !deadline ? todo.deadline : new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) {
    return response.status(404).json({ statusCode: 404, error: 'Todo not found' });
  }
  todo.done = true;

  return response.status(204).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) {
    return response.status(404).json({ statusCode: 404, error: 'Todo not found' });
  }

  user.todos.splice(todo, 1);
  return response.status(204).json(user.todos);

});

module.exports = app;