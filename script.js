
let currentSong = new Audio();
let songs = [];  // Initialize the songs array to avoid undefined errors
let currFolder;

// Get references to the previous and next buttons
let previous = document.getElementById("previous");
let next = document.getElementById("next");

let currentSongIndex = 0; // Track the current song index

// Play a song based on its index
function playMusicByIndex(index) {
  if (index >= 0 && index < songs.length) {
    playMusic(songs[index]);
    currentSongIndex = index;  // Update the current song index
  }
}

function secondsToMinutesSeconds(seconds) {
  if(isNaN(seconds) || seconds < 0){
    return "00:00";
  }
  // Calculate minutes
  const minutes = Math.floor(seconds / 60);
  // Calculate remaining seconds
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds as two digits
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Return in MM:SS format
  return `${formattedMinutes}:${formattedSeconds}`;
}



async function getsongs(folder) {
  currFolder = folder; // Store the current folder name
  let response = await fetch(`${folder}`); // Fetch the directory/page with the songs
  let text = await response.text(); // Get the text content of the page

  // Create a div and insert the fetched HTML into it to parse it
  let div = document.createElement("div");
  div.innerHTML = text;

  // Find all <a> elements (which should contain the song links)
  let as = div.getElementsByTagName("a");


  songs = []; // Ensure songs is reset before populating it
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    // Check if the link ends with '.mp3' and add it to the songs array
    if (element.href.endsWith(".mp3")) {
      let songFile = element.href.split(`/${folder}/`)[1]; // Extract the file name from the URL
      songFile = decodeURIComponent(songFile); // URL-decode the song name
      songs.push(songFile); // Add the song file to the array
    }
  }

  


// Show all the songs in the playlist
let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
// Reset the song list before displaying
songUL.innerHTML = "";

for (const song of songs) {
  songUL.innerHTML += `<li> 
    <img class="invert" src="img/music.svg" alt="">
    <div class="info">
      <div> ${song.replaceAll("%20", " ")} </div>
      <div> Sandeep </div>
    </div>
    <div class="playnow">
      <span>Play now</span>
      <img width="18px" class="invert" src="img/play.svg" alt="">
    </div> 
  </li>`;
}

// Add an event listener to each song item in the playlist
Array.from(songUL.getElementsByTagName("li")).forEach((li, index) => {
  li.addEventListener("click", () => {
    playMusic(songs[index]);  // Play the song when it's clicked
  });
});

// Attach an event Listener to each song
Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
  e.addEventListener("click", () => {
    let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
 
     // Call playMusic with the selected song
    playMusic(songName);
  });
});
  return songs; // Ensure that the function returns the updated songs array
}

const playMusic = (track, pause = false) => {
  // Construct the full audio path, logging it for debugging
  // currentSong.src = `/Spotify clone/${currFolder}/` + track;
  currentSong.src = `${currFolder}/${track}`;

  if (!pause) {
    currentSong.play();  // Play music and handle errors
    play.src = "img/pause.svg";
    
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  
}

async function displayAlbums() {
  let response = await fetch("songs");
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");


  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let metadataUrl = `songs/${folder}/info.json`;

      try {
        let metadataResponse = await fetch(metadataUrl);
        if (metadataResponse.ok) {
          let data = await metadataResponse.json();
          let albumCard = document.createElement("div");
          albumCard.classList.add("album-card");
          albumCard.innerHTML =  albumCard.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="green"/><polygon points="40,30 40,70 70,50" fill="black"/>
            </svg>
            </div>
            <img src="songs/${folder}/cover.jpeg">
            <h2>${data.title}</h2>
            <p>${data.description}</p>`;


          albumCard.addEventListener("click", async () => {
            let songs = await getsongs(`songs/${folder}`);
            playMusic(songs[0], true);
          });

          cardContainer.appendChild(albumCard);
        }
      } 
      catch (err) {
        console.error("Error fetching metadata:", err);
      }
    }
  });
}

async function main() {
   // Get the list of all the songs
  let songs = await getsongs("songs/cs");
  playMusic(songs[0], true);
  // Display all the albums on the page
  displayAlbums();









  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });





  // Listen for timeUpdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an eventlistener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  });

  // Add an eventlistener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  // Add an eventlistener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an eventListener to previous
  previous.addEventListener("click", () => {
    let previousIndex = currentSongIndex - 1;
    if (previousIndex >= 0) {
      playMusicByIndex(previousIndex);
    } else {
      console.log("No previous song.");
    }
  });

  // Add an eventListener to next
  next.addEventListener("click", () => {
    let nextIndex = currentSongIndex + 1;
    if (nextIndex < songs.length) {
      playMusicByIndex(nextIndex);
    } else {
      console.log("No next song.");
    }
  });

  // Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong > 0) {
      
      document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg", "volume.svg")
    }
  });

  // Load the playlist whenever a card is clicked
Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    // Fetch songs from the selected folder
    songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);  // Automatically play the first song in the playlist
    
  });
});


// Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", e=>{
  
  if (e.target.src.includes("volume.svg")) {
    e.target.src = e.target.src.replace("volume.svg", "mute.svg")
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0
  }
  else{
    e.target.src = e.target.src.replace("mute.svg", "volume.svg")
    currentSong.volume = .10;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10
  }

})
}


main();























