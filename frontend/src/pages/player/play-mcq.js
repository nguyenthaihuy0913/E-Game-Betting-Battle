document.addEventListener('DOMContentLoaded', async () => {
    const qCounter = document.getElementById('q-counter');
    const qText = document.getElementById('q-text');
    const optionsGrid = document.getElementById('options-grid');
    const feedbackMsg = document.getElementById('feedback-msg');
    const nextBtn = document.getElementById('next-btn');
    const scoreSpan = document.getElementById('score');

    let questions = [];
    let currentIdx = 0;
    let score = 0;
    let isAnswered = false;

    // Expose loadQuestion to window for server sync
    window.loadQuestionFromState = function(idx) {
        if (currentIdx !== idx || isAnswered === false) { // Ensure it reloads if needed
            currentIdx = idx;
            if (questions.length > 0 && idx < questions.length) {
                loadQuestion(currentIdx);
            }
        }
    };

    // Fetch data
    try {
        const res = await fetch('../../data/questions.json');
        const data = await res.json();
        questions = data.multiple_choice || [];
        if (questions.length > 0) {
            // Initial load is controlled by the server sync, but we can stage the first
            loadQuestion(currentIdx);
            
            // Default to hiding the question unless told otherwise
            qText.style.visibility = 'hidden';
            optionsGrid.style.visibility = 'hidden';
        } else {
            qText.innerText = "No questions found.";
        }
    } catch (err) {
        console.error("Error loading questions.json", err);
        qText.innerText = "Error loading questions data.";
    }

    // Utility to shuffle array
    function shuffleArray(array) {
        let curId = array.length;
        while (0 !== curId) {
            let randId = Math.floor(Math.random() * curId);
            curId -= 1;
            let tmp = array[curId];
            array[curId] = array[randId];
            array[randId] = tmp;
        }
        return array;
    }

    function loadQuestion(idx) {
        isAnswered = false;
        const q = questions[idx];
        qCounter.innerText = `Q ${idx + 1} / ${questions.length}`;
        qText.innerText = q.question;
        feedbackMsg.className = "feedback-msg";
        feedbackMsg.innerText = "";
        nextBtn.style.display = "none";
        
        optionsGrid.innerHTML = '';

        // Extract clean text and original letter
        let rawOptions = q.options.map(opt => {
            const match = opt.match(/^([A-D])\.\s*(.*)/);
            return match ? { letter: match[1], text: match[2], full: opt } : { letter: '', text: opt, full: opt };
        });

        // Shuffle the options
        rawOptions = shuffleArray(rawOptions);

        // Assign new visual A, B, C, D
        const labels = ['A', 'B', 'C', 'D'];
        rawOptions.forEach((optData, index) => {
            const visualLetter = labels[index];
            const text = optData.text;
            const originalLetter = optData.letter;

            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerHTML = `
                <div class="opt-letter">${visualLetter}</div>
                <div class="opt-content">${text}</div>
            `;
            
            btn.dataset.originalLetter = originalLetter;
            
            // We pass originalLetter to verify against q.correct_answer (which is usually A,B,C,D based on original)
            btn.addEventListener('click', () => handleSelect(btn, originalLetter, q.correct_answer, visualLetter));
            optionsGrid.appendChild(btn);
        });
    }

    function handleSelect(btn, originalLetter, correctLetter, visualLetter) {
        if (isAnswered) return;
        isAnswered = true;

        const allButtons = optionsGrid.querySelectorAll('.opt-btn');
        allButtons.forEach(b => b.style.pointerEvents = 'none'); // disable clicks

        if (originalLetter === correctLetter) {
            if (window.playSuccess) window.playSuccess();
            btn.classList.add('correct');
            feedbackMsg.innerText = "Outstanding! Correct answer.";
            feedbackMsg.classList.add('show', 'correct');
            score++;
            scoreSpan.innerText = score;
            createParticles(btn.getBoundingClientRect());
        } else {
            if (window.playError) window.playError();
            btn.classList.add('wrong');
            feedbackMsg.innerText = `Oops! That was incorrect.`;
            feedbackMsg.classList.add('show', 'wrong');

            // highlight correct
            allButtons.forEach(b => {
                if (b.dataset.originalLetter === correctLetter) {
                    b.classList.add('correct');
                }
            });
        }
        
        // Let server handle 'Next' transitions, hide next button completely.
        nextBtn.style.display = "none";
    }



    // Particle effect hook (uses main.js)
    function createParticles(rect) {
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        if(typeof window.spawnClickParticles === 'function') {
            window.spawnClickParticles(x, y);
        }
    }
});
