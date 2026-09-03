// =========================
// Rissa's Garden — data model
// =========================
const STORAGE_KEY = "rissaGardenSaveV1";

function getTodayDate() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}

const defaultPlayerData = {
    version: 3,
    selectedDate: getTodayDate(),
    ml: { xp: 0, inputMinutes: 0, noteWords: 0, questions: 0 },
    research: { xp: 0, readingMinutes: 0, outputWords: 0 },
    english: { xp: 0, sentences: 0 },
    life: { xp: 0, artMinutes: 0, exerciseMinutes: 0, happyEvents: 0 },
    purse: {
        xp: 0,
        income: 0,
        expense: 0,
        transport: 0,
        food: 0,
        housing: 0,
        other: 0
    },
    logs: []
};

function cloneDefaultData() {
    return JSON.parse(JSON.stringify(defaultPlayerData));
}

function loadPlayerData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData === null) return cloneDefaultData();

    try {
        const parsedData = JSON.parse(savedData);
        return {
            ...cloneDefaultData(),
            ...parsedData,
            version: 3,

            // Every fresh app launch starts on the device's current local date.
            // Manual back-filling is still available through the date picker.
            selectedDate: getTodayDate(),

            ml: { ...defaultPlayerData.ml, ...(parsedData.ml || {}) },
            research: { ...defaultPlayerData.research, ...(parsedData.research || {}) },
            english: { ...defaultPlayerData.english, ...(parsedData.english || {}) },
            life: { ...defaultPlayerData.life, ...(parsedData.life || {}) },
            purse: { ...defaultPlayerData.purse, ...(parsedData.purse || {}) },
            logs: Array.isArray(parsedData.logs) ? parsedData.logs : []
        };
    } catch (error) {
        console.error("Save data could not be read:", error);
        return cloneDefaultData();
    }
}


let playerData = loadPlayerData();

// =========================
// Sound system
// =========================
const SOUND_SETTING_KEY = "rissaGardenSoundEnabledV1";

const soundBank = {
    click: {
        audio: new Audio("sounds/click.mp3"),
        volume: 0.42
    },
    confirm: {
        audio: new Audio("sounds/confirm.mp3"),
        volume: 0.30
    },
    counter: {
        audio: new Audio("sounds/counter.mp3"),
        volume: 0.34
    },
    xp: {
        audio: new Audio("sounds/xp.mp3"),
        volume: 0.28
    },
    levelUp: {
        audio: new Audio("sounds/level-up.mp3"),
        volume: 0.30
    }
};

Object.values(soundBank).forEach(function (item) {
    item.audio.preload = "auto";
});

let soundEnabled = localStorage.getItem(SOUND_SETTING_KEY) !== "false";

function playSound(name) {
    if (!soundEnabled || !soundBank[name]) return;

    const sound = soundBank[name];
    const audio = sound.audio.cloneNode();
    audio.volume = sound.volume;
    audio.play().catch(function () {
        // A browser may block audio until the first direct user interaction.
    });
}


function savePlayerData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
}

// =========================
// XP system
// =========================
const XP_RULES = {
    ml: {
        inputMinute: 0.15,
        noteWord: 0.05,
        question: 10
    },
    research: {
        readingMinute: 1 / 6,
        outputWord: 0.05
    },
    english: {
        sentence: 1
    },
    life: {
        artMinute: 0.15,
        exerciseMinute: 0.2,
        happyEvent: 20
    },

    // Purse XP uses a separate cumulative-income curve.
    // F(total income in AUD) = 30 * sqrt(total income).
    // Each income entry earns only the increase F(after) - F(before).
    // This makes income strongly rewarding while naturally slowing at scale.
    purse: {
        incomeCurveScale: 30
    }
};

function roundXP(value) {
    return Math.round(Math.max(0, value));
}

function roundMoney(value) {
    return Math.round((Math.max(0, Number(value) || 0) + Number.EPSILON) * 100) / 100;
}

function calculatePurseCurveXP(totalIncomeAUD) {
    const income = Math.max(0, Number(totalIncomeAUD) || 0);
    return roundXP(XP_RULES.purse.incomeCurveScale * Math.sqrt(income));
}

function calculatePurseIncomeXPGain(incomeAUD) {
    const income = roundMoney(incomeAUD);
    if (income <= 0) return 0;

    const before = calculatePurseCurveXP(playerData.purse.income);
    const after = calculatePurseCurveXP(
        roundMoney(playerData.purse.income + income)
    );

    return Math.max(0, after - before);
}

function getRequiredXP(level) {
    return Math.round(100 * Math.pow(1.18, level - 1));
}

