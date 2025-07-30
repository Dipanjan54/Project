// Personal Finance Tracker Application
class FinanceTracker {
    constructor() {
        // localStorage key for storing transactions
        this.storageKey = 'financeTracker_transactions';
        
        // Load transactions from localStorage
        this.transactions = this.loadFromStorage();
        this.editingId = null;
        
        // Categories suitable for Indian users
        this.categories = {
            income: ['Salary', 'Business', 'Freelance', 'Investment', 'Rental', 'Gift', 'Other Income'],
            expense: ['Food & Dining', 'Groceries', 'Bills & Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Rent', 'EMI', 'Insurance', 'Personal Care', 'Other Expense']
        };
        
        // Chart instances
        this.expensePieChart = null;
        this.incomeExpenseBarChart = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.populateCategories();
        this.updateDisplay();
        this.initCharts();
    }
    
    // LocalStorage Methods
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            alert('Unable to save data. Your browser storage might be full.');
        }
    }
    
    bindEvents() {
        // Form submission
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Type change to update categories
        document.getElementById('type').addEventListener('change', (e) => {
            this.updateCategories(e.target.value);
        });
        
        // Filter events
        document.getElementById('filter-type').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('filter-category').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Cancel edit
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.cancelEdit();
        });
    }
    
    populateCategories() {
        const categorySelect = document.getElementById('category');
        const filterCategorySelect = document.getElementById('filter-category');
        
        // Clear existing options (except first)
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        filterCategorySelect.innerHTML = '<option value="all">All Categories</option>';
        
        // Add all categories to filter
        [...this.categories.income, ...this.categories.expense].forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
            option.textContent = category;
            filterCategorySelect.appendChild(option);
        });
    }
    
    updateCategories(type) {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        if (type && this.categories[type]) {
            this.categories[type].forEach(category => {
                const option = document.createElement('option');
                option.value = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    }
    
    handleFormSubmit() {
        const transaction = {
            id: this.editingId || Date.now(),
            description: document.getElementById('description').value.trim(),
            amount: parseFloat(document.getElementById('amount').value),
            type: document.getElementById('type').value,
            category: document.getElementById('category').value,
            date: new Date().toISOString()
        };
        
        // Validation
        if (!transaction.description || !transaction.amount || !transaction.type || !transaction.category) {
            alert('Please fill in all fields');
            return;
        }
        
        if (transaction.amount <= 0) {
            alert('Amount must be greater than zero');
            return;
        }
        
        if (this.editingId) {
            // Update existing transaction
            const index = this.transactions.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                this.transactions[index] = transaction;
            }
            this.cancelEdit();
        } else {
            // Add new transaction
            this.transactions.push(transaction);
        }
        
        // Save to localStorage
        this.saveToStorage();
        
        // Reset form and update display
        document.getElementById('transaction-form').reset();
        this.updateDisplay();
        this.updateCharts();
    }
    
    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (transaction) {
            document.getElementById('description').value = transaction.description;
            document.getElementById('amount').value = transaction.amount;
            document.getElementById('type').value = transaction.type;
            
            this.updateCategories(transaction.type);
            document.getElementById('category').value = transaction.category;
            
            this.editingId = id;
            document.getElementById('submit-btn').textContent = 'Update Transaction';
            document.getElementById('cancel-btn').style.display = 'inline-block';
            
            // Scroll to form
            document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToStorage();
            this.updateDisplay();
            this.updateCharts();
        }
    }
    
    cancelEdit() {
        this.editingId = null;
        document.getElementById('submit-btn').textContent = 'Add Transaction';
        document.getElementById('cancel-btn').style.display = 'none';
        document.getElementById('transaction-form').reset();
    }
    
    getFilteredTransactions() {
        const typeFilter = document.getElementById('filter-type').value;
        const categoryFilter = document.getElementById('filter-category').value;
        
        return this.transactions.filter(transaction => {
            const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
            const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
            return matchesType && matchesCategory;
        });
    }
    
    applyFilters() {
        this.displayTransactions();
    }
    
    clearFilters() {
        document.getElementById('filter-type').value = 'all';
        document.getElementById('filter-category').value = 'all';
        this.displayTransactions();
    }
    
    updateDisplay() {
        this.updateBalances();
        this.displayTransactions();
    }
    
    updateBalances() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = totalIncome - totalExpenses;
        
        document.getElementById('total-income').textContent = `₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('total-expenses').textContent = `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('total-balance').textContent = `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Update balance color
        const balanceElement = document.getElementById('total-balance');
        balanceElement.style.color = balance >= 0 ? '#2ecc71' : '#e74c3c';
    }
    
    displayTransactions() {
        const transactionsList = document.getElementById('transactions-list');
        const filteredTransactions = this.getFilteredTransactions();
        
        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="no-transactions">
                    <div style="font-size: 3rem; margin-bottom: 15px;">💰</div>
                    <p>No transactions yet</p>
                    <p style="font-size: 0.9rem; color: #95a5a6;">Start by adding your first income or expense</p>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        transactionsList.innerHTML = sortedTransactions.map(transaction => {
            const categoryDisplay = transaction.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const transactionDate = new Date(transaction.date).toLocaleDateString('en-IN');
            
            return `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-details">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">${categoryDisplay} • ${transactionDate}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'expense' ? '-' : '+'}₹${transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div class="transaction-actions">
                        <button class="edit-btn" onclick="financeTracker.editTransaction(${transaction.id})">Edit</button>
                        <button class="delete-btn" onclick="financeTracker.deleteTransaction(${transaction.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    initCharts() {
        // Expense Pie Chart
        const expenseCtx = document.getElementById('expense-pie-chart').getContext('2d');
        this.expensePieChart = new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#9966FF', '#FF9F40', '#36A2EB'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Income vs Expense Bar Chart
        const barCtx = document.getElementById('income-expense-bar').getContext('2d');
        this.incomeExpenseBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: 'Amount (₹)',
                    data: [0, 0],
                    backgroundColor: ['#2ecc71', '#e74c3c']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Income vs Expenses'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
        
        this.updateCharts();
    }
    
    updateCharts() {
        this.updateExpensePieChart();
        this.updateIncomeExpenseBarChart();
    }
    
    updateExpensePieChart() {
        const expenses = this.transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            const category = expense.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
        });
        
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        
        this.expensePieChart.data.labels = labels;
        this.expensePieChart.data.datasets[0].data = data;
        this.expensePieChart.update();
    }
    
    updateIncomeExpenseBarChart() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        this.incomeExpenseBarChart.data.datasets[0].data = [totalIncome, totalExpenses];
        this.incomeExpenseBarChart.update();
    }
    
    // Utility Methods
    exportData() {
        const dataStr = JSON.stringify(this.transactions, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `finance_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
    
    clearAllData() {
        if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone!')) {
            this.transactions = [];
            this.saveToStorage();
            this.updateDisplay();
            this.updateCharts();
            alert('All data has been cleared.');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.financeTracker = new FinanceTracker();
});