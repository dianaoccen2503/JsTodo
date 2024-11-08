export default class Model {
  constructor() {
    this.view = null;
    this.todos = JSON.parse(localStorage.getItem('todos'));
    if (!this.todos || this.todos.length < 1) {
      this.todos = [
        {
          id: 0,
          title: 'Learn JS',
          description: 'Watch JS Tutorials',
          dueDate: '1900-01-01', // Agrega la propiedad dueDate
          completed: false,
        }
      ];
      this.currentId = 1;
    } else {
      this.currentId = this.todos[this.todos.length - 1].id + 1;
    }
  }

  setView(view) {
    this.view = view;
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  getTodos() {
    return this.todos.map((todo) => ({ ...todo }));
  }

  findTodo(id) {
    return this.todos.findIndex((todo) => todo.id === id);
  }

  toggleCompleted(id) {
    const index = this.findTodo(id);
    const todo = this.todos[index];
    todo.completed = !todo.completed;
    this.save();
  }

  editTodo(id, values) {
    const index = this.findTodo(id);
    Object.assign(this.todos[index], values);
    this.save();
  }

  // Modifica el método addTodo para incluir dueDate
  addTodo(title, description, dueDate = '') {
    const todo = {
      id: this.currentId++,
      title,
      description,
      dueDate, // Asigna la fecha de vencimiento
      completed: false,
    };

    this.todos.push(todo);
    console.log(this.todos);
    this.save();

    return { ...todo };
  }

  removeTodo(id) {
    const index = this.findTodo(id);
    this.todos.splice(index, 1);
    this.save();
  }
}
