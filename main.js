import { startAdventureGame,resetAdventure } from './adventure.js';
// import { startFishingGame } from 'fishing.js';
// import { startRuralGame } from './rural.js'; // Uncomment when rural game is ready


function returnToMenu() {
  // Stop animations & reset state
  resetAdventure();

  // Hide all games
  ["adventure-game", "fishing-game", "rural-game"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // Show main menu
  const menu = document.getElementById("main-menu");
  if (menu) menu.style.display = "block";
}


// === Global bindings for buttons ===
window.startAdventureGame = () => {
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("adventure-game").style.display = "block";
  startAdventureGame();
};

window.startFishingGame = () => {
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("fishing-game").style.display = "block";
  startFishingGame();
};

// window.startRuralGame = () => {
//   document.getElementById("main-menu").style.display = "none";
//   document.getElementById("rural-game").style.display = "block";
//   startRuralGame();
// };

window.returnToMenu = returnToMenu;