function calculateLevel(totalXP) {
    let level = 1;
    let remainingXP = Math.max(0, Number(totalXP) || 0);

    while (remainingXP >= getRequiredXP(level)) {
        remainingXP -= getRequiredXP(level);
        level += 1;
    }

    const requiredXP = getRequiredXP(level);
    return {
        level,
        currentXP: Math.round(remainingXP * 100) / 100,
        requiredXP,
        progressPercent: Math.min(100, remainingXP / requiredXP * 100)
    };
}

function calculateOverallLevel() {
    const overallXP = (
        playerData.ml.xp +
        playerData.research.xp +
        playerData.english.xp +
        playerData.life.xp +
        playerData.purse.xp
    ) / 5;

    return calculateLevel(overallXP);
}

// =========================
// Elements
// =========================
const pages = {
    start: document.querySelector("#startPage"),
    home: document.querySelector("#homePage"),
    experience: document.querySelector("#experiencePage"),
    mlDetail: document.querySelector("#mlDetailPage"),
    researchDetail: document.querySelector("#researchDetailPage"),
    englishDetail: document.querySelector("#englishDetailPage"),
    lifeDetail: document.querySelector("#lifeDetailPage"),
    purseDetail: document.querySelector("#purseDetailPage"),
    expenseBreakdown: document.querySelector("#expenseBreakdownPage"),
    mode: document.querySelector("#modePage"),
    mlMode: document.querySelector("#mlModePage"),
    researchMode: document.querySelector("#researchModePage"),
    englishMode: document.querySelector("#englishModePage"),
    lifeMode: document.querySelector("#lifeModePage"),
    purseMode: document.querySelector("#purseModePage")
};

const startButton = document.querySelector("#startButton");
const experienceButton = document.querySelector("#experienceButton");
const modeButton = document.querySelector("#modeButton");
const backToStartButton = document.querySelector("#backToStartButton");
const backToHomeFromExperience = document.querySelector("#backToHomeFromExperience");
const backToHomeFromMode = document.querySelector("#backToHomeFromMode");
const purseExpenseCard = document.querySelector("#purseExpenseCard");
const backToPurseFromExpense = document.querySelector("#backToPurseFromExpense");

const skillCards = {
    ml: document.querySelector("#mlSkillCard"),
    research: document.querySelector("#researchSkillCard"),
    english: document.querySelector("#englishSkillCard"),
    life: document.querySelector("#lifeSkillCard"),
    purse: document.querySelector("#purseSkillCard")
};

const modeCards = {
    ml: document.querySelector("#mlModeCard"),
    research: document.querySelector("#researchModeCard"),
    english: document.querySelector("#englishModeCard"),
    life: document.querySelector("#lifeModeCard"),
    purse: document.querySelector("#purseModeCard")
};

const detailBackButtons = document.querySelectorAll(".detail-back-button");
const modeDetailBackButtons = document.querySelectorAll(".mode-detail-back-button");
const dateInputs = document.querySelectorAll(".shared-date-input");

const confirmationOverlay = document.querySelector("#confirmationOverlay");
const confirmationSummary = document.querySelector("#confirmationSummary");
const cancelConfirmationButton = document.querySelector("#cancelConfirmationButton");
const confirmEntryButton = document.querySelector("#confirmEntryButton");
const successToast = document.querySelector("#successToast");
const toastXPText = document.querySelector("#toastXPText");

const exportSaveButton = document.querySelector("#exportSaveButton");
const importSaveButton = document.querySelector("#importSaveButton");
const importSaveInput = document.querySelector("#importSaveInput");
const importOverlay = document.querySelector("#importOverlay");
const importSummary = document.querySelector("#importSummary");
const cancelImportButton = document.querySelector("#cancelImportButton");
const confirmImportButton = document.querySelector("#confirmImportButton");
const soundToggleButton = document.querySelector("#soundToggleButton");
const resetSaveButton = document.querySelector("#resetSaveButton");
const resetOverlay = document.querySelector("#resetOverlay");
const cancelResetButton = document.querySelector("#cancelResetButton");
const confirmResetButton = document.querySelector("#confirmResetButton");

