let balance = localStorage.getItem("balance") ? parseFloat(localStorage.getItem("balance")) : 0;
let history = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")) : [];

document.getElementById("balance").innerText = `Баланс: ${balance} ₽`;
updateHistory();

function addTransaction() {
    let amount = parseFloat(document.getElementById("amount").value);
    let type = document.getElementById("type").value;

    if (!amount || amount <= 0) {
        alert("Введите корректную сумму!");
        return;
    }

    if (type === "income") {
        balance += amount;
        history.push(`+${amount} ₽ (Доход)`);
    } else {
        balance -= amount;
        history.push(`-${amount} ₽ (Расход)`);
    }

    // Сохраняем данные
    localStorage.setItem("balance", balance);
    localStorage.setItem("history", JSON.stringify(history));

    document.getElementById("balance").innerText = `Баланс: ${balance} ₽`;
    updateHistory();

    document.getElementById("amount").value = "";
}

function updateHistory() {
    let historyList = document.getElementById("history");
    historyList.innerHTML = "";
    history.forEach(item => {
        let li = document.createElement("li");
        li.innerText = item;
        historyList.appendChild(li);
    });
}