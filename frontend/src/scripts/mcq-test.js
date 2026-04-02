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

    // Fetch data
    try {
        const res = await fetch('../../data/questions.json');
        const data = await res.json();
        questions = data.multiple_choice || [];
        if (questions.length > 0) {
            loadQuestion(currentIdx);
        } else {
            qText.innerText = "No questions found.";
        }
    } catch (err) {
        console.error("Error loading questions.json", err);
        qText.innerText = "Error loading questions data.";
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

        q.options.forEach(opt => {
            // opt looks like "A. him arrive"
            const match = opt.match(/^([A-D])\.\s*(.*)/);
            let letter = opt[0];
            let text = opt;
            if (match) {
                letter = match[1];
                text = match[2];
            }

            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerHTML = `
                <div class="opt-letter">${letter}</div>
                <div class="opt-content">${text}</div>
            `;
            
            btn.addEventListener('click', () => handleSelect(btn, letter, q.correct_answer));
            optionsGrid.appendChild(btn);
        });
    }

    function handleSelect(btn, selectedLetter, correctLetter) {
        if (isAnswered) return;
        isAnswered = true;

        const allButtons = optionsGrid.querySelectorAll('.opt-btn');
        allButtons.forEach(b => b.style.pointerEvents = 'none'); // disable clicks

        if (selectedLetter === correctLetter) {
            btn.classList.add('correct');
            feedbackMsg.innerText = "Outstanding! Correct answer.";
            feedbackMsg.classList.add('show', 'correct');
            score++;
            scoreSpan.innerText = score;
            createParticles(btn.getBoundingClientRect());
        } else {
            btn.classList.add('wrong');
            feedbackMsg.innerText = `Oops! The correct answer was ${correctLetter}.`;
            feedbackMsg.classList.add('show', 'wrong');

            // highlight correct
            allButtons.forEach(b => {
                if(b.querySelector('.opt-letter').innerText === correctLetter) {
                    b.classList.add('correct');
                }
            });
        }

        if (currentIdx < questions.length - 1) {
            nextBtn.style.display = "flex";
        } else {
            feedbackMsg.innerText += " Test Complete!";
        }
    }

    nextBtn.addEventListener('click', () => {
        currentIdx++;
        loadQuestion(currentIdx);
    });

    // Particle effect hook (uses main.js)
    function createParticles(rect) {
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        if(typeof window.spawnClickParticles === 'function') {
            window.spawnClickParticles(x, y);
        }
    }
});
