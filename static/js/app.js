const STORAGE_KEY = "pythostube_channels_v1";
const SAVED_KEY = "pythostube_saved_v1";

let channels = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

let savedVideos = JSON.parse(
    localStorage.getItem(SAVED_KEY) || "[]"
);

let allVideos = [];

let activeFilter = "all";

let searchTerm = "";

let currentSort = "latest";


const $ = (selector) =>
    document.querySelector(selector);


const channelList = $("#channelList");
const videoGrid = $("#videoGrid");
const emptyState = $("#emptyState");
const videoCount = $("#videoCount");
const message = $("#message");

const modal = $("#modal");
const modalClose = $("#modalClose");
const channelForm = $("#channelForm");
const channelInput = $("#channelInput");
const modalError = $("#modalError");
const channelSubmit = $("#channelSubmit");

const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");

const toast = $("#toast");


function saveChannels() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(channels)
    );
}


function saveSavedVideos() {
    localStorage.setItem(
        SAVED_KEY,
        JSON.stringify(savedVideos)
    );
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(dateString) {

    const date = new Date(dateString);

    const now = new Date();

    const seconds =
        Math.floor(
            (now - date) / 1000
        );

    if (seconds < 60) {
        return "just now";
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    if (days < 30) {
        return `${Math.floor(days / 7)}w ago`;
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function durationToSeconds(duration) {

    const parts =
        duration
            .split(":")
            .map(Number);

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    if (parts.length === 3) {
        return (
            parts[0] * 3600 +
            parts[1] * 60 +
            parts[2]
        );
    }

    return 0;
}


function showToast(text) {

    toast.textContent = text;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


function showMessage(text) {

    message.textContent = text;

    message.classList.remove("hidden");
}


function hideMessage() {
    message.classList.add("hidden");
}


function openModal() {

    modal.classList.remove("hidden");

    channelInput.value = "";

    modalError.textContent = "";

    setTimeout(() => {
        channelInput.focus();
    }, 100);
}


function closeModal() {
    modal.classList.add("hidden");
}


function renderChannels() {

    if (!channels.length) {

        channelList.innerHTML = `
            <div style="
                padding:12px;
                color:#5f5f72;
                font-size:10px;
            ">
                No channels added yet.
            </div>
        `;

        return;
    }


    channelList.innerHTML =
        channels
            .map(channel => {

                return `
                    <div
                        class="channel-item"
                        data-channel-id="${escapeHtml(channel.id)}"
                    >

                        <img
                            class="channel-avatar"
                            src="${escapeHtml(channel.avatar)}"
                            alt=""
                        >

                        <span class="channel-name">
                            ${escapeHtml(channel.title)}
                        </span>

                        <button
                            class="channel-remove"
                            data-remove-channel="${escapeHtml(channel.id)}"
                            title="Remove channel"
                        >
                            ×
                        </button>

                    </div>
                `;
            })
            .join("");
}


function isSaved(videoId) {

    return savedVideos.includes(videoId);
}


function toggleSaved(videoId) {

    if (isSaved(videoId)) {

        savedVideos =
            savedVideos.filter(
                id => id !== videoId
            );

        showToast("Removed from saved videos.");

    } else {

        savedVideos.push(videoId);

        showToast("Saved video.");
    }

    saveSavedVideos();

    renderVideos();
}


async function copyText(text, successMessage) {

    try {

        await navigator.clipboard.writeText(text);

        showToast(successMessage);

    } catch (error) {

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        showToast(successMessage);
    }
}


function renderVideos() {

    let videos = [...allVideos];


    /* FILTER */

    if (activeFilter === "saved") {

        videos =
            videos.filter(
                video =>
                    isSaved(video.id)
            );

    }


    if (activeFilter === "today") {

        const now = new Date();

        videos =
            videos.filter(video => {

                const date =
                    new Date(video.publishedAt);

                return (
                    date.toDateString() ===
                    now.toDateString()
                );
            });
    }


    if (activeFilter === "week") {

        const weekAgo =
            Date.now() -
            7 * 24 * 60 * 60 * 1000;

        videos =
            videos.filter(video =>
                new Date(video.publishedAt)
                    .getTime() >= weekAgo
            );
    }


    /* SEARCH */

    if (searchTerm) {

        const term =
            searchTerm.toLowerCase();

        videos =
            videos.filter(video => {

                return (
                    video.title
                        .toLowerCase()
                        .includes(term)
                    ||
                    video.channelTitle
                        .toLowerCase()
                        .includes(term)
                );
            });
    }


    /* SORT */

    if (currentSort === "latest") {

        videos.sort(
            (a, b) =>
                new Date(b.publishedAt) -
                new Date(a.publishedAt)
        );

    } else if (currentSort === "oldest") {

        videos.sort(
            (a, b) =>
                new Date(a.publishedAt) -
                new Date(b.publishedAt)
        );

    } else if (currentSort === "longest") {

        videos.sort(
            (a, b) =>
                durationToSeconds(b.duration) -
                durationToSeconds(a.duration)
        );

    } else if (currentSort === "shortest") {

        videos.sort(
            (a, b) =>
                durationToSeconds(a.duration) -
                durationToSeconds(b.duration)
        );
    }


    videoCount.textContent =
        `${videos.length} ${
            videos.length === 1
                ? "video"
                : "videos"
        }`;


    if (!videos.length) {

        videoGrid.innerHTML = "";

        emptyState.classList.add("visible");

        return;
    }


    emptyState.classList.remove("visible");


    videoGrid.innerHTML =
        videos
            .map((video, index) => {

                const saved =
                    isSaved(video.id);

                return `
                    <article
                        class="video-card"
                        style="animation-delay:${Math.min(index * 0.035, 0.35)}s"
                    >

                        <button
                            class="save-button ${
                                saved ? "saved" : ""
                            }"
                            data-save="${escapeHtml(video.id)}"
                            title="${
                                saved
                                    ? "Remove saved"
                                    : "Save video"
                            }"
                        >
                            ${saved ? "★" : "☆"}
                        </button>


                        <div class="thumbnail-container">

                            <img
                                class="thumbnail"
                                src="${escapeHtml(video.thumbnail)}"
                                alt="${escapeHtml(video.title)}"
                                loading="lazy"
                            >

                            <span class="duration">
                                ${escapeHtml(video.duration)}
                            </span>


                            <a
                                class="play-overlay"
                                href="${escapeHtml(video.url)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Watch ${escapeHtml(video.title)}"
                            >

                                <span class="play-circle">
                                    ▶
                                </span>

                            </a>

                        </div>


                        <div class="video-info">

                            <h2 class="video-title">
                                ${escapeHtml(video.title)}
                            </h2>


                            <div class="video-meta">

                                <img
                                    class="video-avatar"
                                    src="${escapeHtml(
                                        video.channelAvatar || ""
                                    )}"
                                    alt=""
                                >

                                <div class="video-meta-text">

                                    <div class="video-channel">
                                        ${escapeHtml(
                                            video.channelTitle
                                        )}
                                    </div>

                                    <div class="video-date">
                                        ${formatDate(
                                            video.publishedAt
                                        )}
                                    </div>

                                </div>

                            </div>


                            <div class="video-actions">

                                <button
                                    class="video-action"
                                    data-copy-title="${escapeHtml(
                                        video.id
                                    )}"
                                >
                                    Copy Title
                                </button>

                                <button
                                    class="video-action"
                                    data-copy-link="${escapeHtml(
                                        video.id
                                    )}"
                                >
                                    Copy Link
                                </button>

                                <a
                                    class="video-action watch"
                                    href="${escapeHtml(video.url)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style="
                                        text-decoration:none;
                                        text-align:center;
                                    "
                                >
                                    Watch
                                </a>

                            </div>

                        </div>

                    </article>
                `;
            })
            .join("");
}


function attachVideoEvents() {

    videoGrid
        .querySelectorAll("[data-save]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleSaved(
                        button.dataset.save
                    );
                }
            );
        });


    videoGrid
        .querySelectorAll("[data-copy-title]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const video =
                        allVideos.find(
                            item =>
                                item.id ===
                                button.dataset.copyTitle
                        );

                    if (video) {

                        copyText(
                            video.title,
                            "Title copied."
                        );
                    }
                }
            );
        });


    videoGrid
        .querySelectorAll("[data-copy-link]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const video =
                        allVideos.find(
                            item =>
                                item.id ===
                                button.dataset.copyLink
                        );

                    if (video) {

                        copyText(
                            video.url,
                            "YouTube link copied."
                        );
                    }
                }
            );
        });
}


