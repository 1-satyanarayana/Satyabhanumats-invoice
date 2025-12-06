<script type="module">
  // 1. Import Firebase modules
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  // 2. Firebase config
  const firebaseConfig = {
      apiKey: "AIzaSyAw3SzDoNomodN-ciAvv_fXZy3h12NtqJw",
      authDomain: "student-portal-4054b.firebaseapp.com",
      projectId: "student-portal-4054b",
      storageBucket: "student-portal-4054b.appspot.com",
      messagingSenderId: "240497881431",
      appId: "1:240497881431:web:51448c19b14c841fb10e12"
  };

  // 3. Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 4. Load invoices from Firestore
  async function loadInvoices(filterText = "") {
    const tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    let invoicesRef = collection(db, "invoices");
    let q;

    if (filterText.trim() !== "") {
      q = query(invoicesRef, where("invoice_no", ">=", filterText), where("invoice_no", "<=", filterText + "\uf8ff"));
    } else {
      q = invoicesRef;
    }

    const querySnapshot = await getDocs(q);
    let i = 1;
    querySnapshot.forEach((docSnap) => {
      const inv = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i++}</td>
        <td>${inv.invoice_no}</td>
        <td>${inv.invoice_date}</td>
        <td>${inv.grand_total}</td>
        <td>${inv.status}</td>
        <td>
          <button class="view" onclick="editInvoice('${docSnap.id}')">View</button>
          <button class="del" onclick="deleteInvoice('${docSnap.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 5. Open invoice for edit
  window.editInvoice = function(id) {
    localStorage.setItem("editInvoiceId", id);
    location.href = "invoice.html";
  };

  // 6. Delete invoice
  window.deleteInvoice = async function(id) {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await deleteDoc(doc(db, "invoices", id));
      loadInvoices();
    }
  };

  // 7. Search event
  document.getElementById("searchBox").addEventListener("input", function () {
    loadInvoices(this.value);
  });

  // 8. Initial load
  loadInvoices();
</script>
