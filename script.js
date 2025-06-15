// script.js

// Selecting DOM elements
const form = document.getElementById("expense-form");
const descriptionInput = document.getElementById("transaction-description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");
const transactionList = document.getElementById("transaction-list");
const balanceDisplay = document.getElementById("balance");
const transactionCount = document.getElementById("transaction-number");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Add Transaction
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const date = dateInput.value;

  if (!description || isNaN(amount) || !date) {
    alert("Please fill in all fields with valid values.");
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
    type,
    date,
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  form.reset();
});

// Render Transactions
function renderTransactions() {
  transactionList.innerHTML = "";

  if (transactions.length === 0) {
    transactionList.innerHTML = '<li class="empty-message">No transactions yet. Add your first transaction above!</li>';
    balanceDisplay.textContent = "0.00 RWF";
    transactionCount.textContent = "0";
    return;
  }

  let total = 0;

  transactions.forEach((tx) => {
    const li = document.createElement("li");
    li.classList.add(tx.type);

    const amountSign = tx.type === "income" ? "+" : "-";
    const amountClass = tx.type === "income" ? "income" : "expense";
    const formattedAmount = `${amountSign}${tx.amount} RWF`;

    li.innerHTML = `
      <span><strong>${tx.description}</strong> - ${tx.date} - <span class="${amountClass}">${formattedAmount}</span></span>
      <span>
        <button onclick="editTransaction(${tx.id})">✏️</button>
        <button onclick="deleteTransaction(${tx.id})">🗑️</button>
      </span>
    `;

    transactionList.appendChild(li);

    total += tx.type === "income" ? tx.amount : -tx.amount;
  });

  balanceDisplay.textContent = `${total.toFixed(2)} RWF`;
  transactionCount.textContent = transactions.length;
}

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter((tx) => tx.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}

// Edit Transaction
function editTransaction(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;

  descriptionInput.value = tx.description;
  amountInput.value = tx.amount;
  typeInput.value = tx.type;
  dateInput.value = tx.date;

  deleteTransaction(id);
}

// Initial Load
renderTransactions();
