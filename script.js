let state = {
    players: [],
    scores: [30, 30, 30, 30],
    history: [],
    selectedWinner: 0,
    selectedPenalty: 4
};

// Elementler
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const scoreCardsContainer = document.getElementById('score-cards');
const winnerSelectContainer = document.getElementById('winner-select');
const penaltyBtns = document.querySelectorAll('.penalty-btn');
const applyBtn = document.getElementById('apply-btn');
const undoBtn = document.getElementById('undo-btn');
const resetBtn = document.getElementById('reset-btn');
const historyList = document.getElementById('history-list');

// LocalStorage Kontrolü
window.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('okey_state');
    if (savedState) {
        state = JSON.parse(savedState);
        if (state.players.length === 4) {
            showGameScreen();
        }
    }
});

function saveState() {
    localStorage.setItem('okey_state', JSON.stringify(state));
}

startBtn.addEventListener('click', () => {
    const p0 = document.getElementById('p0').value.trim() || 'Oyuncu 1';
    const p1 = document.getElementById('p1').value.trim() || 'Oyuncu 2';
    const p2 = document.getElementById('p2').value.trim() || 'Oyuncu 3';
    const p3 = document.getElementById('p3').value.trim() || 'Oyuncu 4';

    state.players = [p0, p1, p2, p3];
    state.scores = [30, 30, 30, 30];
    state.history = [];
    state.selectedWinner = 0;
    state.selectedPenalty = 4;

    saveState();
    showGameScreen();
});

function showGameScreen() {
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    renderGame();
}

// Ceza Seçimi
penaltyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        penaltyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedPenalty = parseInt(btn.getAttribute('data-score'));
    });
});

// Puan Uygula
applyBtn.addEventListener('click', () => {
    const winner = state.selectedWinner;
    const penalty = state.selectedPenalty;

    const previousScores = [...state.scores];

    // Puanları güncelle (Biten hariç diğerlerinden düş)
    for (let i = 0; i < 4; i++) {
        if (i !== winner) {
            state.scores[i] -= penalty;
        }
    }

    // Geçmişe ekle
    state.history.unshift({
        winner: state.players[winner],
        penalty: penalty,
        previousScores: previousScores
    });

    saveState();
    renderGame();
});

// Geri Al
undoBtn.addEventListener('click', () => {
    if (state.history.length === 0) return;

    const lastAction = state.history.shift();
    state.scores = [...lastAction.previousScores];

    saveState();
    renderGame();
});

// Sıfırla
resetBtn.addEventListener('click', () => {
    if (confirm('Oyunu sıfırlamak istediğinize emin misiniz?')) {
        localStorage.removeItem('okey_state');
        gameScreen.classList.remove('active');
        setupScreen.classList.add('active');
    }
});

// Arayüzü Çiz
function renderGame() {
    // Skor Kartları
    scoreCardsContainer.innerHTML = '';
    state.players.forEach((name, index) => {
        const isWinner = index === state.selectedWinner;
        const score = state.scores[index];
        
        const card = document.createElement('div');
        card.className = `score-card ${isWinner ? 'selected-winner' : ''}`;
        card.innerHTML = `
            <div class="p-name">${name}</div>
            <div class="p-score ${score < 0 ? 'negative' : ''}">${score}</div>
        `;
        scoreCardsContainer.appendChild(card);
    });

    // Kazanan Seçim Butonları
    winnerSelectContainer.innerHTML = '';
    state.players.forEach((name, index) => {
        const btn = document.createElement('button');
        btn.className = `winner-btn ${index === state.selectedWinner ? 'active' : ''}`;
        btn.innerText = name;
        btn.addEventListener('click', () => {
            state.selectedWinner = index;
            renderGame();
        });
        winnerSelectContainer.appendChild(btn);
    });

    // Geçmiş Listesi
    historyList.innerHTML = '';
    if (state.history.length === 0) {
        historyList.innerHTML = '<p class="no-history">Henüz el oynanmadı.</p>';
    } else {
        state.history.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <span><strong>${item.winner}</strong> bitti</span>
                <span style="color:var(--danger-color)">-${item.penalty}p</span>
            `;
            historyList.appendChild(div);
        });
    }
}
