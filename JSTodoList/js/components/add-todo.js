import Alert from './alert.js';

export default class AddTodo {
  constructor() {
    this.btn = document.getElementById('add');
    this.title = document.getElementById('title');
    this.description = document.getElementById('description');
    this.dueDateInput = document.getElementById('dueDateInput'); // Referencia al campo de fecha de vencimiento
    this.alert = new Alert('alert');
  }

  onClick(callback) {
    this.btn.onclick = () => {
      // Verificar que el título y la descripción no estén vacíos
      if (this.title.value === '' || this.description.value === '') {
        this.alert.show('Title and description are required');
      } else {
        this.alert.hide();
        // Pasar la fecha de vencimiento al callback
        callback(this.title.value, this.description.value, this.dueDateInput.value);
        
        // Limpiar los campos después de agregar la tarea
        this.title.value = '';
        this.description.value = '';
        this.dueDateInput.value = '';
      }
    }
  }
}
