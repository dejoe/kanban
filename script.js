let cardCounter = 0;
let currentColumnId = '';
let currentCardId = '';
let currentBoardId = '';
let db;

document.addEventListener('DOMContentLoaded', () => {
    initDatabase()
        .then(loadBoards)
        .then(() => {
            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('dragstart', dragStart);
                card.addEventListener('dragend', dragEnd);
            });
        });
});

async function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('kanbanDB', 2); // Incremented version number to 2

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains('boards')) {
                db.createObjectStore('boards', { keyPath: 'name' });
            }
            if (!db.objectStoreNames.contains('states')) {
                db.createObjectStore('states', { keyPath: 'boardId' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' });
            }
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function openAddCardDialog(columnId, cardId = null) {
    currentColumnId = columnId;
    currentCardId = cardId;
    const dialog = document.getElementById('addCardDialog');
    const cardTitleInput = document.getElementById('cardTitle');
    const cardDescriptionInput = document.getElementById('cardDescription');

    if (cardId) {
        const card = document.getElementById(cardId);
        cardTitleInput.value = card.querySelector('.title span').textContent;
        cardDescriptionInput.value = card.querySelector('.description').textContent;
    } else {
        cardTitleInput.value = '';
        cardDescriptionInput.value = '';
    }

    dialog.showModal();
}

function addCard() {
    const dialog = document.getElementById('addCardDialog');
    const cardTitleInput = document.getElementById('cardTitle');
    const cardDescriptionInput = document.getElementById('cardDescription');

    const cardTitle = cardTitleInput.value.trim();
    const cardDescription = cardDescriptionInput.value.trim();

    if (cardTitle) {
        if (currentCardId) {
            // Edit existing card
            const card = document.getElementById(currentCardId);
            card.querySelector('.title span').textContent = cardTitle;
            card.querySelector('.description').textContent = cardDescription;
        } else {
            // Create new card
            const card = document.createElement('div');
            card.className = 'card';
            card.id = `card-${cardCounter++}`;
            card.draggable = true;
            card.addEventListener('dragstart', dragStart);
            card.addEventListener('dragend', dragEnd);

            const titleContainer = document.createElement('div');
            titleContainer.className = 'title';

            const title = document.createElement('span');
            title.textContent = cardTitle;

            const toggleButton = document.createElement('button');
            toggleButton.textContent = '▼'; // Down arrow icon
            toggleButton.onclick = () => toggleDescription(card);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑'; // Trash icon
            deleteButton.onclick = () => deleteCard(card);

            titleContainer.appendChild(title);
            titleContainer.appendChild(toggleButton);
            titleContainer.appendChild(deleteButton);

            const description = document.createElement('div');
            description.className = 'description';
            description.textContent = cardDescription;

            card.appendChild(titleContainer);
            card.appendChild(description);

            document.getElementById(currentColumnId).querySelector('.cards').appendChild(card);
        }
        saveState();
    }
    dialog.close();
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
}

function dragEnd(e) {
    e.target.classList.remove('hide');
    saveState();
}

document.querySelectorAll('.column .cards').forEach(column => {
    column.addEventListener('dragover', dragOver);
    column.addEventListener('dragenter', dragEnter);
    column.addEventListener('dragleave', dragLeave);
    column.addEventListener('drop', drop);
});

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('hovered');
}

function dragLeave(e) {
    e.target.classList.remove('hovered');
}

function drop(e) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const card = document.getElementById(cardId);
    if (card) {
        e.target.appendChild(card);
        e.target.classList.remove('hovered');
        saveState();
    }
}

function toggleDescription(card) {
    const description = card.querySelector('.description');
    if (description.style.display === 'none' || description.style.display === '') {
        description.style.display = 'block';
        card.querySelector('.toggle-description').textContent = '▲'; // Up arrow icon
    } else {
        description.style.display = 'none';
        card.querySelector('.toggle-description').textContent = '▼'; // Down arrow icon
    }
}

function deleteCard(card) {
    card.remove();
    saveState();
}

