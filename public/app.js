const dotsLayer = document.getElementById('dots');
const itemList = document.getElementById('item-list');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const itemForm = document.getElementById('item-form');
const nameField = document.getElementById('field-name');
const usefulnessField = document.getElementById('field-usefulness');
const usefulnessOut = document.getElementById('usefulness-out');
const costField = document.getElementById('field-cost');
const costOut = document.getElementById('cost-out');
const notesField = document.getElementById('field-notes');
const deleteBtn = document.getElementById('delete-btn');
const cancelBtn = document.getElementById('cancel-btn');
const addFab = document.getElementById('add-fab');

let items = [];
let editingId = null;

function scoreToPercent(score) {
  return 5 + (score / 10) * 90;
}

function render() {
  dotsLayer.innerHTML = '';
  itemList.innerHTML = '';

  for (const item of items) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.style.left = `${scoreToPercent(item.usefulness)}%`;
    dot.style.bottom = `${scoreToPercent(item.cost)}%`;
    dot.title = item.name;
    dot.setAttribute('aria-label', item.name);
    dot.addEventListener('click', () => openEditModal(item));
    dotsLayer.appendChild(dot);

    const row = document.createElement('li');
    row.className = 'item-row';
    row.addEventListener('click', () => openEditModal(item));

    const name = document.createElement('span');
    name.className = 'item-row-name';
    name.textContent = item.name;

    const scores = document.createElement('span');
    scores.className = 'item-row-scores';
    scores.textContent = `useful ${item.usefulness} · cheap ${item.cost}`;

    row.appendChild(name);
    row.appendChild(scores);
    itemList.appendChild(row);
  }
}

async function loadItems() {
  const res = await fetch('/api/items');
  items = await res.json();
  render();
}

function openAddModal() {
  editingId = null;
  modalTitle.textContent = 'Add Item';
  itemForm.reset();
  usefulnessField.value = 5;
  costField.value = 5;
  usefulnessOut.textContent = '5';
  costOut.textContent = '5';
  deleteBtn.classList.add('hidden');
  modalOverlay.classList.remove('hidden');
  nameField.focus();
}

function openEditModal(item) {
  editingId = item.id;
  modalTitle.textContent = 'Edit Item';
  nameField.value = item.name;
  usefulnessField.value = item.usefulness;
  usefulnessOut.textContent = item.usefulness;
  costField.value = item.cost;
  costOut.textContent = item.cost;
  notesField.value = item.notes || '';
  deleteBtn.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  editingId = null;
}

usefulnessField.addEventListener('input', () => {
  usefulnessOut.textContent = usefulnessField.value;
});

costField.addEventListener('input', () => {
  costOut.textContent = costField.value;
});

addFab.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) closeModal();
});

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: nameField.value,
    usefulness: Number(usefulnessField.value),
    cost: Number(costField.value),
    notes: notesField.value,
  };

  if (editingId) {
    await fetch(`/api/items/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  closeModal();
  await loadItems();
});

deleteBtn.addEventListener('click', async () => {
  if (!editingId) return;
  await fetch(`/api/items/${editingId}`, { method: 'DELETE' });
  closeModal();
  await loadItems();
});

loadItems();
