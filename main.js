// nyimpen key buat storagee
const STORAGE_KEY = 'EXPENSE_TRACKER_DATA';
let transactions = [];
let editingId = null;

// ngambil referensi elemen domm
const form = document.getElementById('transactionForm');
const inputTitle = document.getElementById('transactionFormTitleInput');
const inputAmount = document.getElementById('transactionFormAmountInput');
const inputDate = document.getElementById('transactionFormDateInput');
const selectType = document.getElementById('transactionFormTypeSelect');
const submitBtn = document.querySelector('[data-testid="transactionFormSubmitButton"]');

const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const searchInput = document.getElementById('searchTransactionFormTitleInput');
const searchForm = document.getElementById('searchTransactionForm');

const displayBalance = document.querySelector('.tracker-summary_balance-amount');
const displayIncome = document.querySelector('.tracker-summary_stat-amount--income');
const displayExpense = document.querySelector('.tracker-summary_stat-amount--expense');

document.addEventListener('DOMContentLoaded', () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        transactions = JSON.parse(data);
    }
    document.dispatchEvent(new Event('transaction:updated'));
});

// sinyal custom buat refresh layarr
document.addEventListener('transaction:updated', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    renderItems();
    updateDash();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = inputTitle.value.trim();
    const amount = Number(inputAmount.value);
    const date = inputDate.value;
    const type = selectType.value;

    if (!title || amount < 1) {
        alert('Isian judul tidak boleh kosong dan nominal uang harus lebih dari 0.');
        return;
    }

    if (editingId) {
        const idx = transactions.findIndex(t => t.id === editingId);
        if (idx !== -1) {
            transactions[idx] = { id: editingId, title, amount, date, type };
        }
        editingId = null;
        submitBtn.textContent = 'Simpan';
    } else {
        transactions.push({
            id: +new Date(),
            title,
            amount,
            date,
            type
        });
    }

    form.reset();
    document.dispatchEvent(new Event('transaction:updated'));
});

function renderItems() {
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    const keyword = searchInput.value.toLowerCase();
    const filtered = transactions.filter(t => t.title.toLowerCase().includes(keyword));

    filtered.forEach(t => {
        // bikin elemen baru pake DOM ajuangg
        const card = document.createElement('div');
        card.setAttribute('data-testid', 'transactionItem');
        card.className = 'tracker-transaction-item';

        const h3 = document.createElement('h3');
        h3.setAttribute('data-testid', 'transactionItemTitle');
        h3.textContent = t.title;

        const pAmount = document.createElement('p');
        pAmount.setAttribute('data-testid', 'transactionItemAmount');
        pAmount.textContent = `Nominal: Rp${t.amount}`;

        const pDate = document.createElement('p');
        pDate.setAttribute('data-testid', 'transactionItemDate');
        pDate.textContent = `Tanggal: ${t.date}`;

        const pType = document.createElement('p');
        pType.setAttribute('data-testid', 'transactionItemType');
        pType.textContent = `Tipe: ${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;

        const actions = document.createElement('div');
        actions.className = 'tracker-transaction-item_actions';

        const btnType = document.createElement('button');
        btnType.setAttribute('data-testid', 'transactionItemEditTypeButton');
        btnType.className = 'tracker-transaction-item_btn';
        btnType.textContent = 'Ubah Tipe';
        btnType.onclick = () => {
            t.type = t.type === 'income' ? 'expense' : 'income';
            document.dispatchEvent(new Event('transaction:updated'));
        };

        const btnEdit = document.createElement('button');
        btnEdit.className = 'tracker-transaction-item_btn';
        btnEdit.textContent = 'Edit';
        btnEdit.onclick = () => {
            inputTitle.value = t.title;
            inputAmount.value = t.amount;
            inputDate.value = t.date;
            selectType.value = t.type;
            editingId = t.id;
            submitBtn.textContent = 'Perbarui';
            form.scrollIntoView({ behavior: 'smooth' });
        };

        const btnDelete = document.createElement('button');
        btnDelete.setAttribute('data-testid', 'transactionItemDeleteButton');
        btnDelete.className = 'tracker-transaction-item_btn';
        btnDelete.textContent = 'Hapus';
        btnDelete.onclick = () => {
            transactions = transactions.filter(item => item.id !== t.id);
            document.dispatchEvent(new Event('transaction:updated'));
        };

        actions.append(btnType, btnEdit, btnDelete);
        card.append(h3, pAmount, pDate, pType, actions);

        if (t.type === 'income') {
            incomeList.append(card);
        } else {
            expenseList.append(card);
        }
    });
}

// deteksi ketikan langsung di kolom carii
searchInput.addEventListener('input', () => {
    renderItems();
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    renderItems();
});

function updateDash() {
    let inTotal = 0;
    let exTotal = 0;

    transactions.forEach(t => {
        if (t.type === 'income') inTotal += t.amount;
        else exTotal += t.amount;
    });

    displayBalance.textContent = `Rp ${inTotal - exTotal}`;
    displayIncome.textContent = `Rp ${inTotal}`;
    displayExpense.textContent = `Rp ${exTotal}`;
}