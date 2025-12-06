function loadInvoices(filterText = "") {
  const list = JSON.parse(localStorage.getItem("invoices") || "[]");
  const tbody = document.querySelector("#invoiceTable tbody");
  tbody.innerHTML = "";

  const filtered = list.filter((inv) =>
    inv.invoice_no.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach((inv, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${inv.invoice_no}</td>
      <td>${inv.invoice_date}</td>
      <td>${inv.grand_total}</td>
      <td>${inv.status}</td>
      <td>
        <button class="view" onclick="editInvoice(${i})">View</button>
        <button class="del" onclick="deleteInvoice(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* OPEN INVOICE FOR EDIT */
function editInvoice(i) {
  localStorage.setItem("editInvoice", i);
  location.href = "invoice.html";
}

/* DELETE INVOICE */
function deleteInvoice(i) {
  let list = JSON.parse(localStorage.getItem("invoices") || "[]");
  list.splice(i, 1);
  localStorage.setItem("invoices", JSON.stringify(list));
  loadInvoices();
}

/* SEARCH EVENT LISTENER */
document.getElementById("searchBox").addEventListener("input", function () {
  loadInvoices(this.value);
});

/* INITIAL LOAD */
loadInvoices();

