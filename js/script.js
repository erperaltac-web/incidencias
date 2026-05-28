let tasks = [];
let deleteIndex = null;

const form = document.getElementById("taskForm");
const table = document.getElementById("taskTable");
const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("taskId").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    const priority = document.getElementById("priority").value;

    if (id) {
        tasks[id] = { title, description, date, priority };
    } else {
        tasks.push({ title, description, date, priority });
    }

    form.reset();
    document.getElementById("taskId").value = "";

    renderTasks();
});

function renderTasks() {
    table.innerHTML = "";

    tasks.forEach((task, index) => {
        table.innerHTML += `
            <tr>
                <td>${task.title}</td>
                <td>${task.date}</td>
                <td>${task.priority}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editTask(${index})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="showDelete(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function editTask(index) {
    const task = tasks[index];

    document.getElementById("taskId").value = index;
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("date").value = task.date;
    document.getElementById("priority").value = task.priority;
}

function showDelete(index) {
    deleteIndex = index;
    deleteModal.show();
}

document.getElementById("confirmDelete").addEventListener("click", () => {
    tasks.splice(deleteIndex, 1);
    deleteModal.hide();
    renderTasks();
});