# ▶️ PythosTube — Personal YouTube Subscription Dashboard

# https://pythostube-v2.onrender.com/

> **A dark, futuristic dashboard for bringing your favorite YouTube channels into one personalized feed.**

PythosTube is a web-based YouTube subscription feed dashboard built to provide a cleaner and more focused way to organize subscribed channels and discover their latest videos.

Instead of switching between multiple channels, PythosTube is designed around one simple idea:

**Add your favorite channels → build your personal feed → keep track of new videos.**

## ✨ Features

- 🎬 Personalized YouTube subscription feed
- 🔎 Search your subscriptions
- ➕ Add YouTube channels
- 📺 Browse the latest videos from subscribed channels
- 🔖 Save videos for later
- 🗂️ Separate Saved Videos section
- 🕒 Feed filters such as **All**, **Today**, **This Week**, and **Saved**
- ↕️ Sort the feed by latest content
- 🌙 Dark futuristic UI
- 📱 Responsive web interface
- ⚡ Lightweight dashboard experience

## 🖥️ Dashboard

The current interface includes:

- **Home** — personalized video feed
- **Subscriptions** — manage followed channels
- **Saved Videos** — access saved content
- **Search** — quickly find subscriptions
- **My Channels** — manage added channels
- **Add Channel** — add a YouTube channel to the dashboard
- **Refresh** — update the feed

## 🔄 How It Works

```text
        Add YouTube Channel
                │
                ▼
       ┌──────────────────┐
       │  Channel Data    │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │ Personal Feed    │
       └────────┬─────────┘
                │
          ┌─────┴─────┐
          ▼           ▼
       Browse       Save
       Videos       Videos
          │           │
          └─────┬─────┘
                ▼
          Personal Library
```

## 🎯 Project Goal

PythosTube was created as a frontend-focused exploration of how a personal video dashboard can make subscription management simpler and more visually engaging.

The project focuses on:

- Clean information architecture
- Modern dashboard UX
- Personalization
- Subscription management
- Video discovery
- Responsive design

## 🛠️ Tech Stack

Based on the current repository structure, the application uses:

- **Python**
- **Flask**
- **HTML**
- **CSS**
- **JavaScript**
- **Jinja Templates**
- **Render** for deployment

Repository structure:

```text
PythosTube/
├── static/
├── templates/
├── app.py
├── render.yaml
├── requirements.txt
└── .gitignore
```

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/PythosX/PythosTube.git
cd PythosTube
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the application

```bash
python app.py
```

Then open the local address shown by Flask in your browser.

## 🌐 Live Demo

**PythosTube V2:**  
https://pythostube-v2.onrender.com

## 📸 Interface

The dashboard uses a dark visual theme with purple/pink accents, a sidebar navigation system, a central personalized feed, and quick actions for adding channels and managing videos.

## 🗺️ Roadmap

### ✅ Current

- [x] Dashboard UI
- [x] Subscription navigation
- [x] Add Channel interface
- [x] Search interface
- [x] Saved Videos section
- [x] Feed filtering UI
- [x] Dark responsive design
- [x] Render deployment

### 🔄 Planned

- [ ] Persistent user accounts
- [ ] Persistent subscriptions
- [ ] YouTube API integration improvements
- [ ] Real-time feed updates
- [ ] Video previews
- [ ] Advanced search
- [ ] Better saved-video management
- [ ] Personalized recommendations
- [ ] Channel thumbnails and metadata
- [ ] Improved mobile experience

## 💡 Vision

PythosTube aims to turn a collection of YouTube subscriptions into a **personalized video workspace** where users can discover, organize, and save content without unnecessary distractions.

```text
Discover → Organize → Watch → Save
```

## 👨‍💻 Developer

**PythosX**

GitHub: https://github.com/PythosX

## 📌 Project Status

PythosTube is an active personal development project. The current version focuses on the dashboard experience and core subscription-feed workflow, with additional YouTube functionality planned for future versions.

## 📄 License

This project is currently a personal development project. Add an open-source license if you decide to make the code available for reuse.
