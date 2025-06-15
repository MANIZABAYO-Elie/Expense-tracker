
let transactions = [];
let editingTransactionId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    // Load from localStorage
    const saved = localStorage.getItem('transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }

    // Set today’s date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('edit-date').value = today;

    updateDisplay();

    // Form submission handlers
    document.getElementById('transaction-form').addEventListener('submit', handleAddTransaction);
    document.getElementById('edit-form').addEventListener('submit', handleEditTransaction);

    // Modal click outside to close
    document.getElementById('edit-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
});

function handleAddTransaction(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const transaction = {
        id: Date.now(),
        description: formData.get('description').trim(),
        amount: parseFloat(formData.get('amount')),
        type: formData.get('type'),
        date: formData.get('date')
    };

    if (!validateTransaction(transaction)) {
        return;
    }

    transactions.push(transaction);
    saveToLocalStorage();

    e.target.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    hideError();
    updateDisplay();
}

function handleEditTransaction(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const updatedTransaction = {
        id: editingTransactionId,
        description: formData.get('description').trim(),
        amount: parseFloat(formData.get('amount')),
        type: formData.get('type'),
        date: formData.get('date')
    };

    if (!validateTransaction(updatedTransaction, true)) {
        return;
    }

    const index = transactions.findIndex(t => t.id === editingTransactionId);
    if (index !== -1) {
        transactions[index] = updatedTransaction;
        saveToLocalStorage();
        closeEditModal();
        updateDisplay();
    }
}

function validateTransaction(transaction, isEdit = false) {
    const errorElement = isEdit
        ? document.getElementById('edit-error-message')
        : document.getElementById('error-message');

    if (!transaction.description) {
        showError('Description is required', errorElement);
        return false;
    }

    if (!transaction.amount || transaction.amount <= 0) {
        showError('Amount must be greater than 0', errorElement);
        return false;
    }

    if (!transaction.type) {
        showError('Transaction type is required', errorElement);
        return false;
    }

    if (!transaction.date) {
        showError('Date is required', errorElement);
        return false;
    }

    hideError(errorElement);
    return true;
}

function showError(message, element = null) {
    const errorElement = element || document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(element = null) {
    const errorElement = element || document.getElementById('error-message');
    errorElement.style.display = 'none';
}

function updateDisplay() {
    updateBalance();
    updateTransactionList();
    updateTransactionCount();
}

function updateBalance() {
    const balance = transactions.reduce((total, transaction) => {
        return transaction.type === 'income'
            ? total + transaction.amount
            : total - transaction.amount;
    }, 0);

    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = `${balance.toFixed(2)} RWF`;

    balanceElement.className = 'balance-amount';
    if (balance > 0) {
        balanceElement.classList.add('positive');
    } else if (balance < 0) {
        balanceElement.classList.add('negative');
    }
}

function updateTransactionList() {
    const listElement = document.getElementById('transaction-list');

    if (transactions.length === 0) {
        listElement.innerHTML = '<div class="empty-state">No transactions yet. Add your first transaction above!</div>';
        return;
    }

    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    listElement.innerHTML = sortedTransactions.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-info">
                <div class="transaction-description">${escapeHtml(transaction.description)}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} RWF
            </div>
            <div class="transaction-actions">
                <button class="btn btn-edit" onclick="openEditModal(${transaction.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateTransactionCount() {
    const countElement = document.getElementById('transaction-count');
    const count = transactions.length;
    countElement.textContent = `(${count} transaction${count !== 1 ? 's' : ''})`;
}

function openEditModal(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    editingTransactionId = transactionId;

    document.getElementById('edit-description').value = transaction.description;
    document.getElementById('edit-amount').value = transaction.amount;
    document.getElementById('edit-type').value = transaction.type;
    document.getElementById('edit-date').value = transaction.date;

    document.getElementById('edit-modal').style.display = 'block';
    hideError(document.getElementById('edit-error-message'));
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingTransactionId = null;
    document.getElementById('edit-form').reset();
    hideError(document.getElementById('edit-error-message'));
}

function deleteTransaction(transactionId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== transactionId);
        saveToLocalStorage();
        updateDisplay();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}
