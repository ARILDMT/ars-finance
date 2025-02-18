/*************************************************************
 * ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (ЛОКАЛЬНОЕ ХРАНИЛИЩЕ)
 *************************************************************/
let balance    = localStorage.getItem("balance") ? parseFloat(localStorage.getItem("balance")) : 0;
let transactions = localStorage.getItem("transactions") 
                  ? JSON.parse(localStorage.getItem("transactions")) 
                  : [];

let shifts     = localStorage.getItem("shifts") ? JSON.parse(localStorage.getItem("shifts")) : [];
let debts      = localStorage.getItem("debts")  ? JSON.parse(localStorage.getItem("debts"))  : [];
let credits    = localStorage.getItem("credits")? JSON.parse(localStorage.getItem("credits")): [];
let plannedPayments = localStorage.getItem("plannedPayments") ? JSON.parse(localStorage.getItem("plannedPayments")) : [];

// Не учитываем кредиты и долги в общем балансе
function calculateRealBalance() {
  return transactions.filter(t => !t.isDebtOrCredit).reduce((acc, curr) => {
    return acc + (curr.type === "income" ? curr.amount : -curr.amount);
  }, 0);
}

/*************************************************************
 * ИНИЦИАЛИЗАЦИЯ НА ГЛАВНОЙ СТРАНИЦЕ (index.html)
 *************************************************************/
window.addEventListener("load", () => {
  // Если есть элемент баланса на странице
  let balanceEl = document.getElementById("balance");
  if (balanceEl) {
    balanceEl.innerText = `$${balance.toFixed(2)}`;
  }

  // Если есть графики (barChart, lineChart)
  if (document.getElementById("barChart") && document.getElementById("lineChart")) {
    updateCharts();
  }

  // Если есть список смен (calendar.html)
  if (document.getElementById("shift-list")) {
    renderShifts();
  }

  // Если есть список долгов (debts.html)
  if (document.getElementById("debt-list")) {
    renderDebts();
  }

  // Если есть список кредитов (credits.html)
  if (document.getElementById("credit-list")) {
    renderCredits();
  }
});

/*************************************************************
 * МЕНЮ — ОТКРЫТИЕ/ЗАКРЫТИЕ
 *************************************************************/
