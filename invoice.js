/* ----------- Date Set --------- */
const dateEl = document.getElementById('invDate');
if (dateEl.innerText.trim() === "") {
  dateEl.innerText = new Date().toLocaleDateString('en-GB');
}

/* -------- Converters ---------- */
function toNumber(v) {
  const n = parseFloat(String(v).replace(/[₹, ]/g, ""));
  return isNaN(n) ? 0 : n;
}
function formatINR(n){
  return "₹ " + Number(n).toFixed(2);
}

/* -------- Calc Function -------- */
function recalc(){
  let sub = 0;
  const rows = document.querySelectorAll("#itemsTable tbody tr");

  rows.forEach((tr,i)=>{
    tr.children[0].innerText = i+1;

    const rate = toNumber(tr.children[3].innerText);
    const qty  = toNumber(tr.children[4].innerText);

    const amount = rate * qty;
    tr.children[6].innerText = amount.toFixed(2);

    sub += amount;
  });

  const sgst = sub * 0.09;
  const cgst = sub * 0.09;
  const total = sub + sgst + cgst;
  const rounded = Math.round(total);

  document.getElementById("subTotal").innerText = formatINR(sub);
  document.getElementById("sgst").innerText = formatINR(sgst);
  document.getElementById("cgst").innerText = formatINR(cgst);
  document.getElementById("roundOff").innerText = formatINR(rounded-total);
  document.getElementById("grandTotal").innerText = formatINR(rounded);
}

/* ------- Add Row ------ */
document.getElementById("addRow").addEventListener("click", ()=>{
  const tbody = document.querySelector("#itemsTable tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td></td>
    <td contenteditable>New item</td>
    <td contenteditable>HSN</td>
    <td contenteditable>0</td>
    <td contenteditable>1</td>
    <td contenteditable>18</td>
    <td>0.00</td>
    <td><button class="remove">Del</button></td>
  `;

  tbody.appendChild(tr);
  recalc();
});

/* ------- Delete Row ------ */
document.addEventListener("click", e =>{
  if(e.target.classList.contains("remove")){
    e.target.closest("tr").remove();
    recalc();
  }
});

/* -------- Auto Recalc ------ */
document.querySelector("#itemsTable tbody").addEventListener("input", recalc);

/* ------- Export PNG ------- */
document.getElementById("exportPng").addEventListener("click", ()=>{
  html2canvas(document.querySelector("#invoiceArea"),{scale:2})
  .then(canvas=>{
    const a=document.createElement("a");
    a.href=canvas.toDataURL("image/png");
    a.download="SBmats-Invoice.png";
    a.click();
  });
});

/* ------- Download PDF ------ */
document.getElementById("downloadPdf").addEventListener("click", ()=>{
  html2canvas(document.getElementById("invoiceArea"),{scale:2}).then(canvas=>{
    const img=canvas.toDataURL("image/png");
    const pdf=new jspdf.jsPDF('p','mm','a4');
    const w=pdf.internal.pageSize.getWidth();
    const h=canvas.height * w / canvas.width;
    pdf.addImage(img,'PNG',0,0,w,h);
    pdf.save("SatyaBhanumats-invoice.pdf");
  });
});

/* ------- Mark Paid -------- */
document.getElementById("togglePaid").addEventListener("click", ()=>{
  const st = document.getElementById("stamp");
  if(st.classList.contains("paid")){
    st.classList.remove("paid"); st.classList.add("unpaid");
    st.innerText = "NOT PAID";
  } else {
    st.classList.remove("unpaid"); st.classList.add("paid");
    st.innerText = "PAID";
  }
});

/* -------- SAVE INVOICE -------- */
document.getElementById("saveInvoice").addEventListener("click",()=>{
  const rows=[...document.querySelectorAll("#itemsTable tbody tr")].map(tr=>({
    item: tr.children[1].innerText,
    hsn: tr.children[2].innerText,
    rate: tr.children[3].innerText,
    qty: tr.children[4].innerText,
    gst: tr.children[5].innerText,
    amount: tr.children[6].innerText
  }));

  const invoice={
    invoice_no: document.getElementById("invNo").innerText,
    invoice_date: document.getElementById("invDate").innerText,
    billing_address: document.querySelector(".card:nth-child(1) div").innerText,
    shipping_address: document.querySelector(".card:nth-child(2) div").innerText,
    items: rows,
    sub_total: document.getElementById("subTotal").innerText,
    sgst: document.getElementById("sgst").innerText,
    cgst: document.getElementById("cgst").innerText,
    round_off: document.getElementById("roundOff").innerText,
    grand_total: document.getElementById("grandTotal").innerText,
    status: document.getElementById("stamp").classList.contains("paid") ? "PAID" : "NOT PAID"
  };

  let list = JSON.parse(localStorage.getItem("invoices") || "[]");
  const editId = localStorage.getItem("editInvoice");

  if(editId !== null){
    list[editId] = invoice;
    localStorage.removeItem("editInvoice");
  } else {
    list.push(invoice);
  }

  localStorage.setItem("invoices", JSON.stringify(list));
  alert("Invoice saved!");
});

/* If editing invoice */
window.onload = ()=>{
  const id = localStorage.getItem("editInvoice");
  if(id === null) return;

  const list = JSON.parse(localStorage.getItem("invoices") || "[]");
  const inv = list[id];
  if(!inv) return;

  // load everything
  document.getElementById("invNo").innerText = inv.invoice_no;
  document.getElementById("invDate").innerText = inv.invoice_date;
  document.querySelector(".card:nth-child(1) div").innerText = inv.billing_address;
  document.querySelector(".card:nth-child(2) div").innerText = inv.shipping_address;

  const tbody=document.querySelector("#itemsTable tbody");
  tbody.innerHTML="";
  inv.items.forEach((it,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${i+1}</td>
      <td contenteditable>${it.item}</td>
      <td contenteditable>${it.hsn}</td>
      <td contenteditable>${it.rate}</td>
      <td contenteditable>${it.qty}</td>
      <td contenteditable>${it.gst}</td>
      <td>${it.amount}</td>
      <td><button class='remove'>Del</button></td>
    `;
    tbody.appendChild(tr);
  });

  recalc();
};
