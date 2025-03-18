let cardCounter = 0;
let currentColumnId = '';
let currentCardId = '';
let currentBoardId = '';

document.addEventListener('DOMContentLoaded', () => {
    loadBoards();
    if (!currentBoardId) {
        createDefaultBoard();
    } else {
        loadState();
    }
    document.querySelectorAll('.card').forEach(card => {
        card.draggable = true;
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });
});

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

function closeDialog() {
    const dialog = document.getElementById('addCardDialog');
    dialog.close();
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

function saveState() {
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
    localStorage.setItem(`kanbanState_${currentBoardId}`, JSON.stringify(data));
}

function loadState() {
    const data = JSON.parse(localStorage.getItem(`kanbanState_${currentBoardId}`));
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
            });
        });
    }
}

function createNewBoard() {
    const dialog = document.getElementById('createBoardDialog');
    dialog.showModal();
}

function closeCreateBoardDialog() {
    const dialog = document.getElementById('createBoardDialog');
    dialog.close();
}

function addBoard() {
    const dialog = document.getElementById('createBoardDialog');
    const boardNameInput = document.getElementById('boardName');
    const boardName = boardNameInput.value.trim();

    if (boardName) {
        const boardList = document.getElementById('boardList');
        const li = document.createElement('li');

        const boardButton = document.createElement('button');
        boardButton.className = 'board-button';
        boardButton.textContent = boardName;
        boardButton.onclick = () => switchBoard(boardName);
        li.appendChild(boardButton);

        const boards = JSON.parse(localStorage.getItem('boards')) || [];
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

        // Save the new board to local storage
        boards.push(boardName);
        localStorage.setItem('boards', JSON.stringify(boards));

        // Switch to the new board
        switchBoard(boardName);
    }
    dialog.close();
}

function switchBoard(boardId) {
    currentBoardId = boardId;
    cardCounter = 0; // Reset card counter for the new board
    clearKanbanBoard();
    loadState();
    loadBoards(); // Reload boards to ensure delete buttons are visible
    highlightActiveBoard();
}

function clearKanbanBoard() {
    document.querySelectorAll('.column .cards').forEach(column => {
        column.innerHTML = '';
    });
}

function loadBoards() {
    const boards = JSON.parse(localStorage.getItem('boards')) || [];
    const boardList = document.getElementById('boardList');
    boardList.innerHTML = ''; // Clear existing board list

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

    if (boards.length > 0 && !currentBoardId) {
        currentBoardId = boards[0];
        switchBoard(currentBoardId); // Ensure the first board is loaded if no board is selected
    }
}

function deleteBoard(boardName) {
    const boards = JSON.parse(localStorage.getItem('boards')) || [];
    const index = boards.indexOf(boardName);
    if (index !== -1) {
        boards.splice(index, 1);
        localStorage.setItem('boards', JSON.stringify(boards));
        localStorage.removeItem(`kanbanState_${boardName}`);
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

function createDefaultBoard() {
    const defaultBoardName = 'Default Board';
    const boards = JSON.parse(localStorage.getItem('boards')) || [];
    if (!boards.includes(defaultBoardName)) {
        boards.push(defaultBoardName);
        localStorage.setItem('boards', JSON.stringify(boards));
    }
    switchBoard(defaultBoardName);
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

document.getElementById('addCardDialog').addEventListener('close', () => {
    addCard();
});

document.getElementById('createBoardDialog').addEventListener('close', () => {
    addBoard();
});