const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user)=> user.username === username);

  if(!user) {
    return response.status(404).json({error: "User does not exist"});
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const usernameAlreadyExists = users.some((user)=> user.username === username);

  if(usernameAlreadyExists) {
    return response.status(400).json({error: "The UserName already in use"});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  
  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params;
  const {user} = request;

  const todo = user.todos.find((user)=> user.id === id);

  if(!todo){
    return response.status(404).json({error : "Todo not found"});
  }

  title ? todo.title = title : todo.title;
  deadline ? todo.deadline = new Date(deadline) : todo.deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  function findTodo(user){
    return user.id === id;
  }

  const todo = user.todos.find(findTodo);

  if(!todo){
    return response.status(404).json({error : "Todo not found"});
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const todo = user.todos.filter((user)=> user.id !== id);
  const verifyTodo = user.todos.find((user)=> user.id === id);

  if(!verifyTodo){
    return response.status(404).json({error : "Todo not found"});
  }

  user.todos = todo;

  return response.status(204).json(user.todos);
});

module.exports = app;