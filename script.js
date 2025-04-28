yess
// Crossword puzzle data for SMA science and education subjects
const crosswordData = {
  size: 10,
  grid: [
    ['B', 'I', 'O', 'L', 'O', 'G', 'I', '', '', ''],
    ['', '', '', '', '', 'M', '', '', '', ''],
    ['F', 'I', 'S', 'I', 'K', 'A', '', '', '', ''],
    ['', '', '', '', '', 'A', '', '', '', ''],
    ['M', 'A', 'T', 'E', 'M', 'A', 'T', 'I', 'K', 'A'],
    ['', '', '', '', '', 'T', '', '', '', ''],
    ['K', 'E', 'M', 'I', 'A', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
  ],
  clues: {
    across: {
      1: 'Ilmu tentang makhluk hidup',
      5: 'Ilmu tentang angka dan perhitungan',
      7: 'Ilmu tentang zat dan reaksinya',
    },
    down: {
      1: 'Ilmu tentang gaya dan energi',
      2: 'Mata pelajaran yang mempelajari bahasa dan sastra',
      3: 'Ilmu tentang bumi dan alam',
    }
  },
  positions: {
    across: {
      1: { row: 0, col: 0, length: 7 },
      5: { row: 4, col: 0, length: 9 },
      7: { row: 6, col: 0, length: 5 },
    },
    down: {
      1: { row: 0, col: 0, length: 6 },
      2: { row: 0, col: 5, length: 3 },
      3: { row: 0, col: 6, length: 3 },
    }
  }
};

function createCrosswordGrid() {
  const container = document.getElementById('crossword-container');
  container.innerHTML = '';

  for (let r = 0; r < crosswordData.size; r++) {
    for (let c = 0; c < crosswordData.size; c++) {
      const cellValue = crosswordData.grid[r][c];
      const cell = document.createElement('div');
      cell.classList.add('crossword-cell');

      if (cellValue === '') {
        cell.classList.add('black');
      } else {
        const input = document.createElement('input');
        input.setAttribute('maxlength', '1');
        input.setAttribute('data-row', r);
        input.setAttribute('data-col', c);
        input.addEventListener('input', onInput);
        cell.appendChild(input);
      }

      // Add clue numbers if cell is start of a clue
      const clueNumber = getClueNumber(r, c);
      if (clueNumber) {
        const numberSpan = document.createElement('span');
        numberSpan.classList.add('clue-number');
        numberSpan.textContent = clueNumber;
        cell.appendChild(numberSpan);
      }

      container.appendChild(cell);
    }
  }
}

function getClueNumber(row, col) {
  for (const [num, pos] of Object.entries(crosswordData.positions.across)) {
    if (pos.row === row && pos.col === col) return num;
  }
  for (const [num, pos] of Object.entries(crosswordData.positions.down)) {
    if (pos.row === row && pos.col === col) return num;
  }
  return null;
}

function populateClues() {
  const acrossList = document.getElementById('across-list');
  const downList = document.getElementById('down-list');

  acrossList.innerHTML = '';
  downList.innerHTML = '';

  for (const [num, clue] of Object.entries(crosswordData.clues.across)) {
    const li = document.createElement('li');
    li.textContent = `${num}. ${clue}`;
    acrossList.appendChild(li);
  }

  for (const [num, clue] of Object.entries(crosswordData.clues.down)) {
    const li = document.createElement('li');
    li.textContent = `${num}. ${clue}`;
    downList.appendChild(li);
  }
}

function onInput(e) {
  const input = e.target;
  input.value = input.value.toUpperCase();
}

function checkAnswers() {
  let totalCells = 0;
  let correctCells = 0;

  for (let r = 0; r < crosswordData.size; r++) {
    for (let c = 0; c < crosswordData.size; c++) {
      const cellValue = crosswordData.grid[r][c];
      if (cellValue === '') continue;
      totalCells++;
      const input = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      if (!input) continue;
      if (input.value === cellValue) {
        input.classList.add('correct');
        input.classList.remove('incorrect');
        correctCells++;
      } else {
        input.classList.add('incorrect');
        input.classList.remove('correct');
      }
    }
  }

  // Calculate score percentage
  const scorePercent = (correctCells / totalCells) * 100;

  // Assign star rating
  let stars = 1;
  if (scorePercent === 100) {
    stars = 5;
  }

  // Display star rating
  const starRatingDiv = document.getElementById('star-rating');
  starRatingDiv.innerHTML = 'Rating: ' + '★'.repeat(stars) + '☆'.repeat(5 - stars);

  // Store user result if logged in
  if (window.loggedInUser) {
    window.loggedInUser.lastScore = scorePercent;
    window.loggedInUser.starRating = stars;

    // Add or update user in results list
    if (!window.userResults) {
      window.userResults = [];
    }
    const existingIndex = window.userResults.findIndex(u => u.identifier === window.loggedInUser.identifier);
    if (existingIndex >= 0) {
      window.userResults[existingIndex] = {...window.loggedInUser};
    } else {
      window.userResults.push({...window.loggedInUser});
    }
  }
}

function revealHint() {
  // Find all empty or incorrect cells
  let candidates = [];
  for (let r = 0; r < crosswordData.size; r++) {
    for (let c = 0; c < crosswordData.size; c++) {
      const cellValue = crosswordData.grid[r][c];
      if (cellValue === '') continue;
      const input = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      if (!input) continue;
      if (input.value !== cellValue) {
        candidates.push({row: r, col: c, letter: cellValue, input});
      }
    }
  }
  if (candidates.length === 0) {
    alert('Semua jawaban sudah benar atau terisi.');
    return;
  }
  // Reveal a random hint
  const hint = candidates[Math.floor(Math.random() * candidates.length)];
  hint.input.value = hint.letter;
  hint.input.classList.add('correct');
  hint.input.classList.remove('incorrect');
}

let timerInterval;
let secondsElapsed = 0;

function startTimer() {
  const timerDisplay = document.getElementById('timer');
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    timerDisplay.textContent = `Waktu: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}


window.onload = function() {
  // Initially hide crossword and create quiz sections, show login
  document.getElementById('crossword-section').style.display = 'none';
  document.getElementById('create-quiz-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';

  console.log('Window loaded, attaching event listeners.');

  document.getElementById('check-answers-btn').addEventListener('click', () => {
    if (!window.loggedInUser) {
      alert('Silakan login terlebih dahulu untuk memeriksa jawaban.');
      return;
    }
    checkAnswers();
  });
  document.getElementById('reveal-hint-btn').addEventListener('click', revealHint);
  document.getElementById('reload-btn').addEventListener('click', reloadPuzzle);

  const showCrosswordBtn = document.getElementById('show-crossword-btn');
  if (showCrosswordBtn) {
    showCrosswordBtn.addEventListener('click', () => {
      if (!window.loggedInUser) {
        alert('Silakan login terlebih dahulu untuk melihat teka teki.');
        return;
      }
      document.getElementById('crossword-section').style.display = 'block';
      document.getElementById('create-quiz-section').style.display = 'none';
      document.getElementById('results-section').style.display = 'none';
      document.getElementById('login-section').style.display = 'none';
    });
  } else {
    console.error('show-crossword-btn not found');
  }

  const showCreateQuizBtn = document.getElementById('show-create-quiz-btn');
  if (showCreateQuizBtn) {
    showCreateQuizBtn.addEventListener('click', () => {
      if (!window.loggedInUser) {
        alert('Silakan login terlebih dahulu untuk membuat kuis.');
        return;
      }
      document.getElementById('crossword-section').style.display = 'none';
      document.getElementById('create-quiz-section').style.display = 'block';
      document.getElementById('results-section').style.display = 'none';
      document.getElementById('login-section').style.display = 'none';
    });
  } else {
    console.error('show-create-quiz-btn not found');
  }

  const showResultsBtn = document.getElementById('show-results-btn');
  if (showResultsBtn) {
    showResultsBtn.addEventListener('click', () => {
      if (!window.loggedInUser) {
        alert('Silakan login terlebih dahulu untuk melihat hasil dan ranking.');
        return;
      }
      document.getElementById('crossword-section').style.display = 'none';
      document.getElementById('create-quiz-section').style.display = 'none';
      document.getElementById('results-section').style.display = 'block';
      document.getElementById('login-section').style.display = 'none';
      renderResults();
    });
  } else {
    console.error('show-results-btn not found');
  }

  const createQuizForm = document.getElementById('create-quiz-form');
  if (createQuizForm) {
    createQuizForm.addEventListener('submit', handleCreateQuiz);
  } else {
    console.error('create-quiz-form not found');
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.error('login-form not found');
  }
};

// Handle user login
function handleLogin(event) {
  event.preventDefault();
  const identifier = document.getElementById('user-identifier').value.trim();
  if (!identifier) {
    alert('Mohon masukkan email atau nomor handphone.');
    return;
  }
  // Store logged in user data in memory
  window.loggedInUser = {
    identifier: identifier,
    lastScore: null,
    starRating: null
  };
  alert(`Login berhasil sebagai ${identifier}`);
  // Show crossword section and hide login and create quiz sections
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('crossword-section').style.display = 'block';
  document.getElementById('create-quiz-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  // Initialize crossword if not already loaded
  if (!window.currentQuiz) {
    createCrosswordGrid();
    populateClues();
    startTimer();
  } else {
    loadQuiz(window.currentQuiz.quizData);
  }
}

function handleCreateQuiz(event) {
  event.preventDefault();

  const teacherName = document.getElementById('teacher-name').value.trim();
  const teacherContact = document.getElementById('teacher-contact').value.trim();
  const studentName = document.getElementById('student-name').value.trim();
  const studentClass = document.getElementById('student-class').value.trim();
  const gridDataText = document.getElementById('grid-data').value.trim();
  const acrossCluesText = document.getElementById('across-clues-data').value.trim();
  const downCluesText = document.getElementById('down-clues-data').value.trim();

  if (!teacherName || !teacherContact || !studentName || !studentClass || !gridDataText || !acrossCluesText || !downCluesText) {
    alert('Mohon lengkapi semua data.');
    return;
  }

  // Parse grid data
  const gridLines = gridDataText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const grid = gridLines.map(line => line.split(/\s+/).map(ch => ch === '.' ? '' : ch.toUpperCase()));

  // Parse clues data
  function parseClues(text) {
    const clues = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length < 2) continue;
      const num = parts[0].trim();
      const clue = parts.slice(1).join(':').trim();
      clues[num] = clue;
    }
    return clues;
  }

  const acrossClues = parseClues(acrossCluesText);
  const downClues = parseClues(downCluesText);

  // Positions are not provided by user, so we will generate empty positions
  // This means some features depending on positions may not work correctly
  const size = grid.length;
  const positions = { across: {}, down: {} };

  const quizData = {
    size: size,
    grid: grid,
    clues: {
      across: acrossClues,
      down: downClues
    },
    positions: positions
  };

  // Store biodata and quiz data (for now in memory)
  window.currentQuiz = {
    teacher: { name: teacherName, contact: teacherContact },
    student: { name: studentName, class: studentClass },
    quizData: quizData
  };

  // Render the new crossword puzzle
  loadQuiz(quizData);

  // Switch to crossword view
  document.getElementById('crossword-section').style.display = 'block';
  document.getElementById('create-quiz-section').style.display = 'none';

  alert(`Kuis berhasil dibuat untuk siswa ${studentName} oleh guru/mentor ${teacherName}.`);
}

function loadQuiz(quizData) {
  // Update crosswordData global variable
  crosswordData.size = quizData.size;
  crosswordData.grid = quizData.grid;
  crosswordData.clues = quizData.clues;
  crosswordData.positions = quizData.positions;

  // Recreate crossword grid and clues
  createCrosswordGrid();
  populateClues();

  // Reset timer and reload controls
  clearInterval(timerInterval);
  secondsElapsed = 0;
  document.getElementById('timer').textContent = 'Waktu: 00:00';
  startTimer();
}

function reloadPuzzle() {
  // Clear all inputs and remove highlights
  for (let r = 0; r < crosswordData.size; r++) {
    for (let c = 0; c < crosswordData.size; c++) {
      const cellValue = crosswordData.grid[r][c];
      if (cellValue === '') continue;
      const input = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      if (!input) continue;
      input.value = '';
      input.classList.remove('correct');
      input.classList.remove('incorrect');
    }
  }
  // Reset timer
  clearInterval(timerInterval);
  secondsElapsed = 0;
  document.getElementById('timer').textContent = 'Waktu: 00:00';
  startTimer();
}

// Render results and rankings
function renderResults() {
  if (!window.userResults || window.userResults.length === 0) {
    alert('Belum ada hasil permainan yang tersedia.');
    return;
  }
  // Sort users by score descending
  const sortedResults = [...window.userResults].sort((a, b) => b.lastScore - a.lastScore);

  const tbody = document.getElementById('results-table-body');
  tbody.innerHTML = '';

  sortedResults.forEach((user, index) => {
    const tr = document.createElement('tr');

    const tdNo = document.createElement('th');
    tdNo.scope = 'row';
    tdNo.textContent = index + 1;
    tr.appendChild(tdNo);

    const tdUser = document.createElement('td');
    tdUser.textContent = user.identifier;
    tr.appendChild(tdUser);

    const tdScore = document.createElement('td');
    tdScore.textContent = user.lastScore.toFixed(2);
    tr.appendChild(tdScore);

    const tdStars = document.createElement('td');
    tdStars.textContent = '★'.repeat(user.starRating) + '☆'.repeat(5 - user.starRating);
    tdStars.style.color = 'gold';
    tr.appendChild(tdStars);

    tbody.appendChild(tr);
  });
}
