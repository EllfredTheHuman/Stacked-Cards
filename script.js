/* =========================================
STACKED CARDS
Main Game Script
========================================= */

/* =========================================
GLOBAL STATE
========================================= */

let lobbyType = "open";

let gameState = {
round: 1,
turnTime: 30,
timeLeft: 30,
timer: null,
currentPlayer: 1,

```
players: [
    {
        id: 1,
        name: "YOU",
        score: 5,
        lives: 3,
        coins: 5,
        itemsUsed: 0
    },
    {
        id: 2,
        name: "PLAYER 2",
        score: 5,
        lives: 3,
        coins: 5,
        itemsUsed: 0
    },
    {
        id: 3,
        name: "PLAYER 3",
        score: 5,
        lives: 3,
        coins: 5,
        itemsUsed: 0
    },
    {
        id: 4,
        name: "PLAYER 4",
        score: 5,
        lives: 3,
        coins: 5,
        itemsUsed: 0
    }
],

cards: [
    {
        id: "boost",
        name: "BOOST",
        description: "Gain 3 points.",
        icon: "➕"
    },
    {
        id: "tax",
        name: "TAX",
        description: "Take 2 points from a player ahead of you.",
        icon: "🪙"
    },
    {
        id: "risk",
        name: "RISK",
        description: "Gain 0–8 points.",
        icon: "🎲"
    },
    {
        id: "protect",
        name: "PROTECT",
        description: "Protect yourself from the next attack.",
        icon: "🛡️"
    }
],

items: [
    {
        id: "emergencyStop",
        name: "EMERGENCY STOP",
        icon: "🛑"
    },
    {
        id: "shield",
        name: "SHIELD",
        icon: "🛡️"
    }
]
```

};

/* =========================================
PAGE NAVIGATION
========================================= */

function goHome() {
window.location.href = "index.html";
}

function goBack() {
window.history.back();
}

function leaveLobby() {
if (confirm("Leave this lobby?")) {
window.location.href = "lobbies.html";
}
}

/* =========================================
MAIN MENU
========================================= */

function createLobby() {
window.location.href = "create.html";
}

function joinLobby() {
window.location.href = "lobbies.html";
}

/* =========================================
LOBBY BROWSER
========================================= */

function joinWithCode() {

```
const input = document.getElementById("lobbyCode");

if (!input) return;

const code = input.value.trim().toUpperCase();

if (code.length !== 6) {
    alert("Please enter a 6-character lobby code.");
    return;
}

window.location.href = "lobby.html";
```

}

function refreshLobbies() {
console.log("Refreshing lobbies...");
}

/* =========================================
CREATE LOBBY
========================================= */

function setLobbyType(type) {

```
lobbyType = type;

const openButton = document.getElementById("openLobby");
const privateButton = document.getElementById("privateLobby");

if (!openButton || !privateButton) return;

openButton.classList.remove("selected");
privateButton.classList.remove("selected");

if (type === "open") {
    openButton.classList.add("selected");
} else {
    privateButton.classList.add("selected");
}
```

}

function createGameLobby() {

```
const lobbyName =
    document.getElementById("lobbyName")?.value.trim()
    || "MY LOBBY";

const maxPlayers =
    Number(document.getElementById("maxPlayers")?.value || 4);

const turnTime =
    Number(document.getElementById("turnTime")?.value || 30);

const startingLives =
    Number(document.getElementById("startingLives")?.value || 3);

const startingCoins =
    Number(document.getElementById("startingCoins")?.value || 5);


const selectedItems = [];

document
    .querySelectorAll(".item-option input:checked")
    .forEach(input => {
        selectedItems.push(input.value);
    });


const lobbySettings = {
    name: lobbyName,
    type: lobbyType,
    maxPlayers,
    turnTime,
    startingLives,
    startingCoins,
    items: selectedItems
};


localStorage.setItem(
    "stackedCardsLobby",
    JSON.stringify(lobbySettings)
);


window.location.href = "lobby.html";
```

}

/* =========================================
WAITING LOBBY
========================================= */

function copyLobbyCode() {

```
const codeElement = document.getElementById("lobbyCode");

if (!codeElement) return;

const code = codeElement.textContent;

navigator.clipboard
    .writeText(code)
    .then(() => {
        alert("Lobby code copied!");
    })
    .catch(() => {
        alert("Lobby code: " + code);
    });
```

}

function editRules() {
window.location.href = "create.html";
}

function startGame() {
window.location.href = "game.html";
}

/* =========================================
GAME INITIALIZATION
========================================= */

