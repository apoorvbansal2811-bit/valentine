// ---------- 3D Tilt effect (mouse-follow) ----------
function init3DTilt(el, maxDeg = 8) {
  if (!el) return;
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -2 * maxDeg;
    const rotateY = (x - 0.5) * 2 * maxDeg;
    el.style.transform = `perspective(${1200}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
}
init3DTilt(document.getElementById("heroCard"), 10);
init3DTilt(document.getElementById("valentineCard"), 6);

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll(".scroll-reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("revealed");
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
revealEls.forEach((el) => revealObserver.observe(el));

// ---------- Click to spawn hearts ----------
const heartsContainer = document.getElementById("hearts-container");
const hearts = ["❤️", "💕", "💖", "💗", "♥️"];
document.body.addEventListener("click", (e) => {
  if (!heartsContainer) return;
  const count = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "heart-float";
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = e.clientX + "px";
    heart.style.top = e.clientY + "px";
    heart.style.setProperty("--dx", (Math.random() - 0.5) * 120 + "px");
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 2600);
  }
});

// Smooth scroll from "Start the Celebration" button
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    const gallery = document.getElementById("gallery");
    if (gallery) gallery.scrollIntoView({ behavior: "smooth" });
  });
}

// Tabs for gallery
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    if (!target) return;

    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === target);
    });
  });
});

// Slideshow
const slidesContainer = document.querySelector(".slides");
const slideElements = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".slide-nav.prev");
const nextBtn = document.querySelector(".slide-nav.next");
let currentSlide = 0;

function updateSlides() {
  if (!slidesContainer || !slideElements.length) return;
  const offset = -currentSlide * 100;
  slidesContainer.style.transform = `translateX(${offset}%)`;
}

if (prevBtn && nextBtn && slideElements.length) {
  prevBtn.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slideElements.length) % slideElements.length;
    updateSlides();
  });

  nextBtn.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slideElements.length;
    updateSlides();
  });
}

// Auto-advance slideshow every 6 seconds
if (slideElements.length) {
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slideElements.length;
    updateSlides();
  }, 6000);
}

// 3x3 sliding puzzle (8 tiles + 1 empty)
const puzzleGrid = document.getElementById("puzzleGrid");
const movesCountEl = document.getElementById("movesCount");
const newGameBtn = document.getElementById("newGameBtn");
const puzzleVictoryEl = document.getElementById("puzzleVictory");
const PUZZLE_SIZE = 3;
const EMPTY_INDEX = 8; // bottom-right empty

let tiles = [];
let moves = 0;

// positions for 3x3 grid (image split into 9 parts)
const TILE_POSITIONS = [
  "0% 0%", "50% 0%", "100% 0%",
  "0% 50%", "50% 50%", "100% 50%",
  "0% 100%", "50% 100%", "100% 100%",
];

function createPuzzle() {
  if (!puzzleGrid || !movesCountEl) return;

  if (puzzleVictoryEl) puzzleVictoryEl.classList.remove("is-visible");

  puzzleGrid.innerHTML = "";
  tiles = [];
  moves = 0;
  movesCountEl.textContent = moves.toString();

  // Start solved, then random valid moves so it's always solvable
  let arrangement = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const numMoves = 12 + Math.floor(Math.random() * 20);
  for (let i = 0; i < numMoves; i++) {
    const emptyIdx = arrangement.indexOf(EMPTY_INDEX);
    const emptyRow = Math.floor(emptyIdx / PUZZLE_SIZE);
    const emptyCol = emptyIdx % PUZZLE_SIZE;
    const neighbors = [];
    if (emptyRow > 0) neighbors.push(emptyIdx - PUZZLE_SIZE);
    if (emptyRow < PUZZLE_SIZE - 1) neighbors.push(emptyIdx + PUZZLE_SIZE);
    if (emptyCol > 0) neighbors.push(emptyIdx - 1);
    if (emptyCol < PUZZLE_SIZE - 1) neighbors.push(emptyIdx + 1);
    const swapWith = neighbors[Math.floor(Math.random() * neighbors.length)];
    [arrangement[emptyIdx], arrangement[swapWith]] = [arrangement[swapWith], arrangement[emptyIdx]];
  }

  arrangement.forEach((indexVal) => {
    const tile = document.createElement("div");
    tile.className = "tile";

    if (indexVal === EMPTY_INDEX) {
      tile.classList.add("empty");
    } else {
      const inner = document.createElement("div");
      inner.className = "tile-content";
      inner.style.backgroundImage = 'url("photo6.jpeg")';
      inner.style.backgroundSize = "300% 300%";
      inner.style.backgroundPosition = TILE_POSITIONS[indexVal];
      tile.appendChild(inner);
    }

    tile.dataset.piece = indexVal.toString();
    tile.addEventListener("click", () => attemptMove(tile));
    puzzleGrid.appendChild(tile);
    tiles.push(tile);
  });
}

function getTilePosition(tile) {
  const index = tiles.indexOf(tile);
  return { row: Math.floor(index / PUZZLE_SIZE), col: index % PUZZLE_SIZE };
}

function areAdjacent(tileA, tileB) {
  const posA = getTilePosition(tileA);
  const posB = getTilePosition(tileB);
  const rowDiff = Math.abs(posA.row - posB.row);
  const colDiff = Math.abs(posA.col - posB.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function attemptMove(tile) {
  if (!puzzleGrid || !movesCountEl) return;
  if (tile.classList.contains("empty")) return;

  const emptyTile = tiles.find((t) => t.classList.contains("empty"));
  if (!emptyTile) return;

  if (!areAdjacent(tile, emptyTile)) return;

  const tileIndex = tiles.indexOf(tile);
  const emptyIndex = tiles.indexOf(emptyTile);

  // Swap in our array
  tiles[tileIndex] = emptyTile;
  tiles[emptyIndex] = tile;

  // Reorder DOM to match tiles array
  tiles.forEach((t) => puzzleGrid.appendChild(t));

  moves++;
  movesCountEl.textContent = moves.toString();

  if (isPuzzleSolved() && puzzleVictoryEl) {
    puzzleVictoryEl.classList.add("is-visible");
  }
}

function isPuzzleSolved() {
  if (tiles.length !== 9) return false;
  for (let i = 0; i < 9; i++) {
    const piece = tiles[i].dataset.piece;
    if (piece !== String(i)) return false;
  }
  return true;
}

if (newGameBtn) {
  newGameBtn.addEventListener("click", createPuzzle);
}

// Initialize puzzle on load
createPuzzle();

// Valentine Quiz logic
const quizForm = document.getElementById("valentineQuiz");
const quizResult = document.getElementById("quizResult");

if (quizForm && quizResult) {
  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(quizForm);
    const color = data.get("color");
    const food = data.get("food");
    const person = data.get("person");

    if (!color || !food || !person) {
      quizResult.textContent = "Answer all three questions first, mister/missy 😏";
      quizResult.classList.remove("good", "bad");
      return;
    }

    let score = 0;
    if (color === "blue") score++;
    if (food === "your-food") score++;
    if (person === "you") score++;

    quizResult.classList.remove("good", "bad");

    if (score === 3) {
      quizResult.textContent =
        "3/3 — you know me too well. I guess you’re stuck with me forever now. 💖";
      quizResult.classList.add("good");
    } else if (score === 2) {
      quizResult.textContent =
        "2/3 — not bad, I’ll tease you about the one you missed later. 😉";
      quizResult.classList.add("good");
    } else {
      quizResult.textContent =
        score + "/3 — wow, someone needs to take me on more dates and pay attention!";
      quizResult.classList.add("bad");
    }

    // Show the Valentine ask section
    const valentineSection = document.getElementById("valentineAsk");
    if (valentineSection) {
      valentineSection.style.display = "block";
      setTimeout(() => {
        valentineSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  });
}

// Valentine Ask logic
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const valentineResponse = document.getElementById("valentineResponse");
let noClickCount = 0;

if (yesBtn && valentineResponse) {
  yesBtn.addEventListener("click", () => {
    valentineResponse.textContent = "Yay! You made me the happiest person today! 💕💖💕";
    valentineResponse.style.color = "#1b8f44";
    yesBtn.style.transform = "scale(1.1)";
    setTimeout(() => {
      yesBtn.style.transform = "scale(1)";
    }, 200);
  });
}

if (noBtn && valentineResponse) {
  noBtn.addEventListener("mouseenter", () => {
    noClickCount++;
    if (noClickCount < 3) {
      // Move the button randomly
      const randomX = Math.random() * 200 - 100;
      const randomY = Math.random() * 200 - 100;
      noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
      setTimeout(() => {
        noBtn.style.transform = "translate(0, 0)";
      }, 300);
    }
  });

  noBtn.addEventListener("click", () => {
    noClickCount++;
    if (noClickCount < 3) {
      valentineResponse.textContent = "Are you sure? Try again! 😊";
      valentineResponse.style.color = "#ff2d75";
    } else {
      valentineResponse.textContent = "Nice try, but you have to say Yes! 💕";
      valentineResponse.style.color = "#ff4b91";
      noBtn.style.display = "none";
      yesBtn.style.transform = "scale(1.2)";
      yesBtn.style.fontSize = "1.3rem";
    }
  });
}