function attachChannelEvents() {

    channelList
        .querySelectorAll("[data-remove-channel]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    const id =
                        button.dataset.removeChannel;

                    channels =
                        channels.filter(
                            channel =>
                                channel.id !== id
                        );

                    saveChannels();

                    renderChannels();

                    allVideos =
                        allVideos.filter(
                            video =>
                                video.channelId !== id
                        );

                    renderVideos();

                    showToast(
                        "Channel removed."
                    );
                }
            );
        });
}


async function loadChannel(channelInput) {

    hideMessage();

    channelSubmit.disabled = true;

    channelSubmit.textContent =
        "Loading channel...";


    try {

        const response =
            await fetch(
                "/api/channel",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        channel:
                            channelInput
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load channel."
            );
        }


        const existing =
            channels.find(
                channel =>
                    channel.id ===
                    data.channel.id
            );


        if (existing) {

            throw new Error(
                "This channel is already added."
            );
        }


        channels.push(
            data.channel
        );

        saveChannels();

        renderChannels();

        attachChannelEvents();


        const channelAvatar =
            data.channel.avatar;


        const videos =
            data.videos.map(video => ({
                ...video,

                channelAvatar
            }));


        allVideos.push(...videos);

        renderVideos();

        attachVideoEvents();

        closeModal();

        showToast(
            `${data.channel.title} added.`
        );


    } catch (error) {

        modalError.textContent =
            error.message;

    } finally {

        channelSubmit.disabled = false;

        channelSubmit.textContent =
            "Add Channel";
    }
}