function initializeGame() {

```
if (!document.querySelector(".game")) {
    return;
}

const savedLobby =
    JSON.parse(
        localStorage.getItem("stackedCardsLobby") || "null"
    );

if (savedLobby) {

    gameState.turnTime = savedLobby.turnTime;

    gameState.players.forEach(player => {
        player.lives = savedLobby.startingLives;
        player.coins = savedLobby.startingCoins;
    });
}

updateGameUI();

startTurn();
```

}

/* =========================================
TURN SYSTEM
========================================= */

function startTurn() {

```
clearInterval(gameState.timer);

gameState.timeLeft = gameState.turnTime;

updateTimer();

gameState.timer = setInterval(() => {

    gameState.timeLeft--;

    updateTimer();

    if (gameState.timeLeft <= 0) {
        endTurn();
    }

}, 1000);
```

}

function endTurn() {

```
clearInterval(gameState.timer);

const player =
    gameState.players[gameState.currentPlayer - 1];

if (player) {
    addLog(`${player.name}'s turn ended.`);
}

gameState.currentPlayer++;

if (
    gameState.currentPlayer >
    gameState.players.length
) {
    finishRound();
    return;
}

startTurn();

updateGameUI();
```

}

function updateTimer() {

```
const timer = document.getElementById("timer");

if (!timer) return;

timer.textContent = gameState.timeLeft;

if (gameState.timeLeft <= 5) {
    timer.style.color = "var(--danger)";
} else {
    timer.style.color = "";
}
```

}

/* =========================================
CARDS
========================================= */

function playCard(cardId) {

```
const player =
    gameState.players[gameState.currentPlayer - 1];

if (!player) return;


switch (cardId) {

    case "boost":

        player.score += 3;

        addLog(
            `${player.name} used BOOST and gained 3 points.`
        );

        break;


    case "tax":

        const target =
            findPlayerWithHighestScore(player.id);

        if (!target || target.score <= player.score) {

            addLog(
                `${player.name} couldn't use TAX.`
            );

            return;
        }

        target.score -= 2;
        player.score += 2;

        addLog(
            `${player.name} taxed ${target.name} for 2 points.`
        );

        break;


    case "risk":

        const amount =
            Math.floor(Math.random() * 9);

        player.score += amount;

        addLog(
            `${player.name} used RISK and gained ${amount} points.`
        );

        break;


    case "protect":

        addLog(
            `${player.name} prepared PROTECT.`
        );

        break;


    default:

        console.log("Unknown card:", cardId);

        return;
}


updateGameUI();
```

}

/* =========================================
ITEMS
========================================= */

function useItem(itemId) {

```
const player =
    gameState.players[gameState.currentPlayer - 1];

if (!player) return;


if (player.itemsUsed >= 2) {

    alert("You can only use 2 items per turn.");

    return;
}


switch (itemId) {

    case "emergencyStop":

        if (gameState.currentPlayer === 1) {

            alert(
                "Emergency Stop can be used on another player's turn."
            );

            return;
        }

        clearInterval(gameState.timer);

        addLog(
            `${player.name} used EMERGENCY STOP.`
        );

        gameState.currentPlayer++;

        if (
            gameState.currentPlayer >
            gameState.players.length
        ) {
            finishRound();
        } else {
            startTurn();
        }

        break;


    case "shield":

        addLog(
            `${player.name} used SHIELD.`
        );

        break;


    default:

        console.log("Unknown item:", itemId);

        return;
}


player.itemsUsed++;

updateGameUI();
```

}

/* =========================================
ROUND SYSTEM
========================================= */

function finishRound() {

```
clearInterval(gameState.timer);

const lowestScore =
    Math.min(
        ...gameState.players.map(player => player.score)
    );


const losers =
    gameState.players.filter(
        player => player.score === lowestScore
    );


losers.forEach(player => {

    player.lives--;

    addLog(
        `${player.name} had the lowest score and lost a life.`
    );

});


gameState.players.forEach(player => {

    player.score = 5;
    player.itemsUsed = 0;
    player.coins += 2;

});


const eliminated =
    gameState.players.filter(
        player => player.lives <= 0
    );


if (eliminated.length > 0) {

    addLog(
        `${eliminated[0].name} has been eliminated!`
    );

    alert(
        `${eliminated[0].name} has been eliminated!`
    );
}


gameState.round++;

gameState.currentPlayer = 1;

updateGameUI();

setTimeout(startTurn, 1000);
```

}

/* =========================================
SHOP
========================================= */

function openShop() {

```
const modal =
    document.getElementById("shopModal");

if (!modal) return;

