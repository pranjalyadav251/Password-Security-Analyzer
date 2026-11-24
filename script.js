const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("toggle");

toggleBtn.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        toggleBtn.textContent = "Show";
    }
});
const barFill = document.getElementById("barFill");
const strengthText = document.getElementById("strengthText");

function setRule(id, passed) {
    document.getElementById(id).classList.toggle("ok", passed);
}

const entropyText = document.getElementById("entropyText");
const warningText = document.getElementById("warningText");

const commonPasswords = [
    "password", "123456", "12345678", "123456789", "qwerty", "abc123",
    "admin", "letmein", "welcome", "iloveyou", "monkey", "dragon",
    "football", "login", "master", "hello", "india", "india123",
    "000000", "111111", "123123", "qwerty123", "pass", "test"
];

function crackTime(password) {
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 32;

    const bits = password.length * Math.log2(pool);
    const seconds = Math.pow(2, bits) / 1e10;   // 10 billion guesses/second maan ke
    return { bits: bits, seconds: seconds };
}

function formatTime(s) {
    if (s < 1) return "less than a second";
    if (s < 60) return Math.round(s) + " seconds";
    if (s < 3600) return Math.round(s / 60) + " minutes";
    if (s < 86400) return Math.round(s / 3600) + " hours";
    if (s < 31536000) return Math.round(s / 86400) + " days";
    if (s < 31536000 * 1000000) return Math.round(s / 31536000) + " years";
    return "millions of years";
}

passwordInput.addEventListener("input", function () {
    const password = passwordInput.value;

    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    setRule("r-length", hasLength);
    setRule("r-upper", hasUpper);
    setRule("r-lower", hasLower);
    setRule("r-number", hasNumber);
    setRule("r-symbol", hasSymbol);

    if (password.length === 0) {
        barFill.style.width = "0%";
        strengthText.textContent = "Strength: -";
        entropyText.textContent = "";
        warningText.textContent = "";
        return;
    }

    let score = 0;
    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;

        const lower = password.toLowerCase();
    const lettersOnly = lower.replace(/[^a-z]/g, "");
    const isCommon = commonPasswords.includes(lower) || commonPasswords.includes(lettersOnly);

    if (isCommon) {
        score = Math.min(score, 1);
        warningText.textContent = "⚠ This is a very common password. Attackers try it first!";
    } else {
        warningText.textContent = "";
    }

    const labels = ["Very Weak", "Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
    const colors = ["#ef4444", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
    const stars = "★".repeat(score) + "☆".repeat(5 - score);

    barFill.style.width = (score / 5) * 100 + "%";
    barFill.style.backgroundColor = colors[score];
    strengthText.textContent = "Rating: " + score + "/5  " + stars + "  (" + labels[score] + ")";
        if (isCommon) {
        entropyText.textContent = "Estimated crack time: instantly (found in common password list)";
    } else {
        const info = crackTime(password);
        entropyText.textContent = "Entropy: " + Math.round(info.bits) + " bits | Estimated crack time: " + formatTime(info.seconds);
    }

});
const lengthSlider = document.getElementById("length");
const lenVal = document.getElementById("lenVal");
const generatedBox = document.getElementById("generated");

lengthSlider.addEventListener("input", function () {
    lenVal.textContent = lengthSlider.value;
});

function generatePassword() {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=?";

    let groups = [lower];
    if (document.getElementById("upper").checked) groups.push(upper);
    if (document.getElementById("numbers").checked) groups.push(numbers);
    if (document.getElementById("symbols").checked) groups.push(symbols);

    const allChars = groups.join("");
    const size = Number(lengthSlider.value);

    const rand = new Uint32Array(size);
    crypto.getRandomValues(rand);

    let result = [];

    // 1) Har group se ek akshar pakka
    for (let i = 0; i < groups.length; i++) {
        result.push(groups[i][rand[i] % groups[i].length]);
    }

    // 2) Baaki jagah poore pool se random
    for (let i = groups.length; i < size; i++) {
        result.push(allChars[rand[i] % allChars.length]);
    }

    // 3) Shuffle, taaki pakke wale akshar hamesha shuru mein na rahein
    for (let i = result.length - 1; i > 0; i--) {
        const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result.join("");
}

document.getElementById("generate").addEventListener("click", function () {
    generatedBox.value = generatePassword();
});
const copyBtn = document.getElementById("copy");

copyBtn.addEventListener("click", function () {
    const text = generatedBox.value;

    if (text === "") {
        copyBtn.textContent = "Empty!";
    } else {
        navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied!";
    }

    setTimeout(function () {
        copyBtn.textContent = "Copy";
    }, 1500);
});
document.getElementById("check").addEventListener("click", function () {
    if (generatedBox.value === "") return;

    passwordInput.value = generatedBox.value;
    passwordInput.dispatchEvent(new Event("input"));

    window.scrollTo({ top: 0, behavior: "smooth" });
});