async function reloadAllChannels() {

    if (!channels.length) {

        allVideos = [];

        renderVideos();

        return;
    }


    showToast(
        "Refreshing subscriptions..."
    );


    const oldVideos = [];


    for (const channel of channels) {

        try {

            const response =
                await fetch(
                    "/api/channel",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            channel:
                                channel.id
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                continue;
            }


            const channelVideos =
                data.videos.map(video => ({
                    ...video,

                    channelAvatar:
                        data.channel.avatar
                }));


            oldVideos.push(
                ...channelVideos
            );

        } catch (error) {

            console.error(
                "Channel refresh failed:",
                error
            );
        }
    }


    allVideos = oldVideos;

    renderVideos();

    attachVideoEvents();

    showToast(
        "Feed refreshed."
    );
}


/* MODAL */

[
    "#addChannelButton",
    "#addChannelSmall",
    "#heroAddButton",
    "#emptyAddButton"
]
.forEach(selector => {

    const button = $(selector);

    if (button) {
        button.addEventListener(
            "click",
            openModal
        );
    }
});


modalClose.addEventListener(
    "click",
    closeModal
);


modal
    .querySelector(".modal-backdrop")
    .addEventListener(
        "click",
        closeModal
    );


channelForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const value =
            channelInput.value.trim();

        if (!value) {
            return;
        }

        loadChannel(value);
    }
);


/* SEARCH */

searchInput.addEventListener(
    "input",
    event => {

        searchTerm =
            event.target.value.trim();

        renderVideos();

        attachVideoEvents();
    }
);


/* SORT */

sortSelect.addEventListener(
    "change",
    event => {

        currentSort =
            event.target.value;

        renderVideos();

        attachVideoEvents();
    }
);


/* FILTERS */

document
    .querySelectorAll(".filter-tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter-tab"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                tab.classList.add("active");


                activeFilter =
                    tab.dataset.filter;


                renderVideos();

                attachVideoEvents();
            }
        );
    });


/* REFRESH */

$("#refreshButton")
    .addEventListener(
        "click",
        reloadAllChannels
    );


/* KEYBOARD SEARCH */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "/" &&
            document.activeElement.tagName !==
                "INPUT"
        ) {

            event.preventDefault();

            searchInput.focus();
        }


        if (
            event.key === "Escape" &&
            !modal.classList.contains(
                "hidden"
            )
        ) {

            closeModal();
        }
    }
);


/* CHANNEL SIDEBAR */

channelList.addEventListener(
    "click",
    event => {

        const item =
            event.target.closest(
                ".channel-item"
            );

        if (!item) {
            return;
        }

        if (
            event.target.closest(
                ".channel-remove"
            )
        ) {
            return;
        }


        const channelId =
            item.dataset.channelId;


        const channelVideos =
            allVideos.filter(
                video =>
                    video.channelId ===
                    channelId
            );


        if (channelVideos.length) {

            allVideos =
                channelVideos;

            renderVideos();

            attachVideoEvents();

            showToast(
                `Showing ${item.querySelector(".channel-name").textContent}`
            );
        }
    }
);


/* INITIALIZE */

renderChannels();

attachChannelEvents();

renderVideos();

attachVideoEvents();