// Fields
const fields = {
    mlInputMinutes: document.querySelector("#mlInputMinutesField"),
    mlNoteWords: document.querySelector("#mlNoteWordsField"),
    mlQuestionCount: document.querySelector("#mlQuestionCount"),
    researchReadingMinutes: document.querySelector("#researchReadingMinutesField"),
    researchOutputWords: document.querySelector("#researchOutputWordsField"),
    englishSentences: document.querySelector("#englishSentencesField"),
    lifeArtMinutes: document.querySelector("#lifeArtMinutesField"),
    lifeExerciseMinutes: document.querySelector("#lifeExerciseMinutesField"),
    lifeJoyCount: document.querySelector("#lifeJoyCount"),
    purseIncome: document.querySelector("#purseIncomeField"),
    purseTransport: document.querySelector("#purseTransportField"),
    purseFood: document.querySelector("#purseFoodField"),
    purseHousing: document.querySelector("#purseHousingField"),
    purseOther: document.querySelector("#purseOtherField"),
    purseOtherNote: document.querySelector("#purseOtherNoteField")
};

const previews = {
    ml: document.querySelector("#mlXPPreview"),
    research: document.querySelector("#researchXPPreview"),
    english: document.querySelector("#englishXPPreview"),
    life: document.querySelector("#lifeXPPreview"),
    purse: document.querySelector("#purseXPPreview"),
    purseExpense: document.querySelector("#purseExpensePreview")
};

let mlQuestionCounter = 0;
let lifeJoyCounter = 0;
let pendingEntry = null;
let pendingImportedData = null;
let toastTimer = null;
let dateWasManuallyChanged = false;

// =========================
// Navigation
// =========================
function switchPage(currentPage, nextPage) {
    currentPage.classList.add("fade-out");

    setTimeout(function () {
        currentPage.classList.add("hidden");
        currentPage.classList.remove("fade-out", "fade-in-active");

        nextPage.classList.remove("hidden");
        nextPage.classList.add("fade-in-start");

        requestAnimationFrame(function () {
            nextPage.classList.remove("fade-in-start");
            nextPage.classList.add("fade-in-active");
        });
    }, 600);
}

startButton.addEventListener("click", () => switchPage(pages.start, pages.home));

experienceButton.addEventListener("click", function () {
    renderExperience();
    switchPage(pages.home, pages.experience);
});

modeButton.addEventListener("click", function () {
    refreshAutomaticDate();
    syncDateInputs();
    switchPage(pages.home, pages.mode);
});

backToStartButton.addEventListener("click", () => switchPage(pages.home, pages.start));
backToHomeFromExperience.addEventListener("click", () => switchPage(pages.experience, pages.home));
backToHomeFromMode.addEventListener("click", () => switchPage(pages.mode, pages.home));

skillCards.ml.addEventListener("click", () => openDetail("ml"));
skillCards.research.addEventListener("click", () => openDetail("research"));
skillCards.english.addEventListener("click", () => openDetail("english"));
skillCards.life.addEventListener("click", () => openDetail("life"));
skillCards.purse.addEventListener("click", () => openDetail("purse"));

purseExpenseCard.addEventListener("click", function () {
    renderExperience();
    switchPage(pages.purseDetail, pages.expenseBreakdown);
});

backToPurseFromExpense.addEventListener("click", function () {
    renderExperience();
    switchPage(pages.expenseBreakdown, pages.purseDetail);
});

function openDetail(type) {
    renderExperience();
    switchPage(pages.experience, pages[`${type}Detail`]);
}

detailBackButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const currentDetailPage = button.closest(".detail-page");
        renderExperience();
        switchPage(currentDetailPage, pages.experience);
    });
});

modeCards.ml.addEventListener("click", () => openModeDetail("ml"));
modeCards.research.addEventListener("click", () => openModeDetail("research"));
modeCards.english.addEventListener("click", () => openModeDetail("english"));
modeCards.life.addEventListener("click", () => openModeDetail("life"));
modeCards.purse.addEventListener("click", () => openModeDetail("purse"));

function openModeDetail(type) {
    refreshAutomaticDate();
    syncDateInputs();
    updateAllPreviews();
    switchPage(pages.mode, pages[`${type}Mode`]);
}

modeDetailBackButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const currentModePage = button.closest(".mode-detail-page");
        switchPage(currentModePage, pages.mode);
    });
});

// =========================
// Date
// =========================
function syncDateInputs() {
    dateInputs.forEach(function (input) {
        input.value = playerData.selectedDate || getTodayDate();
    });
}

function refreshAutomaticDate() {
    if (dateWasManuallyChanged) return;

    const today = getTodayDate();

    if (playerData.selectedDate !== today) {
        playerData.selectedDate = today;
        savePlayerData();
        syncDateInputs();
    }
}

dateInputs.forEach(function (input) {
    input.addEventListener("change", function () {
        dateWasManuallyChanged = true;
        playerData.selectedDate = input.value || getTodayDate();
        savePlayerData();
        syncDateInputs();
    });
});

