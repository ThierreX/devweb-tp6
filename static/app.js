const originURL = ""; // same origin, empty string is fine
const form = document.getElementById("form");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const url = document.getElementById("url").value;
  try {
    const resp = await fetch("/api-v2/", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await resp.json();
    if (!resp.ok) {
      resultDiv.innerHTML = `<p>Error: ${data.message ?? JSON.stringify(data)}</p>`;
      return;
    }
    const shortURL = `${location.origin}/${data.short}`;
    resultDiv.innerHTML = `
      <p>Short URL: <a href="${shortURL}" target="_blank">${shortURL}</a></p>
      <p>Secret: <code>${data.secret}</code> <button id="copy">Copy</button></p>
    `;
    document.getElementById("copy").addEventListener("click", async () => {
      await navigator.clipboard.writeText(shortURL);
      alert("Copied!");
    });
  } catch (err) {
    resultDiv.textContent = err.message;
  }
});