const API = "https://api.github.com";
const API_HEADERS = {
    Accept: "application/vnd.github+json"
};

const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("search-button");
const searchStatus = document.getElementById("search-status");
const profileResult = document.getElementById("profile-result");
const reposSection = document.getElementById("repos-section");
const reposList = document.getElementById("repos-list");
const repoCount = document.getElementById("repo-count");

const battleToggle = document.getElementById("battle-toggle");
const battleContent = document.getElementById("battle-content");
const battleForm = document.getElementById("battle-form");
const battleButton = document.getElementById("battle-button");
const playerOneInput = document.getElementById("player-one");
const playerTwoInput = document.getElementById("player-two");
const battleStatus = document.getElementById("battle-status");
const battleResult = document.getElementById("battle-result");

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;
}

function showMessage(element, message, type = "") {
    element.replaceChildren();
    element.className = `message ${type}`.trim();
    element.textContent = message;
    element.hidden = false;
}

function clearMessage(element) {
    element.replaceChildren();
    element.className = "message";
    element.hidden = true;
}

function showLoading(element, message) {
    element.replaceChildren();
    element.className = "message";
    element.hidden = false;

    const loading = createElement("div", "loading-indicator");
    const spinner = createElement("span", "spinner");
    const text = createElement("span", "", message);

    loading.append(spinner, text);
    element.append(loading);
}

async function fetchJSON(url) {
    let response;

    try {
        response = await fetch(url, { headers: API_HEADERS });
    } catch {
        throw new Error("Network error. Check your internet connection and try again.");
    }

    if (response.status === 404) {
        const notFound = new Error("User not found.");
        notFound.status = 404;
        throw notFound;
    }

    if (response.status === 403 || response.status === 429) {
        throw new Error("GitHub API rate limit reached. Please wait a minute and try again.");
    }

    if (!response.ok) {
        throw new Error(`GitHub API request failed (${response.status}). Please try again.`);
    }

    return response.json();
}

async function fetchUser(username) {
    const user = await fetchJSON(`${API}/users/${encodeURIComponent(username)}`);

    if (!user || !user.login) {
        throw new Error("GitHub returned invalid user data.");
    }

    return user;
}

async function fetchLatestRepositories(reposUrl) {
    const repositories = await fetchJSON(`${reposUrl}?sort=updated&direction=desc&per_page=5`);

    if (!Array.isArray(repositories)) {
        throw new Error("GitHub returned invalid repository data.");
    }

    return repositories.slice(0, 5);
}

async function fetchAllRepositories(reposUrl) {
    const repositories = [];
    let page = 1;

    while (true) {
        const batch = await fetchJSON(`${reposUrl}?per_page=100&page=${page}`);

        if (!Array.isArray(batch)) {
            throw new Error("GitHub returned invalid repository data.");
        }

        repositories.push(...batch);

        if (batch.length < 100) {
            break;
        }

        page++;
    }

    return repositories;
}

