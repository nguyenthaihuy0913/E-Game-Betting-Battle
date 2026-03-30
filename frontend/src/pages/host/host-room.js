// room.js

document.addEventListener("DOMContentLoaded", () => {
  // Stagger animation for player chips
  const chips = document.querySelectorAll('.hr-player-chip');
  chips.forEach((chip, i) => {
    chip.style.animationDelay = `${i * 0.1}s`;
  });
});

function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btnElement.innerText;
    btnElement.innerText = "Copied!";
    btnElement.style.background = "var(--mint)";
    
    // Using toast from main.js if available
    if (typeof toast === "function") {
      toast("✅ Copied to clipboard!");
    }
    
    setTimeout(() => {
      btnElement.innerText = originalText;
      btnElement.style.background = ""; // Reset to CSS defined
    }, 2000);
  });
}

function selectMode(element) {
  document.querySelectorAll('.hr-mode-opt').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  
  if (typeof toast === "function") {
    const modeName = element.querySelector('.hr-mode-title').innerText.trim().replace(/^.+?\s/, '');
    toast(`⚙️ Changed to: ${modeName}`);
  }
}

function leaveRoom() {
  const modal = document.getElementById("leaveModal");
  if (modal) {
    modal.classList.add("show");
  } else {
    // Fallback
    if (confirm("Are you sure you want to leave the room? The game will be canceled.")) {
      window.location.href = "../../../index.html";
    }
  }
}

function closeLeaveModal() {
  const modal = document.getElementById("leaveModal");
  if (modal) {
    modal.classList.remove("show");
  }
}

function confirmLeaveRoom() {
  window.location.href = "../../../index.html";
}

function launchGame() {
  if (typeof toast === "function") {
    toast("🚀 Launching Game... (Coming soon)");
  }
}