// No network request is needed: the PWA follows the device's local clock.
// If the app returns to the foreground on a new day, refresh automatically
// unless the user deliberately chose another date during this session.
document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        refreshAutomaticDate();
    }
});

// =========================
// Experience rendering
// =========================
function setLevelUI(prefix, levelData) {
    document.querySelector(`#${prefix}Level`).textContent = `Lv. ${levelData.level}`;
    document.querySelector(`#${prefix}XPFill`).style.width = `${levelData.progressPercent}%`;
    document.querySelector(`#${prefix}XPText`).textContent =
        `${formatNumber(levelData.currentXP)} / ${formatNumber(levelData.requiredXP)} XP`;
}

function formatNumber(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

function formatAUD(value) {
    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(roundMoney(value));
}

function renderExperience() {
    const overall = calculateOverallLevel();
    const ml = calculateLevel(playerData.ml.xp);
    const research = calculateLevel(playerData.research.xp);
    const english = calculateLevel(playerData.english.xp);
    const life = calculateLevel(playerData.life.xp);
    const purse = calculateLevel(playerData.purse.xp);

    setLevelUI("overall", overall);
    setLevelUI("ml", ml);
    setLevelUI("research", research);
    setLevelUI("english", english);
    setLevelUI("life", life);
    setLevelUI("purse", purse);

    setLevelUI("mlDetail", ml);
    setLevelUI("researchDetail", research);
    setLevelUI("englishDetail", english);
    setLevelUI("lifeDetail", life);
    setLevelUI("purseDetail", purse);

    document.querySelector("#mlInputMinutes").textContent = formatNumber(playerData.ml.inputMinutes);
    document.querySelector("#mlNoteWords").textContent = formatNumber(playerData.ml.noteWords);
    document.querySelector("#mlQuestions").textContent = formatNumber(playerData.ml.questions);

    document.querySelector("#researchReadingMinutes").textContent = formatNumber(playerData.research.readingMinutes);
    document.querySelector("#researchOutputWords").textContent = formatNumber(playerData.research.outputWords);

    document.querySelector("#englishSentences").textContent = formatNumber(playerData.english.sentences);

    document.querySelector("#lifeArtMinutes").textContent = formatNumber(playerData.life.artMinutes);
    document.querySelector("#lifeExerciseMinutes").textContent = formatNumber(playerData.life.exerciseMinutes);
    document.querySelector("#lifeHappyEvents").textContent = formatNumber(playerData.life.happyEvents);

    document.querySelector("#purseIncome").textContent = formatAUD(playerData.purse.income);
    document.querySelector("#purseExpense").textContent = formatAUD(playerData.purse.expense);

    document.querySelector("#expenseBreakdownTotal").textContent =
        `${formatAUD(playerData.purse.expense)} total`;
    document.querySelector("#expenseTransportTotal").textContent =
        formatAUD(playerData.purse.transport);
    document.querySelector("#expenseFoodTotal").textContent =
        formatAUD(playerData.purse.food);
    document.querySelector("#expenseHousingTotal").textContent =
        formatAUD(playerData.purse.housing);
    document.querySelector("#expenseOtherTotal").textContent =
        formatAUD(playerData.purse.other);
}

// =========================
// Input helpers and previews
// =========================
function readNonNegative(input) {
    const value = Number(input.value);
    return Number.isFinite(value) && value > 0 ? value : 0;
}

function calculateMLDraft() {
    const inputMinutes = readNonNegative(fields.mlInputMinutes);
    const noteWords = readNonNegative(fields.mlNoteWords);
    const questions = mlQuestionCounter;
    const xp = roundXP(
        inputMinutes * XP_RULES.ml.inputMinute +
        noteWords * XP_RULES.ml.noteWord +
        questions * XP_RULES.ml.question
    );
    return { mode: "ml", inputMinutes, noteWords, questions, xp };
}

function calculateResearchDraft() {
    const readingMinutes = readNonNegative(fields.researchReadingMinutes);
    const outputWords = readNonNegative(fields.researchOutputWords);
    const xp = roundXP(
        readingMinutes * XP_RULES.research.readingMinute +
        outputWords * XP_RULES.research.outputWord
    );
    return { mode: "research", readingMinutes, outputWords, xp };
}

function calculateEnglishDraft() {
    const sentences = readNonNegative(fields.englishSentences);
    const xp = roundXP(sentences * XP_RULES.english.sentence);
    return { mode: "english", sentences, xp };
}

function calculateLifeDraft() {
    const artMinutes = readNonNegative(fields.lifeArtMinutes);
    const exerciseMinutes = readNonNegative(fields.lifeExerciseMinutes);
    const happyEvents = lifeJoyCounter;
    const xp = roundXP(
        artMinutes * XP_RULES.life.artMinute +
        exerciseMinutes * XP_RULES.life.exerciseMinute +
        happyEvents * XP_RULES.life.happyEvent
    );
    return { mode: "life", artMinutes, exerciseMinutes, happyEvents, xp };
}

function calculatePurseDraft() {
    const income = roundMoney(readNonNegative(fields.purseIncome));
    const transport = roundMoney(readNonNegative(fields.purseTransport));
    const food = roundMoney(readNonNegative(fields.purseFood));
    const housing = roundMoney(readNonNegative(fields.purseHousing));
    const other = roundMoney(readNonNegative(fields.purseOther));
    const otherNote = fields.purseOtherNote.value.trim().slice(0, 120);

    const expenseTotal = roundMoney(
        transport + food + housing + other
    );

    const xp = calculatePurseIncomeXPGain(income);

    return {
        mode: "purse",
        income,
        transport,
        food,
        housing,
        other,
        otherNote,
        expenseTotal,
        xp,
        xpRuleVersion: 1
    };
}

function updateAllPreviews() {
    previews.ml.textContent = `${calculateMLDraft().xp} XP`;
    previews.research.textContent = `${calculateResearchDraft().xp} XP`;
    previews.english.textContent = `${calculateEnglishDraft().xp} XP`;
    previews.life.textContent = `${calculateLifeDraft().xp} XP`;

    const purseDraft = calculatePurseDraft();
    previews.purse.textContent = `${purseDraft.xp} XP`;
    previews.purseExpense.textContent = formatAUD(purseDraft.expenseTotal);
}

[
    fields.mlInputMinutes,
    fields.mlNoteWords,
    fields.researchReadingMinutes,
    fields.researchOutputWords,
    fields.englishSentences,
    fields.lifeArtMinutes,
    fields.lifeExerciseMinutes,
    fields.purseIncome,
    fields.purseTransport,
    fields.purseFood,
    fields.purseHousing,
    fields.purseOther
].forEach(function (input) {
    input.addEventListener("input", updateAllPreviews);
});

document.querySelector("#mlQuestionPlus").addEventListener("click", function () {
    mlQuestionCounter += 1;
    fields.mlQuestionCount.textContent = mlQuestionCounter;
    updateAllPreviews();
});
document.querySelector("#mlQuestionMinus").addEventListener("click", function () {
    mlQuestionCounter = Math.max(0, mlQuestionCounter - 1);
    fields.mlQuestionCount.textContent = mlQuestionCounter;
    updateAllPreviews();
});
document.querySelector("#lifeJoyPlus").addEventListener("click", function () {
    lifeJoyCounter += 1;
    fields.lifeJoyCount.textContent = lifeJoyCounter;
    updateAllPreviews();
});
document.querySelector("#lifeJoyMinus").addEventListener("click", function () {
    lifeJoyCounter = Math.max(0, lifeJoyCounter - 1);
    fields.lifeJoyCount.textContent = lifeJoyCounter;
    updateAllPreviews();
});

// =========================
// Confirmation
// =========================
document.querySelector("#reviewMLButton").addEventListener("click", () => reviewEntry(calculateMLDraft()));
document.querySelector("#reviewResearchButton").addEventListener("click", () => reviewEntry(calculateResearchDraft()));
document.querySelector("#reviewEnglishButton").addEventListener("click", () => reviewEntry(calculateEnglishDraft()));
document.querySelector("#reviewLifeButton").addEventListener("click", () => reviewEntry(calculateLifeDraft()));
document.querySelector("#reviewPurseButton").addEventListener("click", () => reviewEntry(calculatePurseDraft()));

function hasContent(entry) {
    if (entry.mode === "ml") return entry.inputMinutes > 0 || entry.noteWords > 0 || entry.questions > 0;
    if (entry.mode === "research") return entry.readingMinutes > 0 || entry.outputWords > 0;
    if (entry.mode === "english") return entry.sentences > 0;
    if (entry.mode === "life") return entry.artMinutes > 0 || entry.exerciseMinutes > 0 || entry.happyEvents > 0;
    if (entry.mode === "purse") return entry.income > 0 || entry.expenseTotal > 0;
    return false;
}

function reviewEntry(entry) {
    if (!hasContent(entry)) {
        showToast("Nothing to record yet.", 0);
        return;
    }

    pendingEntry = {
        ...entry,
        date: playerData.selectedDate || getTodayDate()
    };

    playSound("confirm");
    confirmationSummary.innerHTML = buildSummaryHTML(pendingEntry);
    confirmationOverlay.classList.remove("hidden");
    confirmationOverlay.setAttribute("aria-hidden", "false");
}

function buildSummaryHTML(entry) {
    const rows = [
        ["Record Date", entry.date],
        ["Mode", entry.mode.charAt(0).toUpperCase() + entry.mode.slice(1)]
    ];

    if (entry.mode === "ml") {
        rows.push(["Learning Input", `${entry.inputMinutes} min`]);
        rows.push(["Notes", `${entry.noteWords} words`]);
        rows.push(["Questions / Ideas", `${entry.questions}`]);
    } else if (entry.mode === "research") {
        rows.push(["Paper Reading", `${entry.readingMinutes} min`]);
        rows.push(["Research Output", `${entry.outputWords} words`]);
    } else if (entry.mode === "english") {
        rows.push(["RS Practice", `${entry.sentences} sentences`]);
    } else if (entry.mode === "life") {
        rows.push(["Drawing", `${entry.artMinutes} min`]);
        rows.push(["Exercise", `${entry.exerciseMinutes} min`]);
        rows.push(["Small Joys", `${entry.happyEvents}`]);
    } else if (entry.mode === "purse") {
        if (entry.income > 0) rows.push(["Income", formatAUD(entry.income)]);
        if (entry.transport > 0) rows.push(["Transport", formatAUD(entry.transport)]);
        if (entry.food > 0) rows.push(["Food", formatAUD(entry.food)]);
        if (entry.housing > 0) rows.push(["Housing", formatAUD(entry.housing)]);
        if (entry.other > 0) rows.push(["Other", formatAUD(entry.other)]);
        if (entry.otherNote) rows.push(["Other note", entry.otherNote]);
        if (entry.expenseTotal > 0) rows.push(["Total Expense", formatAUD(entry.expenseTotal)]);
    }

    rows.push([
        entry.mode === "purse" ? "Income XP" : "XP Gained",
        `+${entry.xp} XP`
    ]);

    return rows.map(function ([label, value]) {
        return `<div class="confirmation-row"><span>${label}</span><strong>${value}</strong></div>`;
    }).join("");
}

cancelConfirmationButton.addEventListener("click", closeConfirmation);
confirmationOverlay.addEventListener("click", function (event) {
    if (event.target === confirmationOverlay) closeConfirmation();
});

function closeConfirmation() {
    pendingEntry = null;
    confirmationOverlay.classList.add("hidden");
    confirmationOverlay.setAttribute("aria-hidden", "true");
}

confirmEntryButton.addEventListener("click", function () {
    if (!pendingEntry) return;

    const gainedXP = pendingEntry.xp;
    const mode = pendingEntry.mode;
    const previousSkillLevel = calculateLevel(playerData[mode].xp).level;
    const previousOverallLevel = calculateOverallLevel().level;

    applyEntry(pendingEntry);

    const nextSkillLevel = calculateLevel(playerData[mode].xp).level;
    const nextOverallLevel = calculateOverallLevel().level;
    const didLevelUp =
        nextSkillLevel > previousSkillLevel ||
        nextOverallLevel > previousOverallLevel;

    closeConfirmation();
    resetForm(mode);
    renderExperience();

    if (didLevelUp) {
        playSound("levelUp");
        showToast("A new level has bloomed.", gainedXP);
    } else {
        playSound("xp");
        showToast("Your garden remembers.", gainedXP);
    }
});

// =========================
// Save entries and logs
// =========================
function createRecordId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }
    return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function applyEntry(entry) {
    if (entry.mode === "ml") {
        playerData.ml.inputMinutes += entry.inputMinutes;
        playerData.ml.noteWords += entry.noteWords;
        playerData.ml.questions += entry.questions;
        playerData.ml.xp += entry.xp;
    } else if (entry.mode === "research") {
        playerData.research.readingMinutes += entry.readingMinutes;
        playerData.research.outputWords += entry.outputWords;
        playerData.research.xp += entry.xp;
    } else if (entry.mode === "english") {
        playerData.english.sentences += entry.sentences;
        playerData.english.xp += entry.xp;
    } else if (entry.mode === "life") {
        playerData.life.artMinutes += entry.artMinutes;
        playerData.life.exerciseMinutes += entry.exerciseMinutes;
        playerData.life.happyEvents += entry.happyEvents;
        playerData.life.xp += entry.xp;
    } else if (entry.mode === "purse") {
        playerData.purse.income = roundMoney(playerData.purse.income + entry.income);
        playerData.purse.transport = roundMoney(playerData.purse.transport + entry.transport);
        playerData.purse.food = roundMoney(playerData.purse.food + entry.food);
        playerData.purse.housing = roundMoney(playerData.purse.housing + entry.housing);
        playerData.purse.other = roundMoney(playerData.purse.other + entry.other);
        playerData.purse.expense = roundMoney(playerData.purse.expense + entry.expenseTotal);
        playerData.purse.xp += entry.xp;
    }

    playerData.logs.push({
        id: createRecordId(),
        date: entry.date,
        timestamp: new Date().toISOString(),
        ...entry
    });

    savePlayerData();
}