function importCards() {
    try {
        const data = JSON.parse(document.getElementById('importExportArea').value);
        document.querySelectorAll('.column .cards').forEach(column => {
            column.innerHTML = '';
        });
        Object.keys(data).forEach(columnId => {
            data[columnId].forEach(cardData => {
                const card = document.createElement('div');
                card.className = 'card';
                card.id = `card-${cardCounter++}`;
                card.draggable = true;
                card.addEventListener('dragstart', dragStart);
                card.addEventListener('dragend', dragEnd);

                const titleContainer = document.createElement('div');
                titleContainer.className = 'title';

                const title = document.createElement('span');
                title.textContent = cardData.title;

                const toggleButton = document.createElement('button');
                toggleButton.textContent = '▼'; // Down arrow icon
                toggleButton.onclick = () => toggleDescription(card);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = '🗑'; // Trash icon
                deleteButton.onclick = () => deleteCard(card);

                titleContainer.appendChild(title);
                titleContainer.appendChild(toggleButton);
                titleContainer.appendChild(deleteButton);

                const description = document.createElement('div');
                description.className = 'description';
                description.textContent = cardData.description || '';

                card.appendChild(titleContainer);
                card.appendChild(description);

                document.getElementById(columnId).querySelector('.cards').appendChild(card);
            });
        });
        saveState();
    } catch (e) {
        alert('Invalid JSON format!');
    }
}

function exportCards() {
    const data = {};
    document.querySelectorAll('.column').forEach(column => {
        const cards = [];
        column.querySelector('.cards').querySelectorAll('.card').forEach(card => {
            const title = card.querySelector('.title span').textContent;
            const description = card.querySelector('.description').textContent;
            cards.push({ title, description });
        });
        data[column.id] = cards;
    });
    document.getElementById('importExportArea').value = JSON.stringify(data, null, 2);
}

async function saveState() {
    const data = {};
    document.querySelectorAll('.column').forEach(column => {
        const cards = [];
        column.querySelector('.cards').querySelectorAll('.card').forEach(card => {
            const title = card.querySelector('.title span').textContent;
            const description = card.querySelector('.description').textContent;
            cards.push({ title, description });
        });
        data[column.id] = cards;
    });

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['states'], 'readwrite');
        const store = transaction.objectStore('states');
        const request = store.put({ boardId: currentBoardId, data: data });

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

