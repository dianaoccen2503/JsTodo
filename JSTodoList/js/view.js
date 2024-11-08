import AddTodo from './components/add-todo.js';
import Modal from './components/modal.js';
import Filters from './components/filters.js';

export default class View {
  constructor() {
    this.model = null;
    this.table = document.getElementById('table');
    this.addTodoForm = new AddTodo();
    this.modal = new Modal();
    this.filters = new Filters();

    // Variable para almacenar la tarea eliminada temporalmente
    this.deletedTodo = null;

    this.addTodoForm.onClick((title, description, dueDate) => this.addTodo(title, description, dueDate));
    this.modal.onClick((id, values) => this.editTodo(id, values));
    this.filters.onClick((filters) => this.filter(filters));
  }

  setModel(model) {
    this.model = model;
  }

  render() {
    const todos = this.model.getTodos();
    todos.forEach((todo) => this.createRow(todo));
  }

  filter(filters) {
    const { type, words, dueDate } = filters; // Asegúrate de que dueDate sea parte de los filtros, si es necesario.
    const [, ...rows] = this.table.getElementsByTagName('tr');
    for (const row of rows) {
      const [title, description, dateCell, completed] = row.children; // Incluye la celda de fecha.
      let shouldHide = false;
  
      // Filtrado por palabras clave
      if (words) {
        shouldHide = !title.innerText.includes(words) && !description.innerText.includes(words);
      }
  
      // Filtrado por estado de completado
      const shouldBeCompleted = type === 'completed';
      const isCompleted = completed.children[0].checked;
  
      if (type !== 'all' && shouldBeCompleted !== isCompleted) {
        shouldHide = true;
      }
  
      // Filtrado por fecha (nueva lógica)
      if (dueDate) {
        const rowDate = new Date(dateCell.innerText);
        const filterDate = new Date(dueDate);
        if (isNaN(rowDate.getTime()) || rowDate.getTime() !== filterDate.getTime()) {
          shouldHide = true;
        }
      }
  
      if (shouldHide) {
        row.classList.add('d-none');
      } else {
        row.classList.remove('d-none');
      }
    }
  }
 
  addTodo(title, description, dueDate) {
    const todo = this.model.addTodo(title, description, dueDate);
    this.createRow(todo);
  }

  toggleCompleted(id) {
    this.model.toggleCompleted(id);
  }

  editTodo(id, values) {
    this.model.editTodo(id, values);
    const row = document.getElementById(id);
    row.children[0].innerText = values.title;
    row.children[1].innerText = values.description;
    row.children[2].innerText = values.dueDate;
    row.children[3].children[0].checked = values.completed;
  }

  removeTodo(id) {
    const index = this.model.findTodo(id);
    this.deletedTodo = { ...this.model.todos[index] }; // Guarda la tarea eliminada temporalmente
    this.model.removeTodo(id);
    document.getElementById(id).remove();

    // Muestra la notificación de "deshacer"
    this.showUndoNotification();
  }

  createRow(todo) {
    const row = this.table.insertRow();
    row.setAttribute('id', todo.id);
  
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
  
    // Determina el color de la fila según el estado de la tarea y la fecha de vencimiento
    this.updateRowColor(row, todo, today, dueDate);
  
    row.innerHTML = `
      <td>${todo.title}</td>
      <td>${todo.description}</td>
      <td>${todo.dueDate || 'No due date'}</td>
      <td class="text-center"></td>
      <td class="text-right"></td>
    `;
  
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.onclick = () => {
      this.toggleCompleted(todo.id);
      this.updateRowColor(row, todo, today, dueDate); // Actualiza el color cuando se marca como completado
      location.reload();
    };
    row.children[3].appendChild(checkbox);
  
    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-primary', 'mb-1');
    editBtn.innerHTML = '<i class="fa fa-pencil"></i>';
    editBtn.setAttribute('data-toggle', 'modal');
    editBtn.setAttribute('data-target', '#modal');
    editBtn.onclick = () => this.modal.setValues({
      id: todo.id,
      title: row.children[0].innerText,
      description: row.children[1].innerText,
      dueDate: row.children[2].innerText,
      completed: row.children[3].children[0].checked,
    });
    row.children[4].appendChild(editBtn);
  
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('btn', 'btn-danger', 'mb-1', 'ml-1');
    removeBtn.innerHTML = '<i class="fa fa-trash"></i>';
    removeBtn.onclick = () => this.confirmDelete(todo);
    row.children[4].appendChild(removeBtn);
  }
  
  updateRowColor(row, todo, today, dueDate) {
    // Verifica si la tarea está completada
    if (todo.completed) {
      const completedDate = todo.completedDate ? new Date(todo.completedDate) : today;
      if (completedDate <= dueDate) {
        row.style.backgroundColor = 'green'; // Completada antes o en la fecha de entrega
      } else {
        row.style.backgroundColor = 'gray'; // Completada después de la fecha de entrega
      }
    } else {
      if (dueDate >= today) {
        row.style.backgroundColor = 'blue'; // No completada y la fecha de entrega no ha pasado
      } else {
        row.style.backgroundColor = 'red'; // No completada y la fecha de entrega ha pasado
      }
    }
  } 
  
  confirmDelete(todo) {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.querySelector('.modal-title').innerText = 'Borrar todo';
    confirmModal.querySelector('.modal-body').innerText = `El ToDo "${todo.title}" será eliminado. ¿Desea continuar?`;

    confirmModal.querySelector('#confirm-delete-btn').onclick = () => {
      this.removeTodo(todo.id);
      $('#confirmModal').modal('hide');
    };

    $('#confirmModal').modal('show');
  }

  // Muestra la notificación de deshacer
  showUndoNotification() {
    const undoBtn = document.getElementById('undo-btn'); // Botón para deshacer
    undoBtn.classList.remove('d-none');
    undoBtn.onclick = () => this.undoDelete();
  }

  // Función para deshacer la eliminación
  undoDelete() {
    if (this.deletedTodo) {
      this.model.addTodo(
        this.deletedTodo.title,
        this.deletedTodo.description,
        this.deletedTodo.dueDate
      );
      this.createRow(this.deletedTodo);
      this.deletedTodo = null;
    }

    // Oculta el botón de deshacer
    const undoBtn = document.getElementById('undo-btn');
    undoBtn.classList.add('d-none');
  }
}
