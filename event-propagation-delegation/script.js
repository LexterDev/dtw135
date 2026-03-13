// =============================================================
//  PART 1 — Event Propagation (Bubbling)
// =============================================================

const outerBox  = document.getElementById('outer-box');
const middleBox = document.getElementById('middle-box');
const innerBox  = document.getElementById('inner-box');
const propLog   = document.getElementById('prop-log');
const stopToggle = document.getElementById('stop-propagation-toggle');

// Helper: add a log entry to the propagation log
function logPropEvent(elementName, cssClass) {
  removeHint(propLog);
  const li = document.createElement('li');
  li.className = cssClass;
  li.textContent = `🔔 Event fired on: ${elementName}`;
  propLog.appendChild(li);
  propLog.scrollTop = propLog.scrollHeight;
}

// Helper: flash the element so students can see it reacting
function flashElement(el) {
  el.classList.remove('flash');
  // Trigger reflow so the animation restarts each click
  void el.offsetWidth;
  el.classList.add('flash');
}

// ── Listener on INNER box ──────────────────────────────────
innerBox.addEventListener('click', function (event) {
  flashElement(innerBox);
  logPropEvent('🎯 INNER box', 'log-inner');
});

// ── Listener on MIDDLE box ────────────────────────────────
middleBox.addEventListener('click', function (event) {
  flashElement(middleBox);

  // If the toggle is ON, stop the event from going further up
  if (stopToggle.checked) {
    event.stopPropagation();
    logPropEvent('🌿 MIDDLE box  ✋ (stopped here!)', 'log-stop');
    return;
  }

  logPropEvent('🌿 MIDDLE box', 'log-middle');
});

// ── Listener on OUTER box ─────────────────────────────────
outerBox.addEventListener('click', function (event) {
  flashElement(outerBox);
  logPropEvent('🌍 OUTER box', 'log-outer');
});


// =============================================================
//  PART 2 — Event Delegation
// =============================================================

const barnyard    = document.getElementById('barnyard');
const addAnimalBtn = document.getElementById('add-animal-btn');
const delLog      = document.getElementById('del-log');

// Pool of animals to add dynamically
const extraAnimals = [
  { emoji: '🐑', name: 'Sheep',  sound: 'Baaaa! 🐑' },
  { emoji: '🦆', name: 'Duck',   sound: 'Quack! 🦆' },
  { emoji: '🐕', name: 'Dog',    sound: 'Woof! 🐕'  },
  { emoji: '🐈', name: 'Cat',    sound: 'Meow! 🐈'  },
  { emoji: '🐇', name: 'Rabbit', sound: 'Squeak! 🐇'},
  { emoji: '🦃', name: 'Turkey', sound: 'Gobble! 🦃'},
  { emoji: '🐐', name: 'Goat',   sound: 'Mehh! 🐐'  },
  { emoji: '🦙', name: 'Llama',  sound: 'Hmmm! 🦙'  },
];

let animalIndex = 0; // tracks which animal to add next

// ── ONE listener on the PARENT (barnyard) ────────────────
//    This handles clicks for ALL animal cards — even new ones!
barnyard.addEventListener('click', function (event) {
  // Find the closest .animal ancestor of what was clicked
  const clickedAnimal = event.target.closest('.animal');

  // If the click was not on an animal card, ignore it
  if (!clickedAnimal) return;

  const name  = clickedAnimal.dataset.name;
  const sound = clickedAnimal.dataset.sound;

  removeHint(delLog);

  // Info line: shows that the listener lives on the parent
  const infoLi = document.createElement('li');
  infoLi.className = 'log-info';
  infoLi.textContent = `📡 Caught by the BARNYARD listener (the parent)`;
  delLog.appendChild(infoLi);

  // Main log line: what animal was clicked
  const li = document.createElement('li');
  li.className = 'log-delegate';
  li.textContent = `🐾 ${name} says: "${sound}"`;
  delLog.appendChild(li);

  delLog.scrollTop = delLog.scrollHeight;
});

// ── Add a new animal dynamically ─────────────────────────
addAnimalBtn.addEventListener('click', function () {
  if (animalIndex >= extraAnimals.length) {
    addAnimalBtn.textContent = '🎉 That\'s all the animals!';
    addAnimalBtn.disabled = true;
    return;
  }

  const { emoji, name, sound } = extraAnimals[animalIndex];
  animalIndex++;

  const div = document.createElement('div');
  div.className = 'animal new-animal';
  div.dataset.name  = name;
  div.dataset.sound = sound;
  div.innerHTML = `${emoji}<br>${name}`;

  barnyard.appendChild(div);

  // Show a log entry explaining what just happened
  removeHint(delLog);
  const li = document.createElement('li');
  li.className = 'log-info';
  li.textContent = `✨ ${name} was added — no new listener needed!`;
  delLog.appendChild(li);
  delLog.scrollTop = delLog.scrollHeight;
});


// =============================================================
//  Shared utility
// =============================================================

// Removes the initial "hint" placeholder from a log list
function removeHint(logEl) {
  const hint = logEl.querySelector('.log-hint');
  if (hint) hint.remove();
}

// Clears a log list back to its empty state
function clearLog(id) {
  const logEl = document.getElementById(id);
  logEl.innerHTML = '<li class="log-hint">Log cleared — try clicking again!</li>';
}
