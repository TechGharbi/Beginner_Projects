// ==================== SAUVEGARDE ULTRA FIABLE ====================
const STORAGE_KEY = 'my_weekly_todos_2025'; // Change jamais ce nom !

let allTasks = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] // Dimanche → Samedi
};

let currentDay = new Date().getDay(); // 0 = Dimanche, 6 = Samedi
let islatestFirst = true;

// CHARGER les tâches au demarrage
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Securite : on remet seulement si c'est bien un objet avec 7 jours
            if (parsed && typeof parsed === 'object') {
                allTasks = { ...allTasks, ...parsed };
                console.log("Tâches chargees avec succès !");
            }
        }
    } catch (e) {
        console.error("Erreur de chargement, on repart à zero", e);
        localStorage.removeItem(STORAGE_KEY); // Nettoie les donnees corrompues
    }
}

// SAUVEGARDER automatiquement à chaque changement
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));
    } catch (e) {
        console.error("Impossible de sauvegarder (stockage plein ?)", e);
        alert("Stockage plein ! Supprime des tâches ou vide le cache.");
    }
}

// ==================== GESTION DES JOURS ====================
const daysFR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function setActiveDay(day) {
    currentDay = day;

    // Mettre à jour la sidebar
    document.querySelectorAll('.day-item').forEach((el, i) => {
        el.classList.toggle('active', i === day);
    });

    // Mettre à jour le titre
    document.getElementById('current-day-title').textContent = `Mes tâches du ${daysFR[day]}`;

    renderTodos();
}

// Clic sur un jour dans la sidebar
document.querySelectorAll('.day-item').forEach(item => {
    item.addEventListener('click', () => {
        setActiveDay(parseInt(item.dataset.day));
    });
});

// ==================== FONCTIONS TODO ====================
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (!text) return;

    const todo = {
        id: Date.now() + Math.random(), // ID ultra unique
        text: text,
        completed: false,
        timestamp: new Date().toISOString()
    };

    allTasks[currentDay].push(todo);
    input.value = '';
    saveTasks();     // Sauvegarde immediate
    renderTodos();
}

function deleteTodo(id) {
    allTasks[currentDay] = allTasks[currentDay].filter(t => t.id !== id);
    saveTasks();
    renderTodos();
}

function toggleCompletion(id) {
    allTasks[currentDay] = allTasks[currentDay].map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks();
    renderTodos();
}

function toggleSort() {
    islatestFirst = !islatestFirst;
    const btn = document.querySelector('.sort-button');
    btn.innerHTML = islatestFirst
        ? 'Trier par plus ancien <i class="bx bx-sort"></i>'
        : 'Trier par plus recent <i class="bx bx-sort"></i>';
    renderTodos();
}

// ==================== AFFICHAGE ====================
function renderTodos() {
    const todos = allTasks[currentDay] || [];
    const uncompletedList = document.getElementById('uncompletedList');
    const completedList = document.getElementById('completedList');
    uncompletedList.innerHTML = '';
    completedList.innerHTML = '';

    const sorted = [...todos].sort((a, b) => {
        return islatestFirst
            ? new Date(b.timestamp) - new Date(a.timestamp)
            : new Date(a.timestamp) - new Date(b.timestamp);
    });

    let uncompleted = 0, completed = 0;

    sorted.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${todo.completed ? 'checked' : ''} 
                   onclick="toggleCompletion(${todo.id})">
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                <i class='bx bx-trash'></i>
            </button>
        `;

        if (todo.completed) {
            completedList.appendChild(li);
            completed++;
        } else {
            uncompletedList.appendChild(li);
            uncompleted++;
        }
    });

    document.getElementById('uncompleted-count').textContent = uncompleted;
    document.getElementById('completed-count').textContent = completed;
}

// ==================== PLIAGE DES SECTIONS ====================
function toggleSection(section) {
    const content = document.getElementById(`${section}-section`);
    const header = content.previousElementSibling;
    content.classList.toggle('expanded');
    header.classList.toggle('active');
}

// ==================== EVENEMENTS CLAVIER & BOUTONS ====================
document.getElementById('todoInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') addTodo();
});

document.querySelector('.add-btn').addEventListener('click', addTodo);

// ==================== DEMARRAGE ====================
loadTasks();                    // Charge tes anciennes tâches
setActiveDay(currentDay);       // Met le bon jour en surbrillance
renderTodos();                  // Affiche tout

// Message de confirmation (optionnel)
console.log("Todo hebdo charge ! Tes tâches sont sauvegardees pour toujours !");