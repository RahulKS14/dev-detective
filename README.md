# Dev Detective | GitHub Explorer

🔗 **Live Demo:** [https://dev-detective-psi.vercel.app/](https://dev-detective-psi.vercel.app/)

Dev Detective is a responsive, client-side web app built with plain HTML, CSS and JavaScript. It talks to the official [GitHub REST API](https://docs.github.com/en/rest) to search developers, list their latest repositories, and compare two developers in a star-count "battle".

No frameworks, no build step, no API key. Just open `index.html`.

## Features

### Phase 1: Base MVP
- Search any GitHub username (for example `octocat`)
- Profile card showing avatar, name, bio, join date and portfolio link
- Loading spinner while the request is in progress
- Clean "User Not Found" card on a `404` response, with no crashes

### Phase 2: Data Expansion
- Endpoint chaining: uses `repos_url` from the profile response to fetch repositories
- Top 5 latest repositories shown as cards
- Repository names are clickable links that open in a new tab
- ISO timestamps formatted into readable dates (for example `25 Jan 2023`)

### Phase 3: Battle Mode
- Toggle to reveal a two-username battle form
- Both users fetched simultaneously with `Promise.all()`
- Total stars calculated with `reduce()` over all public repositories
- Winner card highlighted in green, loser in red, and a draw state when totals match

### Extras
- Mobile-first responsive layout (works from 320px phones to desktop)
- Dark and light theme toggle, saved in `localStorage`
- Friendly error messages for network failure and API rate limits
- Accessible markup: ARIA live regions, focus styles, 44px touch targets
- Safe DOM rendering (`textContent`, validated links, `rel="noopener noreferrer"`)

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox, `clamp()`) |
| Logic | Vanilla JavaScript (ES6+, `fetch`, `async/await`, Promises) |
| Data | GitHub REST API v3 |
| Fonts | DM Sans, Space Grotesk (Google Fonts) |

## Project Structure

```
dev-detective/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Getting Started

1. Download or clone the project.
2. Keep `index.html`, `style.css` and `script.js` in the same folder.
3. Open `index.html` in any modern browser.

Optional: run a local server (for example the VS Code **Live Server** extension, or `python -m http.server`) and open `http://localhost:8000`.

## How to Use

**Search a developer**
1. Type a GitHub username, or click the `octocat` example.
2. Press **Search Profile**.
3. View the profile card and the 5 most recently updated repositories.

**Battle Mode**
1. Click **Enable Battle**.
2. Enter two different usernames (for example `octocat` and `torvalds`).
3. Press **Start Battle** to compare total stars. The winner is shown in green and the runner-up in red.

## API Endpoints Used

| Purpose | Endpoint |
|---|---|
| User profile | `GET https://api.github.com/users/{username}` |
| Latest repositories | `GET {repos_url}?sort=updated&direction=desc&per_page=5` |
| All repositories (Battle Mode) | `GET {repos_url}?per_page=100&page={n}` |

## Key Concepts Practiced

- Promises, `async/await` and `try/catch/finally`
- Parsing JSON and traversing nested API data
- Chaining dependent requests
- Parallel requests with `Promise.all()`
- Array methods: `filter`, `map`, `reduce`, `sort`
- Loading, success and error UI states
- Responsive design and theming with CSS variables

## Error Handling

| Situation | Behaviour |
|---|---|
| Username does not exist (`404`) | "User Not Found" card |
| Rate limit reached (`403` / `429`) | Message asking the user to wait and retry |
| No internet | Network error message |
| Empty input | Validation message |
| Same username in both battle inputs | Validation message |

## Known Limitations

- Unauthenticated GitHub API requests are limited to **60 per hour per IP**. Battle Mode fetches every public repository (100 per page), so repeated testing can trigger the rate limit. Wait a few minutes and try again.
- "Latest repositories" are sorted by last updated date, not creation date. To sort by creation date, change `sort=updated` to `sort=created` in `script.js`.
- The portfolio link appears only when the user has added a website to their GitHub profile.

## Future Improvements

- Optional GitHub token support for higher rate limits
- Pagination or "load more" for repositories
- Language breakdown chart per developer
- Caching of previous searches

## Acknowledgements

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [MDN Web Docs: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## Author

**Rahul Kumar Saini**
Department of Computer Engineering & IT, Suresh Gyan Vihar University
