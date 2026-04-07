document.addEventListener('DOMContentLoaded', async () => {
    const qCounter = document.getElementById('q-counter');
    const qText = document.getElementById('q-text');
    const gfInput = document.getElementById('gf-input');
    const submitBtn = document.getElementById('submit-btn');
    const feedbackMsg = document.getElementById('feedback-msg');
    const nextBtn = document.getElementById('next-btn');
    const scoreSpan = document.getElementById('score');

    let questions = [];
    let currentIdx = 0;
    let score = 0;
    let isAnswered = false;

    // Expose loadQuestion to window for server sync
    window.loadQuestionFromState = function(idx) {
        if (currentIdx !== idx || isAnswered === false) { 
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
        questions = data.gap_fill || [];
        if (questions.length > 0) {
            loadQuestion(currentIdx);
            
            // Default to hiding the question unless told otherwise
            qText.style.visibility = 'hidden';
            gfInput.style.visibility = 'hidden';
            submitBtn.style.visibility = 'hidden';
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
        
        gfInput.value = "";
        gfInput.disabled = false;
        gfInput.className = "gap-fill-input";
        gfInput.focus();

        feedbackMsg.className = "feedback-msg";
        feedbackMsg.innerText = "";
        
        submitBtn.style.display = "block";
        nextBtn.style.display = "none";
    }

    function handleSubmit() {
        if (isAnswered) return;
        const userAnswer = gfInput.value.trim().toLowerCase();
        if (userAnswer === "") return;

        isAnswered = true;
        gfInput.disabled = true;
        submitBtn.style.display = "none";

        const correctAnswer = questions[currentIdx].correct_answer.toLowerCase();

        if (userAnswer === correctAnswer) {
            if (window.playSuccess) window.playSuccess();
            gfInput.className = "gap-fill-input success";
            feedbackMsg.innerText = "Perfect! Right on the mark.";
            feedbackMsg.classList.add('show', 'correct');
            score++;
            scoreSpan.innerText = score;
            createParticles();
        } else {
            if (window.playError) window.playError();
            gfInput.className = "gap-fill-input error";
            feedbackMsg.innerHTML = `Incorrect. The correct answer is:<br><strong>${questions[currentIdx].correct_answer}</strong>`;
            feedbackMsg.classList.add('show', 'wrong');
        }

        // Let server handle 'Next' transitions
        nextBtn.style.display = "none";
    }

    submitBtn.addEventListener('click', handleSubmit);

    gfInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });



    // Particle effect hook
    function createParticles() {
        const rect = gfInput.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        if(typeof window.spawnClickParticles === 'function') {
            window.spawnClickParticles(x, y);
        }
    }
});
