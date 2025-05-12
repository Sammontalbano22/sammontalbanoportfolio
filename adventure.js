  
  
  
    // DOM References from refactoring
const mainMenu = document.getElementById("main-menu");
const fishingGame = document.getElementById("fishing-game");
const ruralGame = document.getElementById("rural-game");
const adventureGame = document.getElementById("adventure-game");
// canvas
const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");


//Game State
const rocket = { x: 700, y: 520, w: 20, h: 60, color: "#FFD700", speed: 5, dx: 0, dy: 0 };
const obstacles = [];
let moonReached = false;
let adventureFrameId = null;
let scrollOffset = 0;
let countdownTime = 20; // seconds until moon appears
let countdownStarted = false;
let countdownInterval = null;
let moonAvailable = false;
let stars = [];
let gameTime = 0; // Time since gameplay started, in frames
let moonLandingTriggered = false;
let moonLandingDelayStarted = false;



  
function drawRocket() {
  /**
   * Draws the rocket on the canvas with a gradient and flame effect.
   * The rocket is drawn with a body, nose cone, side fins, and an exhaust flame.
   * The rocket's position is determined by its x and y properties.
   * The rocket's color and gradient are customizable.
   * The rocket's exhaust flame is animated with flicker and layers.
   **/
  gameCtx.save(); 
  gameCtx.translate(rocket.x + rocket.w / 2, rocket.y + rocket.h / 2); // starts with rocket in center of screen

  // === Rocket Body with Gradient ===
  const bodyGradient = gameCtx.createLinearGradient(0, -rocket.h / 2, 0, rocket.h / 2); // vertical gradient
  bodyGradient.addColorStop(0, "#FFFACD"); // light yellow top
  bodyGradient.addColorStop(1, "#FFD700"); // gold bottom

  gameCtx.fillStyle = bodyGradient;
  gameCtx.beginPath();
  gameCtx.moveTo(-rocket.w / 2, -rocket.h / 2);
  gameCtx.lineTo(rocket.w / 2, -rocket.h / 2);
  gameCtx.lineTo(rocket.w / 2, rocket.h / 2);
  gameCtx.lineTo(-rocket.w / 2, rocket.h / 2);
  gameCtx.closePath();
  gameCtx.fill();

  // === Nose Cone ===
  const coneGradient = gameCtx.createLinearGradient(0, -rocket.h, 0, -rocket.h / 2);
  coneGradient.addColorStop(0, "#FF6347"); // tomato red
  coneGradient.addColorStop(1, "#FF4500"); // darker red

  gameCtx.fillStyle = coneGradient;
  gameCtx.beginPath();
  gameCtx.moveTo(-rocket.w / 2, -rocket.h / 2);
  gameCtx.lineTo(0, -rocket.h);
  gameCtx.lineTo(rocket.w / 2, -rocket.h / 2);
  gameCtx.closePath();
  gameCtx.fill();

  // === Side Fins ===
  gameCtx.fillStyle = "#DC143C"; // crimson
  gameCtx.beginPath(); // left fin
  gameCtx.moveTo(-rocket.w / 2, rocket.h / 2);
  gameCtx.lineTo(-rocket.w * 0.75, rocket.h * 0.4);
  gameCtx.lineTo(-rocket.w / 2, rocket.h * 0.25);
  gameCtx.closePath();
  gameCtx.fill();

  gameCtx.beginPath(); // right fin
  gameCtx.moveTo(rocket.w / 2, rocket.h / 2);
  gameCtx.lineTo(rocket.w * 0.75, rocket.h * 0.4);
  gameCtx.lineTo(rocket.w / 2, rocket.h * 0.25);
  gameCtx.closePath();
  gameCtx.fill();

  // === Window with Shadow ===
  gameCtx.fillStyle = "#87CEEB";
  gameCtx.beginPath();
  gameCtx.arc(0, -rocket.h / 3, rocket.w / 4, 0, Math.PI * 2);
  gameCtx.fill();

  gameCtx.strokeStyle = "#1E90FF"; // dodger blue outline
  gameCtx.lineWidth = 2;
  gameCtx.stroke();

  // === Exhaust Flame with Flicker & Layers ===
  if (!moonReached) {
    const flameHeight = Math.random() * 10 + 15;
    const flameWidth = rocket.w / 2;

    // Outer flame (yellow-orange)
    gameCtx.fillStyle = "#FFA500";
    gameCtx.beginPath();
    gameCtx.moveTo(-flameWidth / 2, rocket.h / 2);
    gameCtx.lineTo(0, rocket.h / 2 + flameHeight);
    gameCtx.lineTo(flameWidth / 2, rocket.h / 2);
    gameCtx.closePath();
    gameCtx.fill();

    // Inner flame (white core)
    gameCtx.fillStyle = "#FFFFE0";
    gameCtx.beginPath();
    gameCtx.moveTo(-flameWidth / 4, rocket.h / 2);
    gameCtx.lineTo(0, rocket.h / 2 + flameHeight / 1.5);
    gameCtx.lineTo(flameWidth / 4, rocket.h / 2);
    gameCtx.closePath();
    gameCtx.fill();
  }

  gameCtx.restore();
}


