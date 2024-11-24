console.log("lets write javascript");

let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="music-logo">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").replaceAll("%2C", " ")}</div>
                    <div>song artist</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="img/play.svg" alt="play-logo">
                </div>
            </li>`;
    }

    // Attach an event listener to each song
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30">
                            <circle cx="15" cy="15" r="15" fill="#5be25b" />
                            <path d="M12 10.5L12 19.5L20 15L12 10.5Z" fill="black"/>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="cover-img">
                    <h3>${response.title}</h3>
                </div>`;
        }
    }

    // Load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // Get the list of the first song
    await getSongs("songs/DilToPagalHai");
    playMusic(songs[0], true);

    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to previous, play, and next song buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Listen for the time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener for the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add event listeners for hamburger and cross buttons
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add an event listener for the previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Add an event listener for the next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });
}

// Call the main function
main();