modal.classList.remove("hidden");
```

}

function closeShop() {

```
const modal =
    document.getElementById("shopModal");

if (!modal) return;

modal.classList.add("hidden");
```

}

function buyItem(itemId, price) {

```
const player = gameState.players[0];

if (player.coins < price) {

    alert("You don't have enough coins.");

    return;
}


player.coins -= price;

gameState.items.push({
    id: itemId,
    name: itemId.toUpperCase(),
    icon: "🔧"
});


addLog(
    `${player.name} bought ${itemId}.`
);


updateGameUI();

closeShop();
```

}

/* =========================================
RULES
========================================= */

function openRules() {

```
const modal =
    document.getElementById("rulesModal");

if (!modal) return;

modal.classList.remove("hidden");
```

}

function closeRules() {

```
const modal =
    document.getElementById("rulesModal");

if (!modal) return;

modal.classList.add("hidden");
```

}

function openSettings() {
alert("Settings coming soon.");
}

/* =========================================
GAME UI
========================================= */

function updateGameUI() {

```
const player =
    gameState.players[gameState.currentPlayer - 1];

if (!player) return;


const score =
    document.getElementById("playerScore");

if (score) {
    score.textContent = player.score;
}


const round =
    document.getElementById("roundNumber");

if (round) {
    round.textContent = gameState.round;
}


const lives =
    document.getElementById("playerLives");

if (lives) {
    lives.textContent =
        "❤️ ".repeat(Math.max(player.lives, 0)).trim();
}


const coins =
    document.getElementById("playerCoins");

if (coins) {
    coins.textContent = `🪙 ${player.coins}`;
}


const message =
    document.getElementById("turnMessage");

if (message) {

    if (gameState.currentPlayer === 1) {
        message.textContent = "YOUR TURN";
    } else {
        message.textContent =
            `${player.name}'S TURN`;
    }
}


updateOpponentScores();
```

}

function updateOpponentScores() {

```
for (let i = 2; i <= 4; i++) {

    const player = gameState.players[i - 1];

    const score =
        document.getElementById(
            `player${i}Score`
        );

    if (score && player) {
        score.textContent = player.score;
    }
}
```

}

/* =========================================
ACTIVITY LOG
========================================= */

function addLog(message) {

```
const log =
    document.getElementById("activityLog");

if (!log) return;


const entry =
    document.createElement("p");

entry.textContent = message;

log.appendChild(entry);

log.scrollTop = log.scrollHeight;
```

}

/* =========================================
HELPERS
========================================= */

function findPlayerWithHighestScore(excludeId) {

```
const availablePlayers =
    gameState.players.filter(
        player => player.id !== excludeId
    );


return availablePlayers.reduce(
    (highest, player) =>
        player.score > highest.score
            ? player
            : highest,
    availablePlayers[0]
);
```

}

/* =========================================
PAGE STARTUP
========================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

```
    initializeGame();


    const codeElement =
        document.getElementById("lobbyCode");

    if (codeElement) {

        const existingCode =
            localStorage.getItem("stackedCardsLobbyCode");

        if (existingCode) {

            codeElement.textContent =
                existingCode;

        } else {

            const code =
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();

            localStorage.setItem(
                "stackedCardsLobbyCode",
                code
            );

            codeElement.textContent = code;
        }
    }


    const savedLobby =
        JSON.parse(
            localStorage.getItem("stackedCardsLobby")
            || "null"
        );


    if (savedLobby) {

        const lobbyName =
            document.getElementById("lobbyName");

        if (lobbyName && lobbyName.tagName === "H1") {
            lobbyName.textContent =
                savedLobby.name;
        }


        const turnTime =
            document.getElementById("turnTime");

        if (
            turnTime &&
            turnTime.tagName === "P"
        ) {
            turnTime.textContent =
                `${savedLobby.turnTime} SECONDS`;
        }


        const lives =
            document.getElementById("startingLives");

        if (
            lives &&
            lives.tagName === "P"
        ) {
            lives.textContent =
                savedLobby.startingLives;
        }


        const coins =
            document.getElementById("startingCoins");

        if (
            coins &&
            coins.tagName === "P"
        ) {
            coins.textContent =
                savedLobby.startingCoins;
        }


        const maxPlayers =
            document.getElementById("maxPlayers");

        if (
            maxPlayers &&
            maxPlayers.tagName === "P"
        ) {
            maxPlayers.textContent =
                savedLobby.maxPlayers;
        }
    }
}
```

);

```

Now **Stacked Cards** is the name throughout the project, and we're no longer carrying around the old `Dead Last` naming. :3
```
