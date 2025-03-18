let cardCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    document.querySelectorAll('.card').forEach(card => {
        card.draggable = true;
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });
});

function addCard(columnId) {
    const cardText = prompt("Enter card text:");
    if (cardText) {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${cardCounter++}`;
        card.textContent = cardText;
        card.draggable = true;
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
        document.getElementById(columnId).querySelector('.cards').appendChild(card);
        saveState();
    }
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

function importCards() {
    try {
        const data = JSON.parse(document.getElementById('importExportArea').value);
        document.querySelectorAll('.column .cards').forEach(column => {
            column.innerHTML = '';
        });
        Object.keys(data).forEach(columnId => {
            data[columnId].forEach(cardText => {
                const card = document.createElement('div');
                card.className = 'card';
                card.id = `card-${cardCounter++}`;
                card.textContent = cardText;
                card.draggable = true;
                card.addEventListener('dragstart', dragStart);
                card.addEventListener('dragend', dragEnd);
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
            cards.push(card.textContent);
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
            cards.push(card.textContent);
        });
        data[column.id] = cards;
    });
    localStorage.setItem('kanbanState', JSON.stringify(data));
}

function loadState() {
    const data = JSON.parse(localStorage.getItem('kanbanState'));
    if (data) {
        Object.keys(data).forEach(columnId => {
            data[columnId].forEach(cardText => {
                const card = document.createElement('div');
                card.className = 'card';
                card.id = `card-${cardCounter++}`;
                card.textContent = cardText;
                card.draggable = true;
                card.addEventListener('dragstart', dragStart);
                card.addEventListener('dragend', dragEnd);
                document.getElementById(columnId).querySelector('.cards').appendChild(card);
            });
        });
    }
}