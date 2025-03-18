let cardCounter = 0;
let currentColumnId = '';
let currentCardId = '';

document.addEventListener('DOMContentLoaded', () => {
    loadState();
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
        cardTitleInput.value = card.querySelector('.title').textContent;
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
            card.querySelector('.title').textContent = cardTitle;
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
    localStorage.setItem('kanbanState', JSON.stringify(data));
}

function loadState() {
    const data = JSON.parse(localStorage.getItem('kanbanState'));
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

document.getElementById('addCardDialog').addEventListener('close', () => {
    addCard();
});