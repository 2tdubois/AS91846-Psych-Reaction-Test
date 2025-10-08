function setDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sortAsc(a, b) {
  return a - b;
}

const TARGET_COUNT = 8; // 8 tests, 8 targets spawn
const SPAWN_BASELINE_MS = 5000; // min 5s
const SPAWN_ADDITIONAL_MS = 5000; // 5 extra seconds, so 10s maximum
const CIRCLE_SIZE = 300;
const PADDING = 50;

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

var round = 0; // 0 = round 1, 1 = round 2
var results = [[],[]];
var delays = [[],[]];

async function main() {
    if (round == 1) {   
        // play music
        document.getElementById("rockaudio").play();
    }
    for (let index = 0; index < TARGET_COUNT; index++) {

        // delay
        let delay = Math.random()*SPAWN_ADDITIONAL_MS+SPAWN_BASELINE_MS;
        delays[round].push(delay);
        await setDelay(delay);

        // spawn target
        // add padding from the edges (also prevent it from spawning off screen)
        let spawnX = PADDING+(viewportWidth-(CIRCLE_SIZE+PADDING))*Math.random();
        let spawnY = PADDING+(viewportHeight-(CIRCLE_SIZE+PADDING))*Math.random();
        let element = document.createElement("div");
        element.classList.add("target");
        element.style.width = CIRCLE_SIZE.toString() + "px";
        element.style.height = CIRCLE_SIZE.toString() + "px";
        element.style.left = spawnX.toString() + "px";
        element.style.top = spawnY.toString() + "px";
        document.getElementById("main").appendChild(element);

        // time reaction time
        let startTime = new Date();

        clicked = new Promise((resolve) => {
            element.addEventListener("click", () => {
                resolve();
            })
        })

        await clicked;
        element.remove();

        // log result
        let endTime = new Date();
        results[round].push(endTime-startTime);
    }
    if (round == 0) {
        round += 1
        document.getElementById("interludebutton").style.display = "block";
        document.getElementById("main").style.display = "none";
        document.getElementById("interludetext").innerHTML = "<h2>Round 2 instructions:</h2><p>Once again, click on the circles as they appear. Music will be playing this round.</p>"
        await setDelay(1500); // show button after 1.5 seconds
        document.getElementById("interlude").style.display = "block";
        document.getElementById("interludebutton").style.display = "block";
    } else {
        // stop music
        document.getElementById("rockaudio").pause();
        // show results
        document.getElementById("results").style.display = "block";
        document.getElementById("main").style.display = "none";
        console.log("Raw results (ms):");
        console.log(results);
        console.log("Raw delay between circles (ms):");
        console.log(delays);
        // get median
        let median = 0;
        let midpoint = Math.floor(TARGET_COUNT/2);
        if (TARGET_COUNT % 2 == 1) {
            median = results[0].sort(sortAsc)[midpoint-1];
        } else {
            median = (results[0].sort(sortAsc)[midpoint-1] + results[0].sort(sortAsc)[midpoint])/2;
        }
        document.getElementById("round1results").innerText = "Round 1: " + (median).toString() + "ms";

        median = 0;
        if (TARGET_COUNT % 2 == 1) {
            median = results[1].sort(sortAsc)[midpoint-1];
        } else {
            median = (results[1].sort(sortAsc)[midpoint-1] + results[1].sort(sortAsc)[midpoint])/2;
        }
        document.getElementById("round2results").innerText = "Round 2: " + (median).toString() + "ms";
    }
}

document.getElementById("startbutton").addEventListener("click", () => {
    document.getElementById("start").style.display = "none";
    document.getElementById("testaudio").pause();
    document.getElementById("interlude").style.display = "block";
    setTimeout(() => {
        document.getElementById("interludebutton").style.display = "block";
    }, 1500) // show button after 1.5 seconds
})

document.getElementById("interludebutton").addEventListener("click", () => {
    document.getElementById("interlude").style.display = "none";
    document.getElementById("main").style.display = "block";
    main()
})
