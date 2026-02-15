document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('card');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const resultPre = document.getElementById('ascii-heart');
    const percentageEl = document.getElementById('percentage');
    const messageEl = document.getElementById('message');
    const scene = document.querySelector('.scene');

    // Initialize Supabase
    // Uses global variables from config.js
    let supabase;
    try {
        if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase initialized!");
        } else {
            console.warn("Supabase credentials not set in config.js");
        }
    } catch (e) {
        console.error("Error initializing Supabase:", e);
    }

    // 3D Tilt Effect
    scene.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        if (!card.classList.contains('is-flipped')) {
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });

    scene.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
    });

    scene.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s ease';
        if (!card.classList.contains('is-flipped')) {
            card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        }
    });


    calculateBtn.addEventListener('click', () => {
        const name1 = name1Input.value.trim();
        const name2 = name2Input.value.trim();

        if (name1 && name2) {
            const lovePercentage = calculateLove(name1, name2);
            displayResult(lovePercentage);
            saveLoveResult(name1, name2, lovePercentage); // Save to DB
            card.style.transform = `rotateY(180deg)`;
            card.classList.add('is-flipped');
        } else {
            alert("Please enter two names via the keyboard interface!");
        }
    });

    resetBtn.addEventListener('click', () => {
        card.classList.remove('is-flipped');
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        setTimeout(() => {
            name1Input.value = '';
            name2Input.value = '';
        }, 300);
    });

    function calculateLove(name1, name2) {
        // Deterministic hash based on names
        const combined = (name1 + name2).toLowerCase().replace(/[^a-z]/g, '');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = combined.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash % 101); // 0-100
    }

    function displayResult(percentage) {
        const heartAscii = generateHeart(percentage);
        resultPre.textContent = heartAscii;

        // Animate counter
        let current = 0;
        const interval = setInterval(() => {
            percentageEl.textContent = `${current}%`;
            if (current >= percentage) {
                clearInterval(interval);
                messageEl.textContent = getMessage(percentage);
            }
            current++;
        }, 20);
    }

    function saveLoveResult(n1, n2, score) {
        const statusEl = document.getElementById('save-status');
        statusEl.textContent = "Saving to history...";

        if (!supabase) {
            statusEl.textContent = "⚠ Not saved: Database config missing.";
            statusEl.style.color = "#ff5555";
            return;
        }

        supabase
            .from('love_calculations')
            .insert([{ name1: n1, name2: n2, percentage: score }])
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error saving to Supabase:', error);
                    statusEl.textContent = "⚠ Save failed (Check console)";
                    statusEl.style.color = "#ff5555";
                } else {
                    console.log('Love calculation saved:', data);
                    statusEl.textContent = "♥ Saved to Love Log! ♥";
                    statusEl.style.color = "var(--text-color)";
                }
            });
    }

    function getMessage(percentage) {
        if (percentage > 90) return "PERFECT MATCH! <3";
        if (percentage > 75) return "True Love!";
        if (percentage > 50) return "There's a spark!";
        if (percentage > 30) return "Just Friends?";
        return "Not Compatible... Try new names!";
    }

    function generateHeart(fillPercent) {
        // Simple ASCII heart
        // In a real extensive ASCII art generator, we would map pixels to chars.
        // Here we just return a static heart but maybe change color or inner text?
        // Let's verify the text first.

        return `
      ******       ******
    **********   **********
  ************* *************
 *****************************
 *****************************
  ***************************
    ***********************
      *******************
        ***************
          ***********
            *******
              ***
               *
        `;
    }
});