function playLaunchAnimation(callback) {
  /**
   * Plays the launch animation of the rocket, transitioning from Earth to space.
   * The animation includes a sky gradient, ground scenery fade-out,
   * rocket movement, flame trail, and star field.
   * there is a delay between animation and when obstacles appear.
   * */

  let launchY = gameCanvas.height - 120;

  let frameCount = 0;
  const totalFrames = 100; // ~3 seconds at 30 FPS
  const flameColors = ["#FF6B00", "#FFA500", "#FFFF00", "#FF4500"];

  const launchInterval = setInterval(() => {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // === 1. Interpolate sky from Earth to space ===
    const progress = frameCount / totalFrames; // 0.0 to 1.0
    const topSkyColor = blendColor("#87CEEB", "#000000", progress); // light blue to black
    const bottomSkyColor = blendColor("#f0f8ff", "#011627", progress); // blue-white to deep navy

    const skyGradient = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
    rocket.x = (gameCanvas.width - rocket.w) / 2; // Center the rocket horizontally
    skyGradient.addColorStop(0, topSkyColor);
    skyGradient.addColorStop(1, bottomSkyColor);
    gameCtx.fillStyle = skyGradient;
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // === 2. Fade out ground scenery ===
    if (progress < 0.6) {
      const groundOpacity = 1 - progress / 0.6;
      gameCtx.fillStyle = `rgba(46, 139, 87, ${groundOpacity})`; // #2E8B57 with fade
      gameCtx.beginPath();
      gameCtx.moveTo(0, gameCanvas.height - 80);
      gameCtx.bezierCurveTo(
        gameCanvas.width * 0.25, gameCanvas.height - 110,
        gameCanvas.width * 0.75, gameCanvas.height - 50,
        gameCanvas.width, gameCanvas.height - 80
      );
      gameCtx.lineTo(gameCanvas.width, gameCanvas.height);
      gameCtx.lineTo(0, gameCanvas.height);
      gameCtx.closePath();
      gameCtx.fill();
    }

    // === 3. Rocket Position ===
    rocket.y = launchY;
    drawRocket();

    // === 4. Flame Trail ===
    const flameHeight = 20 + Math.random() * 15;
    const flameWidth = rocket.w * (1.2 + Math.random() * 0.5);
    const flameX = rocket.x - (flameWidth - rocket.w) / 2;
    const flameY = rocket.y + rocket.h;

    gameCtx.fillStyle = flameColors[frameCount % flameColors.length];
    gameCtx.beginPath();
    gameCtx.moveTo(flameX, flameY);
    gameCtx.lineTo(flameX + flameWidth / 2, flameY + flameHeight);
    gameCtx.lineTo(flameX + flameWidth, flameY);
    gameCtx.closePath();
    gameCtx.fill();

    // === 5. Smoke trail (low opacity puff) ===
    if (frameCount % 2 === 0) {
      const puffX = rocket.x + rocket.w / 2 + (Math.random() * 20 - 10);
      const puffY = flameY + flameHeight + Math.random() * 10;
      const radius = 5 + Math.random() * 5;
      gameCtx.fillStyle = "rgba(200, 200, 200, 0.15)";
      gameCtx.beginPath();
      gameCtx.arc(puffX, puffY, radius, 0, Math.PI * 2);
      gameCtx.fill();
    }

    // === 6. Star Field once in space ===
    if (progress > 0.8) {
      for (let i = 0; i < 30; i++) {
        const starX = Math.random() * gameCanvas.width;
        const starY = Math.random() * gameCanvas.height;
        const starSize = Math.random() * 2;
        gameCtx.fillStyle = "white";
        gameCtx.fillRect(starX, starY, starSize, starSize);
      }
    }

    // === 7. Move rocket upward ===
    launchY -= 2.5;
    frameCount++;

    if (frameCount >= totalFrames) {
      clearInterval(launchInterval);
      callback(); // Proceed to game
    }

  }, 30);
}