function toggleMenu() {
  const menu = document.getElementById("menu-list");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

/*************************************************************
 * ТРАНЗАКЦИИ (доходы/расходы)
 *************************************************************/
// Вызывается при нажатии кнопки "Добавить" на transaction.html
function addTransactionFromPage() {
  let amount = parseFloat(document.getElementById("amount").value);
  let type   = document.getElementById("type").value;

  if (!amount || amount <= 0) {
    alert("Введите корректную сумму!");
    return;
  }

  addTransaction(amount, type);
  // Возвращаемся на главную
  window.location.href = "index.html";
}

// Универсальная функция добавления транзакции (используется и календарём)
function addTransaction(amount, type) {
  transactions.push({
    date: new Date().toLocaleDateString(),
    amount: amount,
    type: type
  });
  balance += (type === "income") ? amount : -amount;

  // Сохраняем
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("balance", balance);
}

/*************************************************************
 * ГРАФИКИ (на главной странице)
 *************************************************************/
function updateCharts() {
  // Готовим данные для графиков
  // Группируем транзакции по дате
  let dailyData = {};

  transactions.forEach(t => {
    // t.date уже в формате DD.MM.YYYY (зависит от локали)
    if (!dailyData[t.date]) {
      dailyData[t.date] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      dailyData[t.date].income += t.amount;
    } else {
      dailyData[t.date].expense += t.amount;
    }
  });

  // Превращаем объект в массив для графика
  let labels = Object.keys(dailyData);
  let incomeArr = labels.map(d => dailyData[d].income);
  let expenseArr = labels.map(d => dailyData[d].expense);

  // 1) Столбчатый график (Доходы vs Расходы)
  const barCtx = document.getElementById("barChart").getContext("2d");
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Income",
          data: incomeArr,
          backgroundColor: (context) => {
            const index = context.dataIndex;
            return index === context.dataset.data.length - 1 
              ? 'rgba(0, 122, 255, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)';
          },
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 1,
          borderRadius: 0,
          barPercentage: 0.2,
          maxBarThickness: 3
        },
        {
          label: "Expenses",
          data: expenseArr.map(val => -val),
          backgroundColor: (context) => {
            const index = context.dataIndex;
            return index === context.dataset.data.length - 1 
              ? 'rgba(88, 86, 214, 0.9)' 
              : 'rgba(180, 180, 180, 0.6)';
          },
          borderColor: 'rgba(180, 180, 180, 0.8)',
          borderWidth: 1,
          borderRadius: 0,
          barPercentage: 0.2,
          maxBarThickness: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#1d1d1f',
            font: {
              family: '-apple-system',
              size: 12,
              weight: '500'
            },
            padding: 20
          }
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.06)',
            drawBorder: false
          },
          ticks: {
            color: '#1d1d1f',
            font: {
              family: '-apple-system'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#1d1d1f',
            font: {
              family: '-apple-system'
            }
          }
        }
      }
    }
    options: { 
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333',
            font: {
              family: 'Inter',
              size: 12
            },
            padding: 20
          }
        }
      },
      scales: {
        y: {
          display: false,
          beginAtZero: true,
          grid: {
            display: false
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#333',
            font: {
              family: 'Inter'
            }
          }
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    }
  });

  // 2) Линейный график (Динамика баланса)
  // Построим массив балансов на каждую дату (в порядке добавления)
  let balanceHistory = [];
  let runningBalance = 0;
  let sortedByDate   = [...transactions];

  // Сортируем по дате, чтобы график шёл по хронологии
  // Но date — строка, лучше перевести в ISO. Или просто оставим как есть:
  // (Небольшое упрощение, если даты одинаковые, порядок может быть не идеален)
  sortedByDate.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  sortedByDate.forEach(t => {
    runningBalance += (t.type === "income") ? t.amount : -t.amount;
    balanceHistory.push(runningBalance);
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  new Chart(lineCtx, {
    type: "line",
    data: {
      labels: sortedByDate.map(t => t.date),
      datasets: [{
        label: "Баланс",
        data: balanceHistory,
        borderColor: "#00ffcc",
        backgroundColor: "rgba(0, 255, 204, 0.2)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#00ffcc",
        pointBorderColor: "#161616",
        pointBorderWidth: 2
      }]
    },
    options: { 
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333',
            font: {
              family: 'Inter',
              size: 12
            },
            padding: 20
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: '#333',
            font: {
              family: 'Inter'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#333',
            font: {
              family: 'Inter'
            }
          }
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    }
  });
}

/*************************************************************
 * КАЛЕНДАРЬ СМЕН (calendar.html)
 *************************************************************/
function addShift() {
  let date       = document.getElementById("shift-date").value;
  let hours      = parseFloat(document.getElementById("hours").value);
  let hourlyRate = parseFloat(document.getElementById("hourly-rate").value);

  if (!date || !hours || !hourlyRate) {
    alert("Заполните все поля!");
    return;
  }

  // Считаем доход
  let shiftIncome = hours * hourlyRate;

  // Добавляем как доход
  addTransaction(shiftIncome, "income");

  // Сохраняем смену
  shifts.push({
    date: date,
    hours: hours,
    hourlyRate: hourlyRate,
    total: shiftIncome
  });
  localStorage.setItem("shifts", JSON.stringify(shifts));

  // Обновляем список
  renderShifts();
}

// Отображаем список смен
function renderShifts() {
  let shiftList = document.getElementById("shift-list");
  if (!shiftList) return;

  shiftList.innerHTML = "";
  shifts.forEach((s, i) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <b>${s.date}</b> — ${s.hours} ч × $${s.hourlyRate} = $${s.total.toFixed(2)}
      <button onclick="removeShift(${i})">Удалить</button>
    `;
    shiftList.appendChild(li);
  });
}

// Удаляем смену
function removeShift(index) {
  // Если удаляем смену, нужно вернуть баланс назад?
  // Допустим, при удалении убираем из баланса доход:
  let shift = shifts[index];
  balance -= shift.total;
  localStorage.setItem("balance", balance);

  // Удаляем транзакцию, связанную с этой сменой (упрощённо, удаляем по сумме и дате)
  // В реальном проекте нужен ID, а не совпадение по сумме
  let idx = transactions.findIndex(t => 
    t.amount === shift.total && 
    t.type === "income" && 
    t.date === new Date(shift.date).toLocaleDateString()
  );
  if (idx >= 0) {
    transactions.splice(idx, 1);
  }

  // Обновляем хранилище
  shifts.splice(index, 1);
  localStorage.setItem("shifts", JSON.stringify(shifts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("balance", balance);

  // Перерисовываем
  renderShifts();
}

/*************************************************************
 * ДОЛГИ (debts.html)
 *************************************************************/
function addDebt() {
  let name = document.getElementById("debt-name").value;
  let amount = parseFloat(document.getElementById("debt-amount").value);
  let due = document.getElementById("debt-due").value;

  if (!name || !amount || !due) {
    alert("Заполните все поля для долга!");
    return;
  }

  debts.push({ name, amount, due });
  localStorage.setItem("debts", JSON.stringify(debts));

  // Добавляем долг как расход в транзакции
  addTransaction(amount, "expense");

  renderDebts();
}

function renderDebts() {
  let debtList = document.getElementById("debt-list");
  if (!debtList) return;

  debtList.innerHTML = "";
  debts.forEach((d, i) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <b>${d.name}</b> — $${d.amount.toFixed(2)} (до ${d.due})
      <button onclick="removeDebt(${i})">Погасить</button>
    `;
    debtList.appendChild(li);
  });
}