function formatDate(dateString) {
    if (!dateString) {
        return "Date unavailable";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function createSafeLink(text, url, className = "") {
    let parsedURL;

    try {
        parsedURL = new URL(url);
    } catch {
        return null;
    }

    if (parsedURL.protocol !== "https:" && parsedURL.protocol !== "http:") {
        return null;
    }

    const link = createElement("a", className, text);
    link.href = parsedURL.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    return link;
}

function createProfileCard(user) {
    const card = createElement("article", "profile-card");

    const avatar = createElement("img", "avatar");
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s GitHub avatar`;
    avatar.referrerPolicy = "no-referrer";

    const details = createElement("div", "profile-details");

    details.append(
        createElement("h2", "profile-name", user.name || user.login),
        createElement("p", "profile-login", `@${user.login}`),
        createElement("p", "profile-bio", user.bio || "This developer has not added a bio yet.")
    );

    const meta = createElement("div", "profile-meta");

    meta.append(
        createElement("span", "", `📦 ${user.public_repos} public repositories`),
        createElement("span", "", `👥 ${user.followers} followers`),
        createElement("span", "", `📅 Joined ${formatDate(user.created_at)}`)
    );

    details.append(meta);

    const profileLink = createSafeLink("View GitHub Profile ↗", user.html_url, "profile-link");

    if (profileLink) {
        details.append(profileLink);
    }

    if (user.blog) {
        const blogURL = /^https?:\/\//i.test(user.blog) ? user.blog : `https://${user.blog}`;
        const portfolioLink = createSafeLink("Visit Portfolio ↗", blogURL, "profile-link");

        if (portfolioLink) {
            details.append(portfolioLink);
        }
    }

    card.append(avatar, details);

    return card;
}

function createNotFoundCard(username) {
    const card = createElement("article", "not-found-card");

    card.append(
        createElement("span", "not-found-icon", "🕵️"),
        createElement("h3", "", "User Not Found"),
        createElement("p", "", `No GitHub developer exists with the username "${username}". Check the spelling and try again.`)
    );

    return card;
}

function createRepositoryCard(repo) {
    const card = createElement("article", "repo-card");

    const title = createSafeLink(repo.name, repo.html_url, "repo-name");

    if (title) {
        card.append(title);
    } else {
        card.append(createElement("h3", "repo-name", repo.name));
    }

    card.append(
        createElement(
            "p",
            "repo-description",
            repo.description || "No description provided for this repository."
        )
    );

    const meta = createElement("div", "repo-meta");

    meta.append(
        createElement("span", "", `★ ${repo.stargazers_count}`),
        createElement("span", "", `⑂ ${repo.forks_count}`)
    );

    if (repo.language) {
        meta.append(createElement("span", "", repo.language));
    }

    meta.append(createElement("span", "", `Updated ${formatDate(repo.updated_at)}`));

    card.append(meta);

    return card;
}

async function searchDeveloper(username) {
    clearMessage(searchStatus);
    profileResult.replaceChildren();
    reposList.replaceChildren();
    reposSection.hidden = true;

    showLoading(searchStatus, "Searching GitHub profile and repositories...");

    try {
        const user = await fetchUser(username);
        const repositories = await fetchLatestRepositories(user.repos_url);

        profileResult.append(createProfileCard(user));

        if (repositories.length > 0) {
            repositories.forEach(repo => reposList.append(createRepositoryCard(repo)));
        } else {
            reposList.append(createElement("p", "message", "No public repositories were found."));
        }

        repoCount.textContent = `${repositories.length} PROJECT${repositories.length === 1 ? "" : "S"}`;
        reposSection.hidden = false;

        showMessage(searchStatus, `Profile loaded successfully for @${user.login}.`, "success");
    } catch (error) {
        if (error.status === 404) {
            clearMessage(searchStatus);
            profileResult.append(createNotFoundCard(username));
            return;
        }

        showMessage(searchStatus, error.message || "Something went wrong. Please try again.", "error");
    }
}

searchForm.addEventListener("submit", async event => {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showMessage(searchStatus, "Please enter a GitHub username.", "error");
        usernameInput.focus();
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {
        await searchDeveloper(username);
    } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = 'Search Profile <span>↗</span>';
    }
});

document.querySelectorAll("[data-username]").forEach(button => {
    button.addEventListener("click", () => {
        usernameInput.value = button.dataset.username;
        searchForm.requestSubmit();
    });
});