// === Utility: Blend two hex colors ===
function blendColor(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

// === Utility: Convert hex to RGB object ===
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}




  // Draw Meteor
  function drawMeteor(x, y, w, h) {
    gameCtx.save();
    gameCtx.translate(x + w / 2, y + h / 2);
    gameCtx.rotate(Math.sin(y / 20) * 0.1);
    gameCtx.translate(-(x + w / 2), -(y + h / 2));
    const gradient = gameCtx.createRadialGradient(x + w / 2, y + h / 2, 5, x + w / 2, y + h / 2, w);
    gradient.addColorStop(0, "#ffcc66");
    gradient.addColorStop(1, "#993300");
    gameCtx.fillStyle = gradient;
    gameCtx.beginPath();
    gameCtx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    gameCtx.fill();
    gameCtx.fillStyle = "#662200";
    for (let i = 0; i < 3; i++) {
      gameCtx.beginPath();
      gameCtx.arc(x + Math.random() * w, y + Math.random() * h, 2 + Math.random() * 2, 0, Math.PI * 2);
      gameCtx.fill();
    }
    gameCtx.restore();
  }

  // Optional fallback alien
 function drawAlien(x, y, w, h) {
  gameCtx.save();
  gameCtx.translate(x + w / 2, y + h / 2);

  // Glow effect
  const glow = gameCtx.createRadialGradient(0, 0, 5, 0, 0, 25);
  glow.addColorStop(0, "rgba(0,255,100,0.5)");
  glow.addColorStop(1, "rgba(0,255,100,0)");

  gameCtx.fillStyle = glow;
  gameCtx.beginPath();
  gameCtx.arc(0, 0, 25, 0, Math.PI * 2);
  gameCtx.fill();

  // Saucer base
  gameCtx.fillStyle = "#ccc";
  gameCtx.beginPath();
  gameCtx.ellipse(0, 0, w / 1.2, h / 2, 0, 0, Math.PI * 2);
  gameCtx.fill();

  // Dome
  gameCtx.fillStyle = "#8ff";
  gameCtx.beginPath();
  gameCtx.ellipse(0, -h / 2.2, w / 3, h / 2.2, 0, 0, Math.PI * 2);
  gameCtx.fill();

  // Bottom lights
  for (let i = -2; i <= 2; i++) {
    gameCtx.fillStyle = i % 2 === 0 ? "#ff0" : "#f0f";
    gameCtx.beginPath();
    gameCtx.arc(i * (w / 6), h / 3.5, 3, 0, Math.PI * 2);
    gameCtx.fill();
  }

  gameCtx.restore();
}


  function drawObstacles() {
  const speedMultiplier = Math.min(1, gameTime / 180);
// Ease in over 3 seconds (180 frames at 60fps)

  obstacles.forEach(obs => {
    obs.y += obs.speed * speedMultiplier;

    if (obs.y > gameCanvas.height) {
      obs.y = -10;
      obs.x = Math.random() * (gameCanvas.width - obs.w);
    }

    if (obs.type === 'meteor') {
      drawMeteor(obs.x, obs.y, obs.w, obs.h);
    } else {
      drawAlien(obs.x, obs.y, obs.w, obs.h);
    }
  });
}


  // Background
  function drawBackground() {
  const gradient = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
  gradient.addColorStop(0, "#000010");
  gradient.addColorStop(0.5, "#0a001a");
  gradient.addColorStop(1, "#000000");
  gameCtx.fillStyle = gradient;
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Natural star field
  stars.forEach(star => {
    star.y += star.speed; // slowly move down
    if (star.y > gameCanvas.height) {
      star.y = 0;
      star.x = Math.random() * gameCanvas.width;
    }
    gameCtx.beginPath();
    gameCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    gameCtx.fillStyle = star.color;
    gameCtx.globalAlpha = Math.random() * 0.8 + 0.2; // twinkle effect
    gameCtx.fill();
    gameCtx.globalAlpha = 1.0;
  });
}

  // Draw Moon & Trigger Bio
  function drawMoon() {
  if (!moonAvailable) return;

  const centerX = gameCanvas.width / 2;
  const centerY = 100;
  const radius = 40;

  // Draw glowing moon
  const gradient = gameCtx.createRadialGradient(centerX - 10, centerY - 10, 10, centerX, centerY, radius);
  gradient.addColorStop(0, '#eee');
  gradient.addColorStop(1, '#999');

  gameCtx.beginPath();
  gameCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  gameCtx.fillStyle = gradient;
  gameCtx.shadowColor = '#ccc';
  gameCtx.shadowBlur = 15;
  gameCtx.fill();
  gameCtx.shadowBlur = 0;

  // Optional: Draw small craters for effect
  for (let i = 0; i < 6; i++) {
    const craterX = centerX + Math.random() * 60 - 30;
    const craterY = centerY + Math.random() * 40 - 20;
    const craterR = Math.random() * 5 + 2;
    gameCtx.fillStyle = "#777";
    gameCtx.beginPath();
    gameCtx.arc(craterX, craterY, craterR, 0, Math.PI * 2);
    gameCtx.fill();
  }

  // Check if rocket is close enough to start the landing
  const dx = rocket.x + rocket.w / 2 - centerX;
  const dy = rocket.y + rocket.h / 2 - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (!moonLandingTriggered && distance < radius + 10) {
    moonLandingTriggered = true;

    if (!moonLandingDelayStarted) {
      moonLandingDelayStarted = true;
      setTimeout(() => {
        playMoonLandingAnimation(showMoonBio);
      }, 500); // 1.5 seconds delay before animation starts
    }
  }
}