function resetForm(mode) {
    if (mode === "ml") {
        fields.mlInputMinutes.value = 0;
        fields.mlNoteWords.value = 0;
        mlQuestionCounter = 0;
        fields.mlQuestionCount.textContent = 0;
    } else if (mode === "research") {
        fields.researchReadingMinutes.value = 0;
        fields.researchOutputWords.value = 0;
    } else if (mode === "english") {
        fields.englishSentences.value = 0;
    } else if (mode === "life") {
        fields.lifeArtMinutes.value = 0;
        fields.lifeExerciseMinutes.value = 0;
        lifeJoyCounter = 0;
        fields.lifeJoyCount.textContent = 0;
    } else if (mode === "purse") {
        fields.purseIncome.value = 0;
        fields.purseTransport.value = 0;
        fields.purseFood.value = 0;
        fields.purseHousing.value = 0;
        fields.purseOther.value = 0;
        fields.purseOtherNote.value = "";
    }

    updateAllPreviews();
}

// =========================
// Toast
// =========================
function showToast(message, xp) {
    successToast.querySelector("strong").textContent = message;
    toastXPText.textContent = xp > 0 ? `+${xp} XP` : "";
    successToast.classList.remove("hidden");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        successToast.classList.add("hidden");
    }, 2400);
}

