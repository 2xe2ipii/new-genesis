# 🧬 NEW GENESIS

> **Trust No One. Question Everything.**
> A real-time, cyberpunk-themed social deduction game where information is your weapon and deception is your shield.

![Project Status](https://img.shields.io/badge/Status-Active_Development-violet?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/React-TypeScript-blue?style=for-the-badge&logo=react)
![Backend](https://img.shields.io/badge/Firebase-Realtime_DB-orange?style=for-the-badge&logo=firebase)
![Styling](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss)

---

## 🎮 Overview

**New Genesis** is a web-based multiplayer party game designed for 4-10 players. Set in a futuristic interface, players are assigned hidden roles and secret passphrases. The Locals must identify the threats hiding among them, while the Spies, Jokers, and Tourists work to deceive the majority or achieve their own chaotic agendas.

Unlike traditional social deduction games, **New Genesis** introduces **Ability Cards** (Radar, Silencer, Spoof) that add a layer of tactical depth and paranoia to the discussion phase.

---

## 🕹️ How to Play

### 1. The Roles
Every player receives a secret role and a passphrase.

* 🛡️ **LOCAL (Safe):** You are the majority. You share a common secret word. Your goal is to identify and vote out the Spy.
* 🕵️ **SPY (Threat):** You are the impostor. You have a slightly different word (or a related one). Your goal is to blend in and survive the vote.
* 🤡 **JOKER (Threat):** You want chaos. You know the Local's word, but you win only if you get **voted out**.
* 📸 **TOURIST (Threat):** You know nothing. Your word is blank. You must bluff your way through the conversation.

### 2. The Ability Cards
Randomly distributed at the start of the game to shake up the playing field.

* 📡 **RADAR (Scan Target):**
    * Use this to scan another player.
    * **Effect:** Reveals to the entire lobby whether the target is **SAFE** or a **THREAT**.
* 🔇 **SILENCER (Silence Vote):**
    * Use this on a suspicious (or innocent) player.
    * **Effect:** The target can still speak, but their vote counts for **0** during the elimination phase.
* 👾 **SPOOF (Fake Signal):**
    * *Exclusive to Threats.*
    * Use this on yourself or others to plant a digital trap.
    * **Effect:** Reverses the result of a RADAR scan (e.g., A Spy appears "SAFE", a Local appears "THREAT").

### 3. The Game Loop
1.  **Lobby:** Host creates a room; friends join via a 4-letter code.
2.  **Reveal:** Players scratch a digital card to see their Role and Secret Word.
3.  **Discussion:** A 10-minute timer starts. Players discuss, bluff, and use **Ability Cards**.
4.  **Voting:** Players vote to eliminate someone.
5.  **Results:** The winner is declared based on who was ejected.

---

## 🛠️ Tech Stack

Built with modern web technologies for a seamless, real-time experience.

* **Frontend:** React (Vite)
* **Language:** TypeScript
* **State Management:** React Hooks
* **Backend:** Firebase Realtime Database
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion

---

## 🚀 Installation & Setup

Follow these steps to run the game locally on your machine.

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn
* A Firebase project (for the Realtime Database)

### Steps

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/new-genesis.git](https://github.com/your-username/new-genesis.git)
    cd new-genesis
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Firebase**
    * Create a file named `.env` in the root directory.
    * Add your Firebase configuration keys:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Play!**
    Open your browser to `http://localhost:5173`. Open multiple tabs or use your phone on the same network to simulate multiple players.

---

## 🔮 Future Roadmap

* [ ] **Custom Avatar Selection:** Choose your agent persona.
* [ ] **More Roles:** Introducing the "Hacker" and "Bodyguard".
* [ ] **Private Lobbies:** Password-protected rooms.
* [ ] **Spectator Mode:** Watch the chaos unfold without participating.

---

## 🤝 Contributing

Contributions are welcome! If you have an idea for a new role or card, feel free to fork the repo and submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <small>Built with 💜 by [Your Name]</small>
</div>