function playMoonLandingAnimation(callback) {
  let frame = 0;
  const totalFrames = 300; // Adjusted for 5 seconds at 60 FPS
  const startY = -100;
  const endY = 100; // moon surface
  const centerX = gameCanvas.width / 2;
  rocket.x = centerX - rocket.w / 2;
  rocket.y = startY;

  function animate() {
    clearAdventure();

    // Draw detailed sky with gradient and stars
    const skyGradient = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
    skyGradient.addColorStop(0, "#000010");
    skyGradient.addColorStop(1, "#1a001a");
    gameCtx.fillStyle = skyGradient;
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw stars with twinkling effect
    stars.forEach(star => {
      gameCtx.beginPath();
      gameCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      gameCtx.fillStyle = star.color;
      gameCtx.globalAlpha = Math.random() * 0.8 + 0.2; // twinkle effect
      gameCtx.fill();
      gameCtx.globalAlpha = 1.0;
    });

    // Draw moon surface with craters, texture, and glow
    const moonGradient = gameCtx.createRadialGradient(centerX, endY + 60, 50, centerX, endY + 60, 150);
    moonGradient.addColorStop(0, "#aaa");
    moonGradient.addColorStop(1, "#666");
    gameCtx.fillStyle = moonGradient;
    gameCtx.beginPath();
    gameCtx.arc(centerX, endY + 60, 120, 0, Math.PI, true);
    gameCtx.fill();

    // Add craters to the moon
    for (let i = 0; i < 8; i++) {
      const craterX = centerX + Math.random() * 200 - 100;
      const craterY = endY + 60 + Math.random() * 50 - 25;
      const craterRadius = Math.random() * 15 + 5;
      gameCtx.fillStyle = "#444";
      gameCtx.beginPath();
      gameCtx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
      gameCtx.fill();
    }

    // Add moon surface texture
    for (let i = 0; i < 20; i++) {
      const textureX = centerX + Math.random() * 240 - 120;
      const textureY = endY + 60 + Math.random() * 80 - 40;
      const textureWidth = Math.random() * 10 + 2;
      const textureHeight = Math.random() * 5 + 1;
      gameCtx.fillStyle = "#777";
      gameCtx.fillRect(textureX, textureY, textureWidth, textureHeight);
    }

    // Add glowing effect around the moon
    gameCtx.shadowColor = "#ccc";
    gameCtx.shadowBlur = 20;
    gameCtx.beginPath();
    gameCtx.arc(centerX, endY + 60, 130, 0, Math.PI, true);
    gameCtx.fill();
    gameCtx.shadowBlur = 0;

    // Animate rocket descending with exhaust trail
    const t = frame / totalFrames;
    rocket.y = startY + (endY - startY) * easeOutCubic(t);
    drawRocket();

    // Add exhaust trail
    if (frame < totalFrames) {
      const flameHeight = Math.random() * 20 + 10;
      const flameWidth = rocket.w * (1.2 + Math.random() * 0.5);
      const flameX = rocket.x - (flameWidth - rocket.w) / 2;
      const flameY = rocket.y + rocket.h;

      const flameGradient = gameCtx.createLinearGradient(flameX, flameY, flameX, flameY + flameHeight);
      flameGradient.addColorStop(0, "#FF4500");
      flameGradient.addColorStop(1, "#FFA500");
      gameCtx.fillStyle = flameGradient;
      gameCtx.beginPath();
      gameCtx.moveTo(flameX, flameY);
      gameCtx.lineTo(flameX + flameWidth / 2, flameY + flameHeight);
      gameCtx.lineTo(flameX + flameWidth, flameY);
      gameCtx.closePath();
      gameCtx.fill();
    }

    // Add smoke trail
    if (frame % 5 === 0) {
      const puffX = rocket.x + rocket.w / 2 + (Math.random() * 20 - 10);
      const puffY = rocket.y + rocket.h + Math.random() * 10;
      const radius = 5 + Math.random() * 5;
      gameCtx.fillStyle = "rgba(200, 200, 200, 0.2)";
      gameCtx.beginPath();
      gameCtx.arc(puffX, puffY, radius, 0, Math.PI * 2);
      gameCtx.fill();
    }

    frame++;
    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      callback(); // show bio
    }
  }

  animate();
}

