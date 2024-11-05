import Model from './model.js';
import View from './view.js';

document.addEventListener('DOMContentLoaded', () => {
  const model = new Model();
  const view = new View();

  model.setView(view);
  view.setModel(model);

  // Modificación para capturar los datos de la nueva tarea incluyendo dueDate
  view.onAddTodo((title, description, dueDate) => {
    const todo = model.addTodo(title, description, dueDate);
    view.addTodo(todo);
  });

  // Renderiza la vista inicial
  view.render();
});
