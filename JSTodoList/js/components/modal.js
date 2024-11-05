import Alert from './alert.js';

export default class Modal {
  constructor() {
    this.title = document.getElementById('modal-title');
    this.description = document.getElementById('modal-description');
    this.dueDate = document.getElementById('modal-dueDate'); // Referencia al campo de fecha de vencimiento
    this.btn = document.getElementById('modal-btn');
    this.completed = document.getElementById('modal-completed');
    this.alert = new Alert('modal-alert');

    this.todo = null;
  }

  setValues(todo) {
    this.todo = todo;
    this.title.value = todo.title;
    this.description.value = todo.description;
    this.dueDate.value = todo.dueDate; // Asigna la fecha de vencimiento
    this.completed.checked = todo.completed;
  }

  onClick(callback) {
    this.btn.onclick = () => {
      // Validar que los campos de título y descripción no estén vacíos
      if (!this.title.value || !this.description.value) {
        this.alert.show('Title and description are required');
        return;
      }

      $('#modal').modal('toggle');

      // Pasar los datos incluyendo la fecha de vencimiento
      callback(this.todo.id, {
        title: this.title.value,
        description: this.description.value,
        dueDate: this.dueDate.value, // Incluye la fecha de vencimiento en el callback
        completed: this.completed.checked,
      });
    }
  }
}