function easeOutCubic(t) {
  return (--t) * t * t + 1;
}


function showMoonBio() {
  const bioOverlay = document.createElement('div');
  bioOverlay.id = 'bio-overlay';
  bioOverlay.style.position = 'fixed';
  bioOverlay.style.top = '0';
  bioOverlay.style.left = '0';
  bioOverlay.style.width = '100vw';
  bioOverlay.style.height = '100vh';
  bioOverlay.style.backgroundColor = 'rgba(10, 0, 20, 0.95)';
  bioOverlay.style.zIndex = '10000';
  bioOverlay.style.display = 'flex';
  bioOverlay.style.justifyContent = 'center';
  bioOverlay.style.alignItems = 'center';
  bioOverlay.style.backdropFilter = 'blur(6px)';

  const bioBox = document.createElement('div');
  bioBox.style.position = 'relative';
  bioBox.style.backgroundColor = '#0f001a';
  bioBox.style.color = '#39ff14';
  bioBox.style.padding = '30px';
  bioBox.style.borderRadius = '16px';
  bioBox.style.maxWidth = '700px';
  bioBox.style.width = '80%';
  bioBox.style.textAlign = 'left';
  bioBox.style.fontFamily = "'Orbitron', sans-serif";
  bioBox.style.boxShadow = '0 0 20px #ff00cc, 0 0 40px #00ffff inset';
  bioBox.style.border = '2px solid #00ffff';

  const img = document.createElement('img');
  img.src = 'sam.JPG';
  img.alt = 'Moon';
  img.style.width = '150px';
  img.style.display = 'block';
  img.style.margin = '0 auto 15px auto';
  img.style.borderRadius = '10px';

  const text = document.createElement('p');
  text.innerText ="Less than 20% of Americans can gaze at a starry night sky, untainted by city lights. However, I can. I grew up in a rural area, where nightly, the stars lit up the sky. As a kid, this inspired me to want to know everything I could about the universe. Starting in elementary school, when I built my first model rocket, I was hooked. Since then, I have built countless rockets, hoping one day I could take my skills and build a rocket that flys far beyond earth's atmosphere. This passion has inspired many of my personal projects, and even my first internship with Colorado Space Business Roundtable. Where I learned from experts at Lockheed Martin Space, BAE, United Launch Alliance, and Sierra Space.";

  const closeBtn = document.createElement('button');
  closeBtn.innerText = '✖';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '10px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '24px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => {
    document.body.removeChild(bioOverlay);
    resetAdventure();
    returnToMenu();
  };

  bioBox.appendChild(closeBtn);
  bioBox.appendChild(img);
  bioBox.appendChild(text);
  bioOverlay.appendChild(bioBox);
  document.body.appendChild(bioOverlay);
}

  function clearAdventure() {
    /**
     * Clears the game canvas.
     */
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  }

  function checkCollision() {
    /**
     * Checks for collision between the rocket and obstacles. Needs to be refined for errant collisions.
     * @returns {boolean} True if a collision is detected, false otherwise.
     */ 
    return obstacles.some(o =>
      rocket.y < o.y + o.h && rocket.y + rocket.h > o.y &&
      rocket.x < o.x + o.w && rocket.x + rocket.w > o.x
    );
  }