async function loadState() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['states'], 'readonly');
        const store = transaction.objectStore('states');
        const request = store.get(currentBoardId);

        request.onsuccess = function(event) {
            const data = event.target.result?.data;
            if (data) {
                Object.keys(data).forEach(columnId => {
                    data[columnId].forEach(cardData => {
                        const card = document.createElement('div');
                        card.className = 'card';
                        card.id = `card-${cardCounter++}`;
                        card.draggable = true;
                        card.addEventListener('dragstart', dragStart);
                        card.addEventListener('dragend', dragEnd);

                        const titleContainer = document.createElement('div');
                        titleContainer.className = 'title';

                        const title = document.createElement('span');
                        title.textContent = cardData.title;

                        const toggleButton = document.createElement('button');
                        toggleButton.textContent = '▼'; // Down arrow icon
                        toggleButton.onclick = () => toggleDescription(card);

                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = '🗑'; // Trash icon
                        deleteButton.onclick = () => deleteCard(card);

                        titleContainer.appendChild(title);
                        titleContainer.appendChild(toggleButton);
                        titleContainer.appendChild(deleteButton);

                        const description = document.createElement('div');
                        description.className = 'description';
                        description.textContent = cardData.description || '';

                        card.appendChild(titleContainer);
                        card.appendChild(description);

                        document.getElementById(columnId).querySelector('.cards').appendChild(card);

                        // Ensure description is initially hidden
                        description.style.display = 'none';
                    });
                });
            }
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

async function switchBoard(boardId) {
    currentBoardId = boardId;
    cardCounter = 0; // Reset card counter for the new board
    clearKanbanBoard();
    await loadState();
    highlightActiveBoard();
    saveActiveBoard(); // Save the active board in IndexedDB

    // Update the header title to match the board's title
    const boardTitleElement = document.getElementById('boardTitle');
    boardTitleElement.textContent = boardId;
}

function createNewBoard() {
    const dialog = document.getElementById('createBoardDialog');
    dialog.showModal();
}

async function addBoard() {
    const dialog = document.getElementById('createBoardDialog');
    const boardNameInput = document.getElementById('boardName');
    const boardName = boardNameInput.value.trim();

    if (boardName) {
        const boards = await getBoards();
        if (!boards.includes(boardName)) {
            boards.push(boardName);
            await saveBoards(boards);

            const boardList = document.getElementById('boardList');
            const li = document.createElement('li');

            const boardButton = document.createElement('button');
            boardButton.className = 'board-button';
            boardButton.textContent = boardName;
            boardButton.onclick = () => switchBoard(boardName);
            li.appendChild(boardButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = '🗑';
            deleteButton.onclick = () => deleteBoard(boardName);
            if (boards.length === 1) {
                deleteButton.style.display = 'none'; // Hide delete button if only one board
            } else {
                deleteButton.style.display = 'block'; // Show delete button if more than one board
            }
            li.appendChild(deleteButton);

            boardList.appendChild(li);

            // Switch to the new board
            switchBoard(boardName);
        } else {
            alert('Board already exists!');
        }
    }
    dialog.close();
}

function clearKanbanBoard() {
    document.querySelectorAll('.column .cards').forEach(column => {
        column.innerHTML = '';
    });
}

async function loadBoards() {
    let boards = await getBoards();
    const boardList = document.getElementById('boardList');
    boardList.innerHTML = ''; // Clear existing board list

    if (boards.length === 0) {
        await createDefaultBoard();
        boards = await getBoards();
    }

    boards.forEach(boardName => {
        const li = document.createElement('li');

        const boardButton = document.createElement('button');
        boardButton.className = 'board-button';
        boardButton.textContent = boardName;
        boardButton.onclick = () => switchBoard(boardName);
        li.appendChild(boardButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '🗑';
        deleteButton.onclick = () => deleteBoard(boardName);
        if (boards.length === 1) {
            deleteButton.style.display = 'none'; // Hide delete button if only one board
        } else {
            deleteButton.style.display = 'block'; // Show delete button if more than one board
        }
        li.appendChild(deleteButton);

        boardList.appendChild(li);
    });

    const activeBoard = await getActiveBoard();
    if (boards.length > 0) {
        if (activeBoard) {
            currentBoardId = activeBoard;
        } else {
            currentBoardId = boards[0];
        }
        switchBoard(currentBoardId); // Ensure the first board is loaded if no board is selected
    }
}

async function deleteBoard(boardName) {
    const boards = await getBoards();
    const index = boards.indexOf(boardName);
    if (index !== -1) {
        boards.splice(index, 1);
        await saveBoards(boards);
        await deleteState(boardName);
        loadBoards();
        if (currentBoardId === boardName) {
            if (boards.length > 0) {
                switchBoard(boards[0]);
            } else {
                createDefaultBoard();
            }
        }
    }
}

async function createDefaultBoard() {
    const defaultBoardName = 'Default Board';
    const boards = await getBoards();
    if (!boards.includes(defaultBoardName)) {
        boards.push(defaultBoardName);
        await saveBoards(boards);
    }
    switchBoard(defaultBoardName);

    // Update the header title to match the default board's title
    const boardTitleElement = document.getElementById('boardTitle');
    boardTitleElement.textContent = defaultBoardName;
}

function highlightActiveBoard() {
    const boardButtons = document.querySelectorAll('.board-button');
    boardButtons.forEach(button => {
        if (button.textContent === currentBoardId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

async function getBoards() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['boards'], 'readonly');
        const store = transaction.objectStore('boards');
        const request = store.get('boards');

        request.onsuccess = function(event) {
            const boards = event.target.result?.boards || [];
            resolve(boards);
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

async function saveBoards(boards) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['boards'], 'readwrite');
        const store = transaction.objectStore('boards');
        const request = store.put({ name: 'boards', boards: boards });

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

async function deleteState(boardId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['states'], 'readwrite');
        const store = transaction.objectStore('states');
        const request = store.delete(boardId);

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

async function getActiveBoard() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('activeBoard');

        request.onsuccess = function(event) {
            const activeBoard = event.target.result?.boardId;
            resolve(activeBoard);
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

async function saveActiveBoard() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ id: 'activeBoard', boardId: currentBoardId });

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function toggleImportExport() {
    const section = document.getElementById('importExportSection');
    const button = document.getElementById('toggleImportExport');
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        button.textContent = 'Hide Import/Export';
        section.scrollIntoView({ behavior: 'smooth' });
    } else {
        section.classList.add('hidden');
        button.textContent = 'Import/Export';
    }
}

document.getElementById('addCardDialog').addEventListener('close', (e) => {
    if (e.target.returnValue) {
        addCard();
    }
});

document.getElementById('createBoardDialog').addEventListener('close', (e) => {
    if (e.target.returnValue) {
        addBoard();
    }
});