/* =========================================================
   BIRTHDAY SURPRISE WEBSITE
   Made with ❤️ by Shraddha
========================================================= */

// Change only this value to personalize the surprise.
const RECIPIENT_NAME = "Bhayia";

// Wait until the HTML is ready before looking up elements or attaching events.
document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const treeScreen = $("treeScreen");
    const memories = $("memories");
    const pokemonScreen = $("pokemonScreen");
    const finalScreen = $("finalScreen");
    const startButton = $("startButton");
    const continueButton = $("continueButton");
    const pokemonButton = $("pokemonButton");
    const finalButton = $("finalButton");
    const replayButton = $("replayButton");
    const music = $("birthdayMusic");
    const pokemonIntro = $("pokemonIntro");
    const pokeball = $("pokeball");
    const photoReveal = $("photoReveal");
    const canvas = $("treeCanvas");
    const ctx = canvas?.getContext("2d");

    // Set the recipient's name without relying on an undeclared variable.
    document.title = `Happy Birthday ${RECIPIENT_NAME}`;
    [$("introName"), $("finalName"), ...document.querySelectorAll(".recipient-name")]
        .filter(Boolean)
        .forEach((element) => {
            element.textContent = RECIPIENT_NAME;
        });

    function showScreen(screen) {
        if (!screen) return;
        document.querySelectorAll(".screen").forEach((item) => {
            item.classList.remove("active");
        });
        screen.classList.add("active");
    }

    function startMusic() {
        if (!music) return;
        music.volume = 0.45;
        const playPromise = music.play();
        if (playPromise?.catch) {
            playPromise.catch((error) => {
                // Browsers may block audio; the surprise should still work.
                console.info("Music could not be started:", error);
            });
        }
    }

    // Tree animation state.
    let width = window.innerWidth;
    let height = window.innerHeight;
    let branches = [];
    let hearts = [];
    let particles = [];
    let treeProgress = 0;
    let treeStarted = false;
    let animationFrameStarted = false;

    function resizeCanvas() {
        if (!canvas || !ctx) return;
        const ratio = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function createBranch(x, y, length, angle, thickness, depth) {
        if (depth <= 0) return;
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        branches.push({ x1: x, y1: y, x2: endX, y2: endY, thickness });
        const nextLength = length * 0.72;
        const spread = 0.48;
        createBranch(endX, endY, nextLength, angle - spread, thickness * 0.68, depth - 1);
        createBranch(endX, endY, nextLength, angle + spread, thickness * 0.68, depth - 1);
    }

    function createTree() {
        branches = [];
        createBranch(width / 2, Math.min(height * 0.9, 720), height * 0.28, -Math.PI / 2, 14, 7);
    }

    function createHearts() {
        hearts = [];
        branches.forEach((branch, index) => {
            if (index % 2 !== 0) return;
            const t = Math.random() * 0.85 + 0.08;
            hearts.push({
                x: branch.x1 + (branch.x2 - branch.x1) * t,
                y: branch.y1 + (branch.y2 - branch.y1) * t,
                size: Math.random() * 5 + 4,
                delay: Math.random() * 0.7,
                opacity: 0
            });
        });
    }

    function createParticles() {
        particles = Array.from({ length: 120 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.4 + 0.1,
            opacity: Math.random() * 0.5 + 0.2
        }));
    }

    function drawHeart(x, y, size, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size, size);
        ctx.beginPath();
        ctx.moveTo(0, 0.3);
        ctx.bezierCurveTo(-1.2, -0.5, -0.7, -1.5, 0, -0.8);
        ctx.bezierCurveTo(0.7, -1.5, 1.2, -0.5, 0, 0.3);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 70, 145, ${opacity})`;
        ctx.shadowColor = "rgba(255,70,150,.9)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
    }

    function drawTree() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
            particle.y -= particle.speed;
            if (particle.y < -10) particle.y = height + 10;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,190,220,${particle.opacity})`;
            ctx.fill();
        });

        const ground = ctx.createRadialGradient(width / 2, height * 0.9, 0, width / 2, height * 0.9, 300);
        ground.addColorStop(0, "rgba(255,60,150,.25)");
        ground.addColorStop(1, "rgba(255,60,150,0)");
        ctx.fillStyle = ground;
        ctx.fillRect(0, height * 0.72, width, height * 0.28);

        branches.forEach((branch, index) => {
            const progress = Math.min(1, treeProgress - (index / branches.length) * 0.3);
            if (progress <= 0) return;
            ctx.beginPath();
            ctx.moveTo(branch.x1, branch.y1);
            ctx.lineTo(
                branch.x1 + (branch.x2 - branch.x1) * progress,
                branch.y1 + (branch.y2 - branch.y1) * progress
            );
            ctx.strokeStyle = "rgba(110,65,75,.95)";
            ctx.lineWidth = branch.thickness;
            ctx.lineCap = "round";
            ctx.stroke();
        });

        hearts.forEach((heart) => {
            if (treeProgress < heart.delay) return;
            heart.opacity = Math.min(1, heart.opacity + 0.025);
            const pulse = 1 + Math.sin(Date.now() * 0.003 + heart.x) * 0.08;
            drawHeart(heart.x, heart.y, heart.size * pulse, heart.opacity);
        });

        if (treeStarted) treeProgress = Math.min(1.25, treeProgress + 0.0035);
        requestAnimationFrame(drawTree);
    }

    function showBirthdayMessage() {
        const container = $("messageLines");
        if (!container) return;
        container.style.display = "block";
        const lines = container.querySelectorAll("p");
        lines.forEach((line, index) => {
            window.setTimeout(() => line.classList.add("show"), index * 1000);
        });
        window.setTimeout(() => {
            continueButton?.classList.add("visible");
        }, lines.length * 1000 + 1000);
    }

    function startTreeAnimation() {
        if (treeStarted || !ctx) return;
        treeStarted = true;
        treeProgress = 0;
        createTree();
        createHearts();
        createParticles();
        if (!animationFrameStarted) {
            animationFrameStarted = true;
            drawTree();
        }
        window.setTimeout(showBirthdayMessage, 4500);
    }

    function createEnergyExplosion() {
        const symbols = ["⚡", "✨", "💖", "❤️", "⭐", "🌸", "💫"];
        for (let i = 0; i < 65; i += 1) {
            const element = document.createElement("div");
            element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            Object.assign(element.style, {
                position: "fixed",
                left: "50%",
                top: "50%",
                zIndex: "200",
                pointerEvents: "none",
                fontSize: `${Math.random() * 20 + 10}px`,
                transition: "transform 1.4s ease-out, opacity 1.4s ease-out"
            });
            document.body.appendChild(element);
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 350;
            requestAnimationFrame(() => {
                element.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(${Math.random() + 0.5})`;
                element.style.opacity = "0";
            });
            window.setTimeout(() => element.remove(), 1600);
        }
    }

    function openPokeball() {
        if (!pokeball || pokeball.dataset.opened === "true") return;
        pokeball.dataset.opened = "true";
        pokeball.classList.add("open");
        createEnergyExplosion();
        window.setTimeout(() => pokemonIntro?.classList.add("hide"), 300);
        window.setTimeout(() => photoReveal?.classList.add("show"), 700);
    }

    function createConfetti() {
        const container = $("confetti");
        if (!container) return;
        container.replaceChildren();
        const symbols = ["❤️", "💕", "💖", "✨", "🌸", "🎉", "⭐", "🎀", "⚡"];
        for (let i = 0; i < 110; i += 1) {
            const piece = document.createElement("div");
            piece.className = "confetti";
            piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            piece.style.left = `${Math.random() * 100}vw`;
            piece.style.fontSize = `${Math.random() * 15 + 8}px`;
            piece.style.animationDuration = `${Math.random() * 3 + 3}s`;
            piece.style.animationDelay = `${Math.random() * 1.5}s`;
            container.appendChild(piece);
        }
    }

    // Register button actions only when their matching HTML elements exist.
    startButton?.addEventListener("click", () => {
        startMusic();
        showScreen(treeScreen);
        window.setTimeout(startTreeAnimation, 300);
    });

    continueButton?.addEventListener("click", () => showScreen(memories));
    pokemonButton?.addEventListener("click", () => showScreen(pokemonScreen));
    pokeball?.addEventListener("click", openPokeball);
    pokeball?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPokeball();
        }
    });
    finalButton?.addEventListener("click", () => {
        showScreen(finalScreen);
        createConfetti();
    });
    replayButton?.addEventListener("click", () => window.location.reload());

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
});