function resetAdventure() {
/**
 * Resets the adventure game state to its initial conditions.
 * This function stops any ongoing animations, resets the rocket's position and velocity,
 * repositions obstacles, and resets various game state flags and timers.
 */



  if (adventureFrameId) {
    cancelAnimationFrame(adventureFrameId);
    adventureFrameId = null;
  }

  rocket.x = 100;
  rocket.dx = 0;
  rocket.y = 520;
  rocket.dy = -20;
  obstacles.forEach(o => o.y = -Math.random() * 400);
  moonReached = false;
  scrollOffset = 0;
  clearInterval(countdownInterval);
  countdownStarted = false;
  moonAvailable = false;
  moonLandingTriggered = false;
  moonLandingDelayStarted = false;
}


  function updateAdventure() {
  clearAdventure();
  drawBackground();
  drawObstacles();
  drawRocket();
  gameTime++;
  drawMoon();
  

  // Countdown display
  gameCtx.fillStyle = "#FFD700";
  gameCtx.font = "16px 'Press Start 2P'";
  if (scrollOffset > 0) {
    gameCtx.fillText(`Initiating landing in: ${countdownTime}s`, 20, 40);
  } else {
    gameCtx.fillText(`Liftoff in Progress`, 20, 40);
  }

  // Rocket movement
  if (!moonAvailable) {
  rocket.x += rocket.dx; // allow movement
} else {
  // Lock rocket to moon's horizontal position
  const moonCenterX = gameCanvas.width / 2;
  rocket.x = moonCenterX - rocket.w / 2;
}


  // Lift-off phase: move rocket up
if (rocket.y > gameCanvas.height / 2 && !moonAvailable) {
  // Before midpoint, lift rocket
  rocket.y += rocket.dy;
} else if (!moonAvailable) {
  // Midpoint reached, hold rocket and scroll background
  if (!countdownStarted) {
    countdownStarted = true;
    countdownInterval = setInterval(() => {
      countdownTime--;
      if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        moonAvailable = true;
      }
    }, 1000);
  }
  scrollOffset += 2;
  obstacles.forEach(o => o.y += 2); // scroll obstacles
} else {
  // After countdown ends, allow rocket to resume upward movement
  rocket.y += rocket.dy;
}

  // Clamp rocket position
  rocket.x = Math.max(0, Math.min(gameCanvas.width - rocket.w, rocket.x));
  rocket.y = Math.max(0, Math.min(gameCanvas.height - rocket.h, rocket.y));

  if (!moonLandingTriggered && checkCollision()) {
  alert("You hit an obstacle! Restarting...");
  resetAdventure();
  startAdventureGame();
  return;
}


  if (!moonReached) {
    adventureFrameId = requestAnimationFrame(updateAdventure);
  }
}




