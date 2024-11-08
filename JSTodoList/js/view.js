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
    
    // Modificación para capturar el título, descripción y fecha de vencimiento
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
    row.children[2].innerText = values.dueDate; // Actualiza la columna de fecha de vencimiento
    row.children[3].children[0].checked = values.completed;
  }

  removeTodo(id) {
    this.model.removeTodo(id);
    document.getElementById(id).remove();
  }

  createRow(todo) {
    
    const row = this.table.insertRow();
    row.setAttribute('id', todo.id);

    // Logic for setting row color based on task status
    const today = new Date();
    const dueDate = new Date(todo.dueDate);

    if (todo.completed) {
        if (dueDate >= new Date(todo.completedDate)) {
            row.style.backgroundColor = 'green'; // Completed on or before the due date
        } else {
            row.style.backgroundColor = 'red'; // Completed after the due date
        }
    } else if (dueDate >= today) {
        row.style.backgroundColor = 'blue'; // Task is still pending and due date is in the future
    } else {
        row.style.backgroundColor = 'gray'; // Task is overdue and not completed
    }
    
    row.innerHTML = `
      <td>${todo.title}</td>
      <td>${todo.description}</td>
      <td>${todo.dueDate || 'No due date'}</td> <!-- Muestra la fecha de vencimiento -->
      <td class="text-center"></td>
      <td class="text-right"></td>
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.onclick = () => this.toggleCompleted(todo.id);
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
      dueDate: row.children[2].innerText, // Envía la fecha de vencimiento al modal
      completed: row.children[3].children[0].checked,
    });
    row.children[4].appendChild(editBtn);

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('btn', 'btn-danger', 'mb-1', 'ml-1');
    removeBtn.innerHTML = '<i class="fa fa-trash"></i>';
    removeBtn.onclick = () => this.confirmDelete(todo);//Nueva linea para advertir el elimado
    row.children[4].appendChild(removeBtn);
  }

  //-----Funcion para advertir el elimando-----
  confirmDelete(todo) {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.querySelector('.modal-title').innerText = 'Borrar todo';
    confirmModal.querySelector('.modal-body').innerText = `El ToDo "${todo.title}" sera eliminado. ¿Desea continuar?`;

    confirmModal.querySelector('#confirm-delete-btn').onclick = () => {
        this.removeTodo(todo.id);
        $('#confirmModal').modal('hide');
    };

    $('#confirmModal').modal('show');
  }
}