// =========================
// Export / Import save files
// =========================
function exportSave() {
    const payload = {
        app: "Rissa's Garden",
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        playerData: playerData
    };

    const blob = new Blob(
        [JSON.stringify(payload, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rissa-garden-save-${getTodayDate()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    playSound("confirm");
    showToast("Save exported.", 0);
}

function normalizeImportedData(rawData) {
    const candidate =
        rawData && typeof rawData === "object" && rawData.playerData
            ? rawData.playerData
            : rawData;

    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        throw new Error("This file does not contain a valid Rissa's Garden save.");
    }

    const normalized = {
        ...cloneDefaultData(),
        ...candidate,
        version: 3,
        selectedDate: getTodayDate(),
        ml: { ...defaultPlayerData.ml, ...(candidate.ml || {}) },
        research: { ...defaultPlayerData.research, ...(candidate.research || {}) },
        english: { ...defaultPlayerData.english, ...(candidate.english || {}) },
        life: { ...defaultPlayerData.life, ...(candidate.life || {}) },
        purse: { ...defaultPlayerData.purse, ...(candidate.purse || {}) },
        logs: Array.isArray(candidate.logs) ? candidate.logs : []
    };

    const numericFields = [
        ["ml", "xp"], ["ml", "inputMinutes"], ["ml", "noteWords"], ["ml", "questions"],
        ["research", "xp"], ["research", "readingMinutes"], ["research", "outputWords"],
        ["english", "xp"], ["english", "sentences"],
        ["life", "xp"], ["life", "artMinutes"], ["life", "exerciseMinutes"], ["life", "happyEvents"],
        ["purse", "xp"], ["purse", "income"], ["purse", "expense"],
        ["purse", "transport"], ["purse", "food"], ["purse", "housing"], ["purse", "other"]
    ];

    numericFields.forEach(function ([section, field]) {
        const value = Number(normalized[section][field]);
        normalized[section][field] = Number.isFinite(value) && value >= 0 ? value : 0;
    });

    ["income", "expense", "transport", "food", "housing", "other"].forEach(function (field) {
        normalized.purse[field] = roundMoney(normalized.purse[field]);
    });

    normalized.purse.xp = roundXP(normalized.purse.xp);

    return normalized;
}

function buildImportSummary(data, metadata) {
    const totalXP =
        data.ml.xp +
        data.research.xp +
        data.english.xp +
        data.life.xp +
        data.purse.xp;

    const exportedAt =
        metadata && metadata.exportedAt
            ? new Date(metadata.exportedAt).toLocaleString()
            : "Not recorded";

    return [
        ["Exported", exportedAt],
        ["Daily Logs", String(data.logs.length)],
        ["Combined XP", formatNumber(totalXP)],
        ["ML / Research", `${formatNumber(data.ml.xp)} / ${formatNumber(data.research.xp)} XP`],
        ["English / Life", `${formatNumber(data.english.xp)} / ${formatNumber(data.life.xp)} XP`],
        ["Purse", `${formatNumber(data.purse.xp)} XP · ${formatAUD(data.purse.income)} in · ${formatAUD(data.purse.expense)} out`]
    ].map(function ([label, value]) {
        return `<div class="confirmation-row"><span>${label}</span><strong>${value}</strong></div>`;
    }).join("");
}

exportSaveButton.addEventListener("click", exportSave);

importSaveButton.addEventListener("click", function () {
    importSaveInput.click();
});

importSaveInput.addEventListener("change", async function () {
    const file = importSaveInput.files && importSaveInput.files[0];
    if (!file) return;

    try {
        const rawText = await file.text();
        const parsed = JSON.parse(rawText);
        pendingImportedData = normalizeImportedData(parsed);
        importSummary.innerHTML = buildImportSummary(pendingImportedData, parsed);

        playSound("confirm");
        importOverlay.classList.remove("hidden");
        importOverlay.setAttribute("aria-hidden", "false");
    } catch (error) {
        console.error(error);
        showToast("That save file could not be read.", 0);
    } finally {
        importSaveInput.value = "";
    }
});

function closeImportOverlay() {
    pendingImportedData = null;
    importOverlay.classList.add("hidden");
    importOverlay.setAttribute("aria-hidden", "true");
}

cancelImportButton.addEventListener("click", closeImportOverlay);

importOverlay.addEventListener("click", function (event) {
    if (event.target === importOverlay) closeImportOverlay();
});

confirmImportButton.addEventListener("click", function () {
    if (!pendingImportedData) return;

    playerData = pendingImportedData;
    dateWasManuallyChanged = false;
    savePlayerData();
    syncDateInputs();
    renderExperience();
    updateAllPreviews();
    closeImportOverlay();

    playSound("xp");
    showToast("Save restored.", 0);
});

// =========================
// Reset save
// =========================
resetSaveButton.addEventListener("click", function () {
    playSound("confirm");
    resetOverlay.classList.remove("hidden");
    resetOverlay.setAttribute("aria-hidden", "false");
});

function closeResetOverlay() {
    resetOverlay.classList.add("hidden");
    resetOverlay.setAttribute("aria-hidden", "true");
}

cancelResetButton.addEventListener("click", closeResetOverlay);

resetOverlay.addEventListener("click", function (event) {
    if (event.target === resetOverlay) closeResetOverlay();
});

confirmResetButton.addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    playerData = cloneDefaultData();
    dateWasManuallyChanged = false;

    mlQuestionCounter = 0;
    lifeJoyCounter = 0;

    resetForm("ml");
    resetForm("research");
    resetForm("english");
    resetForm("life");
    resetForm("purse");

    savePlayerData();
    syncDateInputs();
    renderExperience();
    updateAllPreviews();
    closeResetOverlay();

    playSound("xp");
    showToast("The garden is ready for a new beginning.", 0);
});

// =========================
// Sound controls
// =========================
function updateSoundToggle() {
    soundToggleButton.textContent = soundEnabled ? "🔊" : "🔇";
    soundToggleButton.classList.toggle("is-muted", !soundEnabled);
    soundToggleButton.setAttribute(
        "aria-label",
        soundEnabled ? "Mute sounds" : "Turn sounds on"
    );
    soundToggleButton.title =
        soundEnabled ? "Mute sounds" : "Turn sounds on";
}

soundToggleButton.addEventListener("click", function () {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_SETTING_KEY, String(soundEnabled));
    updateSoundToggle();

    if (soundEnabled) playSound("click");
});

// Generic button sounds. Special buttons use their own sounds.
const specialSoundButtonIds = new Set([
    "soundToggleButton",
    "reviewMLButton",
    "reviewResearchButton",
    "reviewEnglishButton",
    "reviewLifeButton",
    "reviewPurseButton",
    "confirmEntryButton",
    "exportSaveButton",
    "importSaveButton",
    "confirmImportButton",
    "resetSaveButton",
    "confirmResetButton"
]);

document.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.classList.contains("counter-button")) {
        playSound("counter");
        return;
    }

    if (specialSoundButtonIds.has(button.id)) return;
    playSound("click");
});

// Initial render
refreshAutomaticDate();
syncDateInputs();
renderExperience();
updateAllPreviews();
updateSoundToggle();


// =========================
// PWA service worker
// =========================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js", {
            scope: "./",
            updateViaCache: "none"
        }).catch(function (error) {
            console.error("Service worker registration failed:", error);
        });
    });
}