// Keyboard Controls
function keyDown(e) {
  if (e.key === "ArrowLeft" || e.key === "a")  rocket.dx = -rocket.speed;
  if (e.key === "ArrowRight"|| e.key === "d")  rocket.dx =  rocket.speed;
}
function keyUp(e) {
  if (["ArrowLeft","ArrowRight","a","d"].includes(e.key)) 
    rocket.dx = 0;
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup",   keyUp);






  

  // Game Starter
function startAdventureGame() {
  // ✅ Clear previous obstacles and stars
  obstacles.length = 0;
  stars.length = 0;

  // ✅ Generate stars
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * gameCanvas.width,
      y: Math.random() * gameCanvas.height,
      radius: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.1,
      color: Math.random() > 0.5 ? "#ffffff" : "#aad7ff"
    });
  }

  // ✅ Generate obstacles
  const baseObstacles = 5;
  // const difficultyFactor = Math.floor(gameTime / 600); // Optional: increase every 10 seconds
  // const obstacleCount = baseObstacles + difficultyFactor;
  const obstacleCount = baseObstacles;

  for (let i = 0; i < obstacleCount; i++) {
    const randomType = Math.random() > 0.5 ? 'meteor' : 'alien';
    obstacles.push({
      x: Math.random() * (gameCanvas.width - 40),
      y: -Math.random() * 200,
      w: 30,
      h: 30,
      speed: 1 + Math.random() * 1.5,
      type: randomType,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    });
  }

  // ✅ Set screen state
  mainMenu.style.display = "none";
  [fishingGame, ruralGame].forEach(g => g.style.display = "none");
  adventureGame.style.display = "block";

  // ✅ Reset game state
  resetAdventure();
  countdownTime = 12;
  moonAvailable = false;
  gameTime = 0;
  moonLandingTriggered = false;
  moonLandingDelayStarted = false;

  // ✅ Launch animation, then begin gameplay
  playLaunchAnimation(() => {
    let transitionProgress = 0;
    const transitionDuration = 30;

    function transitionToGame() {
      clearAdventure();
      drawBackground();

      gameCtx.globalAlpha = transitionProgress / transitionDuration;
      drawRocket();
      gameCtx.globalAlpha = 1;

      transitionProgress++;
      if (transitionProgress < transitionDuration) {
        requestAnimationFrame(transitionToGame);
      } else {
        updateAdventure();
      }
    }

    transitionToGame();
  });
}




export { startAdventureGame };
export{resetAdventure}