function createBattleCard(user, totalStars) {
    const card = createElement("article", "battle-card");

    const avatar = createElement("img", "battle-avatar");
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s avatar`;
    avatar.referrerPolicy = "no-referrer";

    const name = createElement("h3", "", user.name || user.login);
    const login = createElement("p", "profile-login", `@${user.login}`);
    const score = createElement("p", "battle-score", `★ ${totalStars.toLocaleString()}`);
    const label = createElement("p", "battle-score-label", "Total stars across public repositories");
    const verdict = createElement("p", "battle-verdict", "Calculating...");

    card.append(avatar, name, login, score, label, verdict);

    return { card, verdict };
}

async function getBattleData(username) {
    const user = await fetchUser(username);
    const repositories = await fetchAllRepositories(user.repos_url);

    const totalStars = repositories.reduce(
        (total, repo) => total + Number(repo.stargazers_count || 0),
        0
    );

    return { user, totalStars };
}

battleForm.addEventListener("submit", async event => {
    event.preventDefault();

    const usernameOne = playerOneInput.value.trim();
    const usernameTwo = playerTwoInput.value.trim();

    clearMessage(battleStatus);
    battleResult.replaceChildren();

    if (!usernameOne || !usernameTwo) {
        showMessage(battleStatus, "Enter both GitHub usernames to start the battle.", "error");
        return;
    }

    if (usernameOne.toLowerCase() === usernameTwo.toLowerCase()) {
        showMessage(battleStatus, "Choose two different GitHub usernames.", "error");
        return;
    }

    battleButton.disabled = true;
    battleButton.textContent = "Battle in progress...";

    showLoading(battleStatus, "Fetching both developers and calculating repository stars...");

    try {
        const [dataOne, dataTwo] = await Promise.all([
            getBattleData(usernameOne),
            getBattleData(usernameTwo)
        ]);

        const playerOne = createBattleCard(dataOne.user, dataOne.totalStars);
        const playerTwo = createBattleCard(dataTwo.user, dataTwo.totalStars);

        if (dataOne.totalStars > dataTwo.totalStars) {
            playerOne.card.classList.add("winner");
            playerTwo.card.classList.add("loser");
            playerOne.verdict.textContent = "🏆 WINNER";
            playerTwo.verdict.textContent = "RUNNER-UP";
        } else if (dataTwo.totalStars > dataOne.totalStars) {
            playerTwo.card.classList.add("winner");
            playerOne.card.classList.add("loser");
            playerTwo.verdict.textContent = "🏆 WINNER";
            playerOne.verdict.textContent = "RUNNER-UP";
        } else {
            playerOne.verdict.textContent = "🤝 DRAW";
            playerTwo.verdict.textContent = "🤝 DRAW";
        }

        battleResult.append(playerOne.card, playerTwo.card);

        showMessage(
            battleStatus,
            "Battle complete. All accessible public repositories were included in the star totals.",
            "success"
        );
    } catch (error) {
        const message = error.status === 404
            ? "One of the usernames was not found. Check both usernames and try again."
            : error.message || "Battle failed. Please try again.";

        showMessage(battleStatus, message, "error");
    } finally {
        battleButton.disabled = false;
        battleButton.innerHTML = 'Start Battle <span>⚡</span>';
    }
});

battleToggle.addEventListener("click", () => {
    const expanded = battleToggle.getAttribute("aria-expanded") === "true";

    battleToggle.setAttribute("aria-expanded", String(!expanded));
    battleContent.hidden = expanded;
    battleToggle.textContent = expanded ? "Enable Battle" : "Disable Battle";

    if (expanded) {
        battleResult.replaceChildren();
        clearMessage(battleStatus);
    }
});

function applyTheme(theme) {
    const selectedTheme = theme === "light" ? "light" : "dark";
    const isLight = selectedTheme === "light";

    document.body.dataset.theme = selectedTheme;
    themeIcon.textContent = isLight ? "☾" : "☀";
    themeLabel.textContent = isLight ? "Dark Mode" : "Light Mode";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");

    try {
        localStorage.setItem("dev-detective-theme", selectedTheme);
    } catch {
        return;
    }
}

let initialTheme = "dark";

try {
    initialTheme = localStorage.getItem("dev-detective-theme") || "dark";
} catch {
    initialTheme = "dark";
}

applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
    applyTheme(document.body.dataset.theme === "light" ? "dark" : "light");
});