function removeDebt(index) {
  debts.splice(index, 1);
  localStorage.setItem("debts", JSON.stringify(debts));
  renderDebts();
}

/*************************************************************
 * КРЕДИТЫ (credits.html)
 *************************************************************/
function addCredit() {
  let name  = document.getElementById("credit-name").value;
  let amount= parseFloat(document.getElementById("credit-amount").value);
  let rate  = parseFloat(document.getElementById("credit-rate").value);

  if (!name || !amount || !rate) {
    alert("Заполните все поля для кредита!");
    return;
  }

  credits.push({ name, amount, rate });
  localStorage.setItem("credits", JSON.stringify(credits));

  // Добавляем кредит как доход в транзакции
  addTransaction(amount, "income");

  renderCredits();
}

function renderCredits() {
  let creditList = document.getElementById("credit-list");
  if (!creditList) return;

  creditList.innerHTML = "";
  credits.forEach((c, i) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <b>${c.name}</b> — $${c.amount.toFixed(2)}, 
      ставка: ${c.rate}%
      <button onclick="removeCredit(${i})">Закрыть</button>
    `;
    creditList.appendChild(li);
  });
}

function removeCredit(index) {
  credits.splice(index, 1);
  localStorage.setItem("credits", JSON.stringify(credits));
  renderCredits();
}

/*************************************************************
 * ПЛАНИРУЕМЫЕ ПЛАТЕЖИ
 *************************************************************/
function addPlannedPayment() {
  let name = document.getElementById("planned-name").value;
  let amount = parseFloat(document.getElementById("planned-amount").value);
  let date = document.getElementById("planned-date").value;
  let type = document.getElementById("planned-type").value;
  let recurring = document.getElementById("planned-recurring").checked;

  if (!name || !amount || !date) {
    alert("Заполните все поля!");
    return;
  }

  plannedPayments.push({
    name,
    amount,
    date,
    type,
    recurring,
    paid: false
  });

  localStorage.setItem("plannedPayments", JSON.stringify(plannedPayments));
  renderPlannedPayments();
}

function renderPlannedPayments() {
  let plannedList = document.getElementById("planned-list");
  if (!plannedList) return;

  plannedList.innerHTML = "";

  // Сортируем по дате
  plannedPayments.sort((a, b) => new Date(a.date) - new Date(b.date));

  plannedPayments.forEach((p, i) => {
    let li = document.createElement("li");
    li.classList.add(p.type);
    li.innerHTML = `
      <b>${p.name}</b> — $${p.amount.toFixed(2)}
      <br>
      ${new Date(p.date).toLocaleDateString()} 
      ${p.recurring ? '(ежемесячно)' : ''}
      <button onclick="removePlannedPayment(${i})">${p.paid ? 'Удалить' : 'Оплатить'}</button>
    `;
    plannedList.appendChild(li);
  });

  // Обновляем сводку на главной
  updateSummary();
}

function removePlannedPayment(index) {
  const payment = plannedPayments[index];

  if (!payment.paid) {
    // Добавляем в транзакции как расход
    addTransaction(payment.amount, "expense");

    // Если повторяющийся платёж, создаём следующий
    if (payment.recurring) {
      const nextDate = new Date(payment.date);
      nextDate.setMonth(nextDate.getMonth() + 1);
      plannedPayments.push({
        ...payment,
        date: nextDate.toISOString().split('T')[0]
      });
    }
  }

  plannedPayments.splice(index, 1);
  localStorage.setItem("plannedPayments", JSON.stringify(plannedPayments));
  renderPlannedPayments();
}

function updateSummary() {
  // Обновляем суммы на главной странице
  const creditsTotal = document.getElementById("credits-total");
  const debtsTotal = document.getElementById("debts-total");
  const plannedTotal = document.getElementById("planned-total");

  if (creditsTotal) {
    creditsTotal.innerText = `$${credits.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}`;
  }
  if (debtsTotal) {
    debtsTotal.innerText = `$${debts.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}`;
  }
  if (plannedTotal) {
    plannedTotal.innerText = `$${plannedPayments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}`;
  }
}