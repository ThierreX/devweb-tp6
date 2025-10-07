const originURL = window.origin || "http://localhost:8080";
const endpoint = `${originURL}/api-v2/`;

const form = document.getElementById("submit-link");
const resultDiv = document.getElementById("result");
const shortUrlP = document.getElementById("shortUrl");
const copyBtn = document.getElementById("copyBtn");
const tokenInfo = document.getElementById("tokenInfo");
const errorDiv = document.getElementById("error");
const deleteBtn = document.getElementById("deleteBtn");
const deleteMsg = document.getElementById("deleteMsg");
const deleteTokenInput = document.getElementById("deleteToken");

let currentShort = null;

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const url = document.getElementById("url").value;
  errorDiv.style.display = "none";
  deleteMsg.style.display = "none";
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));

    currentShort = data.short;

    const shortUrl = data.shortUrl || `${originURL}/${data.short}`;
    shortUrlP.innerHTML = `<a href="${shortUrl}" target="_blank" rel="noopener">${shortUrl}</a>`;
    tokenInfo.textContent = `Token de suppression (gardez-le précieusement): ${data.token}`;
    resultDiv.style.display = "block";
  } catch (e) {
    errorDiv.style.display = "block";
    errorDiv.textContent = "Erreur: " + e.message;
  }
});

copyBtn.addEventListener("click", () => {
  const text = shortUrlP.textContent;
  navigator.clipboard.writeText(text).then(
    () => (copyBtn.textContent = "Copié !"),
    () => (copyBtn.textContent = "Échec copie")
  );
});

deleteBtn.addEventListener("click", async () => {
  deleteMsg.style.display = "none";
  const token = deleteTokenInput.value.trim();

  if (!currentShort) {
    deleteMsg.style.display = "block";
    deleteMsg.style.color = "red";
    deleteMsg.textContent = "Aucun lien à supprimer.";
    return;
  }
  if (!token) {
    deleteMsg.style.display = "block";
    deleteMsg.style.color = "red";
    deleteMsg.textContent = "Veuillez entrer le token de suppression.";
    return;
  }

  if (!confirm("Voulez-vous vraiment supprimer ce lien ?")) return;

  try {
    const res = await fetch(`${endpoint}${currentShort}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.status === 204 || res.status === 200) {
      deleteMsg.style.display = "block";
      deleteMsg.style.color = "green";
      deleteMsg.textContent = "Lien supprimé avec succès.";
      resultDiv.style.display = "none";
      deleteTokenInput.value = "";
    } else {
      const data = await res.json().catch(() => ({}));
      deleteMsg.style.display = "block";
      deleteMsg.style.color = "red";
      deleteMsg.textContent =
        data.error ? `Erreur: ${data.error}` : `Suppression échouée (${res.status})`;
    }
  } catch (e) {
    deleteMsg.style.display = "block";
    deleteMsg.style.color = "red";
    deleteMsg.textContent = "Erreur réseau: " + e.message;
  }
});
