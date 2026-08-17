import os
import re
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")

YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3"


def youtube_request(endpoint, params):
    params["key"] = YOUTUBE_API_KEY

    response = requests.get(
        f"{YOUTUBE_BASE}/{endpoint}",
        params=params,
        timeout=15
    )

    if response.status_code != 200:
        try:
            error = response.json()
        except Exception:
            error = {"error": response.text}

        raise RuntimeError(
            error.get("error", {}).get("message", "YouTube API request failed")
        )

    return response.json()


def extract_channel_id(value):
    value = value.strip()

    # Direct channel ID
    if re.fullmatch(r"UC[a-zA-Z0-9_-]{22}", value):
        return value

    # /channel/UC...
    match = re.search(r"/channel/(UC[a-zA-Z0-9_-]{22})", value)
    if match:
        return match.group(1)

    return None


def find_channel(value):
    channel_id = extract_channel_id(value)

    # Direct channel ID
    if channel_id:
        data = youtube_request(
            "channels",
            {
                "part": "snippet,contentDetails",
                "id": channel_id
            }
        )

        if not data.get("items"):
            raise RuntimeError("Channel not found.")

        return data["items"][0]

    # Search by channel URL, @handle, or name
    value = value.strip()

    if value.startswith("@"):
        query = value
    elif "youtube.com/@" in value:
        query = value.split("youtube.com/@", 1)[1].split("/", 1)[0]
        query = "@" + query
    elif "youtube.com/c/" in value:
        query = value.split("youtube.com/c/", 1)[1].split("/", 1)[0]
    else:
        query = value

    search = youtube_request(
        "search",
        {
            "part": "snippet",
            "q": query,
            "type": "channel",
            "maxResults": 5
        }
    )

    if not search.get("items"):
        raise RuntimeError("No YouTube channel found.")

    channel_id = search["items"][0]["snippet"]["channelId"]

    data = youtube_request(
        "channels",
        {
            "part": "snippet,contentDetails",
            "id": channel_id
        }
    )

    if not data.get("items"):
        raise RuntimeError("Channel details could not be retrieved.")

    return data["items"][0]


def parse_duration(duration):
    """
    Converts ISO 8601 duration such as PT1H23M45S
    into 1:23:45.
    """

    match = re.match(
        r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?",
        duration
    )

    if not match:
        return "0:00"

    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)

    if hours:
        return f"{hours}:{minutes:02d}:{seconds:02d}"

    return f"{minutes}:{seconds:02d}"


def get_channel_videos(channel_id, max_results=15):
    channel_data = youtube_request(
        "channels",
        {
            "part": "snippet,contentDetails",
            "id": channel_id
        }
    )

    if not channel_data.get("items"):
        raise RuntimeError("Channel not found.")

    channel = channel_data["items"][0]

    uploads_playlist = (
        channel["contentDetails"]
        ["relatedPlaylists"]
        ["uploads"]
    )

    playlist_data = youtube_request(
        "playlistItems",
        {
            "part": "snippet,contentDetails",
            "playlistId": uploads_playlist,
            "maxResults": max_results
        }
    )

    video_ids = []

    for item in playlist_data.get("items", []):
        video_id = item.get("contentDetails", {}).get("videoId")

        if video_id:
            video_ids.append(video_id)

    if not video_ids:
        return {
            "channel": {
                "id": channel["id"],
                "title": channel["snippet"]["title"],
                "avatar": channel["snippet"]["thumbnails"]
                    .get("high", channel["snippet"]["thumbnails"]["default"])["url"]
            },
            "videos": []
        }

    videos_data = youtube_request(
        "videos",
        {
            "part": "snippet,contentDetails,status",
            "id": ",".join(video_ids)
        }
    )

    video_lookup = {
        item["id"]: item
        for item in videos_data.get("items", [])
    }

    videos = []

    for item in playlist_data.get("items", []):
        video_id = item.get("contentDetails", {}).get("videoId")

        if video_id not in video_lookup:
            continue

        video = video_lookup[video_id]

        snippet = video["snippet"]

        thumbnails = snippet.get("thumbnails", {})

        thumbnail = (
            thumbnails.get("maxres")
            or thumbnails.get("high")
            or thumbnails.get("medium")
            or thumbnails.get("default")
        )

        videos.append({
            "id": video_id,
            "title": snippet.get("title", "Untitled"),
            "description": snippet.get("description", ""),
            "thumbnail": thumbnail["url"],
            "publishedAt": snippet.get("publishedAt"),
            "channelId": snippet.get("channelId"),
            "channelTitle": snippet.get("channelTitle"),
            "duration": parse_duration(
                video.get("contentDetails", {}).get("duration", "PT0S")
            ),
            "url": f"https://www.youtube.com/watch?v={video_id}"
        })

    return {
        "channel": {
            "id": channel["id"],
            "title": channel["snippet"]["title"],
            "avatar": (
                channel["snippet"]
                ["thumbnails"]
                .get(
                    "high",
                    channel["snippet"]["thumbnails"]["default"]
                )["url"]
            )
        },
        "videos": videos
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/channel", methods=["POST"])
def channel():

    if not YOUTUBE_API_KEY:
        return jsonify({
            "error": "YouTube API key is not configured on the server."
        }), 500

    data = request.get_json(silent=True) or {}

    channel_input = data.get("channel", "").strip()

    if not channel_input:
        return jsonify({
            "error": "Enter a YouTube channel name, @handle, URL, or channel ID."
        }), 400

    try:
        channel = find_channel(channel_input)

        result = get_channel_videos(
            channel["id"],
            max_results=20
        )

        return jsonify(result)

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "youtube_api": bool(YOUTUBE_API_KEY)
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
