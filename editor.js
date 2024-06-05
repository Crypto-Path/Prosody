// * STATIC VARS
const contextMargin = 20;
const contextMenuMarginTop = 25;
const titleFontSize = 30;

let adFile;
let audio = new Audio();
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let source = audioContext.createMediaElementSource(audio);
let analyser = audioContext.createAnalyser();
let volume = 0.10;

let bgFile;
let background = new Image();
background.src = "images/background_default.png";

let receptor_1 = new Image();
receptor_1.src = "images/receptor_1.png";

const menubar = {
    "file" : [
        {
            "name": "new chart",
            "action": () => {
                metadata = {
                    "name": "Untitled",
                    "difficulty": "Unset",
                    "author": "Unknown",
                    "charter": "Unknown",
                    "bpm": "100",
                    "offset": "0",
                    "description": "No description",
                    "genre": "Unknown",
                    "source": "Unknown",
                    "date": new Date().toLocaleString(),
                    "tags": []
                }
    
                audio.pause();
                audio.src = "";
                background.src = "images/background_default.png";
    
                chart = {
                    "difficulty_list": [
                        "Unset",
                    ],
                    "Unset" : [
                        [],
                        [],
                        [],
                        []
                    ]
                };
            }
        },
        {
            "name": "new difficulty",
            "action": () => {
                metadata.difficulty = "Unset";
                while (Object.keys(chart).includes(metadata.difficulty)) {
                    metadata.difficulty++;
                    metadata.difficulty = metadata.difficulty.toString();
                }

                chart.difficulty_list.push(metadata.difficulty);
                if (!Object.keys(chart).includes(metadata.difficulty)) {
                    chart[metadata.difficulty] = [[], [], [], []];
                }
                //console.log("Created New Difficulty")
            }
        },
        {
            "name": "load chart",
            "action": () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.psc';
                input.addEventListener('change', function(event) {
                    const file = event.target.files[0];
                    if (file) {
                        loadChart(file);
                    }
                });
                input.click();
            }
        },
        {
            "name": "! upload chart"
        },
        {
            "name": "! submit chart"
        },
        {
            "name": "export chart",
            "action": () => {
                exportMapData();
            }
        }
    ],
    "view" : [
        {
            "name": "appearance",
            "action": () => {
                currentMenu = "appearance";
                context = "";
                menuOptions = [
                    { text: "Scroll Speed", id: "scrollSpeed", value: appearance.scrollSpeed, type: "Number", min: 0, max: 100, step: 0.1},
                    { text: "Row Width", id: "rowWidth", value: appearance.rowWidth, type: "Number", min: 100, max: 999},
                    { text: "Receptor Position", id: "receptorPosition", value: appearance.receptorPosition, type: "Number", min: 0, max: Math.floor(canvas.height / 2)},
                    { text: "Playfield Offset", id: "playFieldOffset", value: appearance.playFieldOffset, type: "Number", min: -Math.floor(canvas.width / 2 - appearance.rowWidth / 2), max: Math.floor(canvas.width / 2 - appearance.rowWidth / 2)},
                    { text: "Scroll Direction", id: "scrollDirection", value: appearance.scrollDirection, type: "Number", min: 0, max: 1, step: 1},
                    { text: "Background Blur", id: "backgroundBlur", value: appearance.backgroundBlur, type: "Number", min: 0, max: 100},
                    { text: "Background Dim", id: "backgroundDim", value: appearance.backgroundDim, type: "Number", min: 0, max: 100},
                    { text: "Line Thickness", id: "lineThickness", value: appearance.lineThickness, type: "Number", min: 0, max: 100}
                ];
                
                onValueChange = () => {
                    for (let i = 0; i < Object.keys(appearance).length; i++) {
                        appearance[menuOptions[i].id] = menuOptions[i].value;
                    }
                }
            }
        },
        {
            "name": "! editor layout"
            
        },
        {
            "name": "! play chart"
        },
        {
            "name": "! test chart"
        }
    ],
    "edit" : [
        {
            "name": "metadata",
            "action": () => {
                currentMenu = "metadata";
                context = "";
                menuOptions = [
                    { text: "Name", id: "name", value: metadata.name, type: "Text"},
                    { text: "Difficulty", id: "difficulty", value: metadata.difficulty, type: "Text"},
                    { text: "Author", id: "author", value: metadata.author, type: "Text"},
                    { text: "Charter", id: "charter", value: metadata.charter, type: "Text"},
                    { text: "BPM", id: "bpm", value: metadata.bpm, type: "Number", min: 0, max: 999},
                    { text: "Offset", id: "offset", value: metadata.offset, type: "Number", min: 0},
                    { text: "Description", id: "description", value: metadata.description, type: "Text"},
                    { text: "Genre", id: "genre", value: metadata.genre, type: "Text"},
                    { text: "Source", id: "source", value: metadata.source, type: "Text"},
                    { text: "Date", id: "date", value: metadata.date, type: "Date"},
                    { text: "Tags", id: "tags", value: metadata.tags, type: "Text"}
                ];
                
                onValueChange = () => {
                    if (chart[findOptionByID(menuOptions, "difficulty").value] != chart[metadata.difficulty]) {
                        if (chart.difficulty_list.indexOf(findOptionByID(menuOptions, "difficulty").value) != -1) {
                            chart.difficulty_list.splice(chart.difficulty_list.indexOf(findOptionByID(menuOptions, "difficulty").value));
                        }

                        chart[findOptionByID(menuOptions, "difficulty").value] = chart[metadata.difficulty];
                        chart.difficulty_list[chart.difficulty_list.indexOf(metadata.difficulty)] = findOptionByID(menuOptions, "difficulty").value;
                        delete chart[metadata.difficulty];
                    }

                    for (let i = 0; i < menuOptions.length; i++) {
                        metadata[menuOptions[i].id] = menuOptions[i].value;
                    }
                    
                    beatHeight = 50000 / metadata.bpm
                    rowHeight = beatHeight / beatSnap;
                    
                    progress = snapProgressToBeatSnap();
                }
            }
        },
        { // BPM Offset SV Other fun stuff and chart background
            "name": "! chart properties"
        },
        { // Song, Song effects (Allows you to edit the song itself and do fun things to it, basically a built in remixer)
            "name": "! song properties"
        }
    ],
    "plugins"  : [
        {
            "name": "plugin manager",
            "action": () => {
                currentMenu = "plugin manager";
                context = "";
            }
        }
    ]
}

const appearance = {
    "rowWidth": "400", // 550
    "scrollSpeed": "15", // 28
    "receptorPosition": "150", // 100
    "playFieldOffset": "0",
    "scrollDirection": "0", // 0 = Down, 1 = Up
    "backgroundBlur": "10",
    "backgroundDim": "50",
    "lineThickness": "2"
}

// * CHART VARS
let chart = {
    "difficulty_list": [
        "Unset",
    ],
    "Unset" : [
        [],
        [],
        [],
        []
    ]
}

let metadata = {
    "name": "Untitled",
    "difficulty": "Unset",
    "author": "Unknown",
    "charter": "Unknown",
    "description": "No description",
    "genre": "Unknown",
    "source": "Unsourced",
    "date": new Date().toLocaleString(),
    "tags": "",
    "bpm": "100",
    "offset": "0"
}


// * DYNAMIC VARS
let mouseX = 0;
let mouseY = 0;

let beatSnap = 4; // beatSnap / 4
let maxRows = 20;
let beatHeight = 50000 / metadata.bpm; // Height of each beat / 4
let rowWidth = "400"; //

let rowHeight = beatHeight / beatSnap; // Height of each row

let currentMenu = "";
let context = ""; // current hovered menuBar option
let contextOptions;
let curContext = ""; // Last clicked menuBar option
let menuOptions = [];
let onValueChange = () => {};

let altTime = 0;

let selectedTextbox = "";

let progress = 0; // 1 Beat per BPM is snapHeight

// Adjusters
function setBeatSnap(x) {
    beatSnap = x;
    rowHeight = beatHeight / beatSnap;
    
    progress = snapProgressToBeatSnap();
}

// Keybinds
let ctrl = false;
let alt = false;
let f1 = false;

// * EVENTS
window.addEventListener('resize', function() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    width = canvas.width / 4;
    height = canvas.height / 18;
    extraSpace = canvas.width / 15;

    renderScene();
});

window.addEventListener("wheel", function(event) {
    const delta = event.deltaY;
    const dir = delta < 0 ? "u" : "d";
    const isCtrlDown = event.ctrlKey;
    const isAltDown = event.altKey;

    if (!currentMenu && !isAltDown) {
        if (dir === "d" && isCtrlDown && beatSnap > 1) {
            setBeatSnap(beatSnap - 1);
        } else if (dir === "u" && isCtrlDown && beatSnap < 64) {
            setBeatSnap(beatSnap + 1);
        } else if (dir === "d" && audio.currentTime > 0) {
            audio.currentTime -= 60 / metadata.bpm / beatSnap;
        } else if (dir === "u" && audio.currentTime < audio.duration) {
            audio.currentTime += 60 / metadata.bpm / beatSnap  ;
        } else if (audio.currentTime < 0 && !isCtrlDown) {
            audio.currentTime = 0;
        }
    }

    if (isAltDown) {
        const volumeDelta = dir === "u" ? (volume < 1) ? 0.01 : 0 : (volume > 0) ? -0.01 : 0;
        volume = Math.max(0, Math.min(1, volume + volumeDelta));
        audio.volume = volume;
        altTime = Date.now();
    }

    if (currentMenu !== "") {
        let selected = findOptionByID(menuOptions, selectedTextbox);
        if (selected.type === "Number") {
            let newValue;
            let step = (selected.step) ? Math.floor(selected.step * 10) / 10 : 1;
            newValue = (Math.round((parseFloat(selected.value) + (dir === "u" ? step : -step)) * 10) / 10).toString();
            if (newValue < selected.min || newValue >= selected.max) {
                newValue = (newValue >= selected.max) ? selected.max.toString() : selected.min.toString();
            }
            selected.value = newValue;
            onValueChange();
        }
    }

    event.preventDefault();
}, { passive: false });
function snapProgressToBeatSnap() {
    const beatSnapOffset = beatHeight / beatSnap;
    const nearestBeatSnap = Math.round(progress / beatSnapOffset) * beatSnapOffset;
    return nearestBeatSnap;
}

canvas.addEventListener('mousemove', function(event) {
    mouseX = event.pageX - canvas.offsetLeft;
    mouseY = event.pageY - canvas.offsetTop;
});


document.addEventListener('click', function(event) {
    if (context !== "" && !f1) { // When context menu is open
        let selectedOptions = menubar[context]; // Get the options for the current context
        const contextMenuX = 10 + Object.keys(menubar).indexOf(context) * 70; // Calculate the X position of the context menu
        curContext = context;

        for (let i = 0; i < selectedOptions.length; i++) {
            const option = selectedOptions[i];
            const optionY = contextMenuMarginTop + contextMargin * (i + 0.5);
            const isHovered = mouseY >= optionY && mouseY <= optionY + 20; // Check if the click occurred within the bounds of the option

            if (isHovered) {
                if (option.action) {
                    option.action();
                }
                //console.log("Clicked:", `${curContext} ->`, option.name);
                break;
            }
        }

        // Check if the click occurred outside the context menu
        if (!(mouseX >= contextMenuX && mouseX <= contextMenuX + 100 && mouseY >= contextMenuMarginTop && mouseY <= contextMenuMarginTop + contextMargin * (selectedOptions.length + 0.5))) {
            context = ""; // Close the context menu if the click occurred outside
        }
    }
    if (currentMenu !== "" && !f1) { // When menu is open
        if (mouseX > canvas.width * 0.05 && mouseX < canvas.width * 0.05 + titleFontSize + 15 && mouseY > canvas.height * 0.05 && mouseY < canvas.height * 0.05 + titleFontSize + 15) {
            currentMenu = "";
            selectedTextbox = "";
        }
    }
    if (context == "" && currentMenu == "") { // When no menu is open
        //console.log("Grid Position:", mouseSpot);
        
        //console.log("Mouse Button:", event.button);

        if (mouseX > canvas.width / 2 - appearance.rowWidth / 2 - appearance.playFieldOffset && mouseX < canvas.width / 2 - appearance.rowWidth / 2 + 4 * appearance.rowWidth / 4 - appearance.playFieldOffset) {
            addNote(mouseSpot[0], mouseSpot[1])
        }
    }
});

function addNote(x, y) {
    if (x !== undefined && y !== undefined && y >= 0) {
        //console.log(x, y)
        const index = chart[metadata.difficulty][x].findIndex(note => note.y === y);
        if (index !== -1) {
            event.preventDefault();
            chart[metadata.difficulty][x].splice(index, 1);
        } else {
            chart[metadata.difficulty][x].push({
                "y":y
            });
        }
    }

    
    for (var i = 0; i < chart[metadata.difficulty].length; i++) {
        // Use sort method to sort the array based on the "y" value of each object
        chart[metadata.difficulty][i].sort(function(a, b) {
            return a.y - b.y;
        });
    }
}

let isDragging = false;

document.addEventListener('mousedown', function(event) {
    // Check if the mouse is within the draggable area
    if (isWithinDraggableArea(event) && !f1) {
        isDragging = true;
        const mouseX = event.clientX;
        const controllerPercent = (1 + (mouseX - (canvas.width - margin * 1.5 - extraSpace)) / (width - margin - extraSpace));
        if (controllerPercent >= 0 && controllerPercent <= 1) {
            audio.currentTime = controllerPercent * audio.duration;
        }
    }
});

document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        const mouseX = event.clientX;
        const controllerPercent = (1 + (mouseX - (canvas.width - margin * 1.5 - extraSpace)) / (width - margin - extraSpace));
        if (controllerPercent >= 0 && controllerPercent <= 1) {
            //console.log(controllerPercent);
            audio.currentTime = controllerPercent * audio.duration;
        }
    }
});

document.addEventListener('mouseup', function(event) {
    if (isDragging) {
        isDragging = false;
    }
});

function isWithinDraggableArea(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    // Add logic to determine if the mouse is within the draggable area
    // This example assumes the draggable area is within the canvas
    const canvasRect = canvas.getBoundingClientRect();
    const controllerPercent = (1 + (mouseX - (canvas.width - margin * 1.5 - extraSpace)) / (width - margin - extraSpace));
    return controllerPercent >= 0 && controllerPercent <= 1 &&
            mouseY > canvas.height - height - margin / 2 && mouseY < canvas.height - margin * 1.5;
}

// document.addEventListener('drag', function(event) {
//     const controllerPercent = (1 + (mouseX - (canvas.width - margin * 1.5 - extraSpace)) / (width - margin - extraSpace));
//     if (controllerPercent >= 0 && controllerPercent <= 1) {
//         console.log(controllerPercent)
//         audio.currentTime = controllerPercent * audio.duration;
//     }
// });

// Event listener for key down
document.addEventListener('keydown', function(event) {
    //console.log("keyPressed:", event.key);
    if (event.altKey) {
        event.preventDefault();
        alt = true;
    }
    if (event.key == "F1") {
        event.preventDefault();
        f1 = !f1;
    }
    if (event.key == "F4" && parseFloat(appearance.scrollSpeed) + 1 <= 100) {
        appearance.scrollSpeed++;
        appearance.scrollSpeed = appearance.scrollSpeed.toString();
    } else if (event.key == "F3") {
        event.preventDefault();
        if (appearance.scrollSpeed - 1 >= 0) {
            appearance.scrollSpeed--;
            appearance.scrollSpeed = appearance.scrollSpeed.toString();
        }
    }
    if (event.key === "Control") {
        event.preventDefault();
        ctrl = true;
    }
    if (event.keyCode === 27) { // Escape key
        currentMenu = "";   
        selectedTextbox = "";
    }
    if (event.key >= 1 && event.key <= 4 && currentMenu == "") {
        addNote(event.key - 1, Math.floor(metadata.bpm / 60 * ((audio.currentTime - metadata.offset / 1000) + 1 / (metadata.bpm * beatSnap)) * beatSnap) / beatSnap)
    }
    let selected = findOptionByID(menuOptions, selectedTextbox);
    if (selected) {
        let newValue;
        switch (selected.type) {
            case "Text":
                rewriteLetter(event, selected);
                break;
            case "Number":
                newValue = rewriteNumber(event, selected.value);
                if (newValue < selected.min || newValue >= selected.max) {
                    newValue = (newValue >= selected.max) ? selected.max.toString() : selected.min.toString();
                }
                selected.value = newValue;
                break;
            case "Date":
                newValue = new Date().toLocaleString();
                break;
        
            default:
                break;
        }
        onValueChange();
    }

    if (selectedTextbox == "" && currentMenu == "") {
        if (event.key === " " && audio.src != '') {
            if (audio.paused) {
                audio.play();
                //console.log("Starting audio:", audio.src);
            } else {
                audio.pause();
                //console.log("Pausing audio:", audio.src);
                snapProgressToBeatSnap();
            }
        }
        if (event.key === "Backspace") {
            audio.pause();
            audio.currentTime = 0;
            //console.log("Stopping audio:", audio.src);
            snapProgressToBeatSnap();
        }
    }

    Math.floor(audio.currentTime * metadata.bpm / 60 * beatSnap) / beatSnap;
});

function rewriteNumber(event, variable) {
    if (event.keyCode >= 48 && event.keyCode <= 57) {
        variable = variable.toString() + String.fromCharCode(event.keyCode);
    } else if (event.keyCode === 8 && variable.length > 0) {
        variable = variable.toString().slice(0, -1);
        if (event.ctrlKey) {
            return "";
        }
    }

    const shiftn = ["-", "_"];
    const shiftp = ["+", "="];
    if (shiftn.includes(event.key) || shiftp.includes(event.key)) {
        variable = (shiftn.includes(event.key) ? Math.abs(variable) * -1 : Math.abs(variable)).toString();
    }
    if (shiftn.includes(event.key) && variable == "0") {
        variable = "-";
    }
    return variable;
}

function rewriteLetter(event, variable) {
    // List of allowed key codes
    const allowedKeyCodes = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", ".", "-", "_", "=", "(", ")", "[", "]", "{", "}", ":", ";", "'", "\"", "`",
        "!", "@", "#", "$", "%", "^", "&", "*", "?", " ", "/"
    ];

    // Handling Ctrl+V (paste) action
    if (ctrl && event.key === "v") {
        // Get the text from clipboard
        navigator.clipboard.readText().then((text) => {
            // Filter out disallowed characters from the pasted text
            const filteredText = text.split('').filter(char => allowedKeyCodes.includes(char)).join('');
            // Add the filtered text from clipboard to the variable
            variable.value += filteredText;
            // Check if the variable length exceeds the limit (512 characters)
            if (variable.value.length > 512) {
                // Trim the variable to the limit
                variable.value = variable.value.substring(0, 512);
            }
        });
        console.log(variable.value)
        return;
    }

    // Handling regular key press
    if (allowedKeyCodes.includes(event.key) && variable.value.length < 512) {
        variable.value += event.key;
    } else if (event.keyCode === 8 && variable.value.length > 0) { // Backspace
        variable.value = variable.value.slice(0, -1);
        if (ctrl) { // CTRL + Backspace = Delete last word
            const lastSpaceIndex = variable.value.lastIndexOf(' ');
            if (lastSpaceIndex !== -1) {
                variable.value = variable.value.substring(0, lastSpaceIndex);
            } else {
                variable.value = "";
            }
        }
    }
}

// Event listener for key up
document.addEventListener('keyup', function(event) {
    //console.log("Key up:", event.key);
    if (!event.altKey) {
        alt = false;
    }
    if (event.key === "Control") {
        event.preventDefault();
        ctrl = false;
    }
});

// * RENDERING
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;
let mouseSpot = [];
function renderScene() {
    // Calculate FPS
    const currentTime = performance.now();
    const delta = currentTime - lastFrameTime;
    frameCount++;
    if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta);
        frameCount = 0;
        lastFrameTime = currentTime;
    }

    // Clear screen for redraw
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground();

    // Draw controller
    if (audio.src !== '') {
        drawRow();
        drawNotes(appearance.rowWidth, rowHeight);
        if (!f1) {
            drawController();
        }
    }

    // Draw toolbar
    
    if (!f1) {
        drawToolbar();

        // Draw menu
        drawCurrentMenu();

        // Draw chartInfo
        ctx.fillStyle = '#fff';
        ctx.fillText('BeatSnap: ' + beatSnap + '/4', 10, canvas.height - 25);
    }

    // Draw FPS
    ctx.fillStyle = '#fff';
    ctx.fillText('FPS: ' + fps, 10, canvas.height - 10);
}

function drawBackground() {
    // Calculate the aspect ratio of the canvas and the background image
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = background.width / background.height;
    
    let drawWidth, drawHeight;
    let offsetX = 0, offsetY = 0;

    // Determine the dimensions to draw the image
    if (canvasAspect > imageAspect) { // Canvas is wider relative to its height than the image
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageAspect;
        offsetX = (canvas.width - drawWidth) / 2; // Center horizontally
    } else { // Canvas is taller relative to its width than the image
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageAspect;
        offsetY = (canvas.height - drawHeight) / 2; // Center vertically
    }
    offsetX += (canvas.width / 2 - mouseX) / 300;
    offsetY += (canvas.height / 2 - mouseY) / 300;

    // Apply the blur filter and draw the image
    ctx.filter = `blur(${appearance.backgroundBlur}px)`;
    ctx.drawImage(background, offsetX, offsetY, drawWidth, drawHeight);
    ctx.filter = 'none';

    // Apply the dimming overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${appearance.backgroundDim / 100})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const margin = 20;
let width = canvas.width / 4;
let height = canvas.height / 18;
let extraSpace = canvas.width / 15;
function drawController() {
    const controllerX = canvas.width - width - margin;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    roundRect(ctx, controllerX, canvas.height - height - margin, width, height, 10);

    const barWidth = width - margin - extraSpace;
    const barWidthEnd = canvas.width - margin * 1.5 - extraSpace;
    const barHeight = height - margin;
    const barHeightEnd = canvas.height - margin * 1.5
    const barX = canvas.width - width - margin / 2;
    const barY = canvas.height - height - margin / 2;
    ctx.fillStyle = 'rgba(127, 127, 127, 0.6)';
    roundRect(ctx, canvas.width - width - margin / 2, barY, barWidth, barHeight, 5);

    if (mouseX > barX && mouseX < barWidthEnd && mouseY > barY && mouseY < barHeightEnd) {
        ctx.fillStyle = 'rgba(64, 64, 64, 0.5)';
        roundRect(ctx, barX, barY, (1 + (mouseX - (barWidthEnd)) / barWidth) * (barWidth), barHeight, 5);

        ctx.fillStyle = 'rgb(0, 0, 0)';
        const tempPos = (1 + (mouseX - (barWidthEnd)) / barWidth) * audio.duration
        ctx.fillText(timeToText(audio.currentTime, audio.duration, false), mouseX, mouseY);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, barX, barY, audio.currentTime / audio.duration * (barWidth), barHeight, 5);

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillText(timeToText(audio.currentTime, audio.duration), canvas.width - margin - extraSpace, canvas.height - margin - height / 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const diffInMilliseconds = altTime - (new Date()).getTime() + 5000;
    if (diffInMilliseconds > 0) {
        const volX = canvas.width - Math.min(200, diffInMilliseconds) / 200 * (width + margin);
        const volY = canvas.height - height * 2 - margin * 2;
        roundRect(ctx, volX, volY, width, height, 10);
        ctx.fillStyle = 'rgba(135, 206, 250, 0.8)';
        roundRect(ctx, volX, volY, width * volume, height, 10);

        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillText("Master Volume:" + (volume * 100).toFixed(0) + "%", volX + 10, volY + height / 2);
        
    }
}

function timeToText(curTime, totTime, fullTime = true) {
    let text = Math.floor(curTime / 60) + ":" + (((Math.floor((curTime % 60).toFixed(2)).toString()).length < 2) ? "0" : "") + (curTime % 60).toFixed(2);
    if (fullTime) {
        text += ' / ' + Math.floor(totTime / 60) + ":" + (totTime % 60).toFixed(2);
    } 
    return text;
}

function findOptionByID(menuOptions, currentMenu) {
    for (let i = 0; i < menuOptions.length; i++) {
        if (menuOptions[i].id === currentMenu) {
            return menuOptions[i];
        }
    }
    return null; // Return null if option with the specified name is not found
}

function drawCurrentMenu() {
    if (currentMenu) {

        // Dim background
        ctx.fillStyle = `rgba(20, 20, 20, 0.5)`; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Panel
        ctx.fillStyle = "rgba(120, 120, 120, 0.85)";
        roundRect(ctx, canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9, 10);

        // Panel Title
        roundRect(ctx,canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, titleFontSize + 15, 10);

        // Panel text
        ctx.font = `${titleFontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText(currentMenu, canvas.width / 2, canvas.height * 0.05 + 30); // 30 is the height of the font in pixels

        // Close Button
        ctx.fillStyle = (mouseX > canvas.width * 0.05 && mouseX < canvas.width * 0.05 + titleFontSize + 15 && mouseY > canvas.height * 0.05 && mouseY < canvas.height * 0.05 + titleFontSize + 15) ? "#EE4B2B" : "#ddd";
        ctx.fillText("X", canvas.width * 0.05 + (titleFontSize + 15) / 2, canvas.height * 0.05 + (titleFontSize + 15) / 1.4);

        resetFont();

        const inputFieldWidth = 100;
        const inputFieldOffset = 150;
        
        ctx.font = "16px sans-serif";
        generateFields(menuOptions, inputFieldWidth, inputFieldOffset);

        resetFont();
    }
}

function generateFields(fields, inputFieldWidth, inputFieldOffset) {
    let textWrapIndent = 0;
    let y = 100;
    fields.forEach(field => {
        const text = findOptionByID(menuOptions, field.id).value;
        const textWidth = ctx.measureText(text).width;
        
        y += 30;
        thisInputFieldWidth = Math.min(Math.max(textWidth + 10, inputFieldWidth), canvas.width * 0.7 + 5);

        const lines = wrapText(ctx, text, canvas.width * 0.7);
        const isMouseOver = (
            mouseX >= canvas.width * 0.05 + inputFieldOffset &&
            mouseX <= canvas.width * 0.05 + inputFieldOffset + thisInputFieldWidth &&
            mouseY >= canvas.height * 0.05 + y - 15 &&
            mouseY <= canvas.height * 0.05 + y + 5 + 20 * (lines.length - 1)
        );
        
        ctx.fillStyle = "#fff";
        ctx.fillText(field.text, canvas.width * 0.05 + 10, canvas.height * 0.05 + y);

        ctx.fillStyle = isMouseOver ? "rgba(64,64,64,0.66)" : "rgba(64,64,64,0.33)";
        roundRect(ctx, canvas.width * 0.05 + inputFieldOffset, canvas.height * 0.05 + y - 15, thisInputFieldWidth, 20 * (lines.length), 5);
    
        ctx.fillStyle = "#fff";
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], (canvas.width * 0.05 + inputFieldOffset + 5), (canvas.height * 0.05 + y) + 20 * i);   
        }
       //((((new Date()).getSeconds() % 2) === 0 && isMouseOver) ? "|" : "")

        if (isMouseOver) {
            selectedTextbox = field.id;
        }

        y += 20 * (lines.length - 1);
    });
}

function wrapText(ctx, text, maxWidth) {
    let words
    try {
        words = text.split(' ');
    } catch (error) {
        console.error("Invalid text:", text, error);
    }
    
    let lines = [];
    let line = []

    words.forEach(word => {
        let testLine = line.concat(word);
        if (ctx.measureText(testLine).width < maxWidth) {
            line.push(word);
        } else {
            lines.push(line.join(' '));
            line = [word];
        }
    });
    lines.push(line.join(' '));

    return lines;
}
function resetFont() {
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "start";

}

function drawButton(x, y, label, isHighlighted, action) {
    ctx.fillStyle = isHighlighted ? '#bbb' : '#ddd';
    ctx.fillRect(x, y, 60, 20);
    ctx.fillStyle = '#000';
    ctx.fillText(label, x + 20, y + 15);
    if (isHighlighted && action) {
        action();
    }
}

// Function to draw the context menu
function drawContextMenu(x, y, options) {
    const contextMargin = 20; // Adjust as needed

    let r = options.length * contextMargin;
    r = Math.floor(r);

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const isHovered = mouseY >= y + contextMargin * (i + 0.5) && mouseY <= y + contextMargin * (i + 1.5);
        ctx.fillStyle = (i == r || isHovered) ? '#bbb' : '#ddd';
        ctx.fillRect(x, contextMargin * (i + 0.5) + y, 100, 20);
        ctx.fillStyle = '#000';
        ctx.fillText(option.name, x + 10, contextMargin * (i + 0.5) + y * 1.5);
    }
}

function isHovering(x, y, width, height, con) {
    return mouseX >= x && mouseX <= x + ((con === context && mouseY >= y + height) ? 100 : width) && mouseY >= y && mouseY <= y + height + ((con === context) ? contextMargin * (menubar[context].length + 1.5) + y : 0);
}

function getContext() {
    let menuOptions = Object.keys(menubar);
    let buttonWidth = 60;
    let margin = 70;

    for (let i = 0; i < menuOptions.length; i++) {
        let x = 10 + i * margin;
        if (isHovering(x, 10, buttonWidth, 20, menuOptions[i])) {
            return menuOptions[i];
        }
    }
    return "";
}

// Function to draw the toolbar
function drawToolbar() {
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, 40);

    // Draw buttons for each menu option
    let menuOptions = Object.keys(menubar);
    let buttonWidth = 60;
    let margin = 70;

    menuOptions.forEach((option, index) => {
        drawButton(10 + index * margin, 10, option, context === option);
    });

    // Determine context based on mouse position
    if (currentMenu == '') {
        context = getContext();

        // Draw context menu if applicable
        if (context && menubar[context]) {
            drawContextMenu(10 + menuOptions.indexOf(context) * margin, contextMenuMarginTop, menubar[context]);
        }
    }
}

// Draw row
function drawRow() {

    const thickness = parseInt(appearance.lineThickness);
    const xOffset = appearance.playFieldOffset
    const rowX = canvas.width / 2 - appearance.rowWidth / 2;
    const standardX = rowX - thickness / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(standardX - xOffset, 0, appearance.rowWidth, canvas.height);

    ctx.fillStyle = "white";
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(standardX + i * appearance.rowWidth / 4 - xOffset, 0, thickness, canvas.height);
        if (mouseX > rowX + i * appearance.rowWidth / 4 - xOffset) {
            mouseSpot[0] = i;
        }
    }

    const dist = appearance.scrollSpeed / metadata.bpm / beatSnap;
    if (dist >= 0.001) {
        for (let i = Math.floor((audio.currentTime - 3 / (appearance.scrollSpeed * (1 / audio.playbackRate))) * (metadata.bpm / 60) * beatSnap); i < audio.currentTime * (metadata.bpm / 60) * beatSnap + canvas.height / 50 * (100 * (beatSnap / 4) / ((appearance.scrollSpeed * (1 / audio.playbackRate)) * 15)); i++) {
            ctx.fillStyle = (i % 4) ? '#FFD300' : (i % 16) ? '#009999' : '#CD0074';
            const x = standardX - xOffset;
            const y = getPosition(i, audio.currentTime, appearance.receptorPosition, metadata.offset, metadata.bpm, beatSnap, (appearance.scrollSpeed * 15), audio.playbackRate, 1); //base + (pos - index) * metadata.bpm / 60 * scrollSpeed;
            
                ctx.fillRect(x, y, parseInt(appearance.rowWidth) + thickness, thickness); // Top Line
                if (dist >= 0.01 && !f1) {
                    const text = Math.floor(i / beatSnap * 100) / 100 + "" + (i % 16 == 0 ? ` (${((Math.floor(i / (beatSnap * 4) * 100) / 100)) + 1})` : "") // Every beat by beatsnap, and +1 every 16th beat starting at 1 (To match quavers measure meter)
                    ctx.fillText(text, canvas.width / 2 + appearance.rowWidth / 2 + thickness / 4 + 10 - xOffset, y);
                }
            if (mouseY < y) {
                mouseSpot[1] = i / beatSnap; 
            }
        }
    } else {
        ctx.fillStyle = '#FFD300';
        ctx.fillRect(standardX - xOffset, 0, appearance.rowWidth, canvas.height)
    }
    resetFont()

    if (mouseX < rowX + 4 * appearance.rowWidth / 4 - xOffset && mouseX > rowX && audio.src != '') {
        ctx.fillText(`[${mouseSpot[0]}, ${mouseSpot[1]}]`, mouseX, mouseY);
    }
}

function drawNotes(w, h) {
    const xOffset = appearance.playFieldOffset
    const imgW = Math.min(w / 4, h* 10000);
    if (chart[metadata.difficulty] == undefined) {
        return;
    }
    for (let i = 0; i < chart[metadata.difficulty].length; i++) {
        const lane = chart[metadata.difficulty][i];
        for (let j = 0; j < lane.length; j++) {
            const note = lane[j];
            let noteX = ( canvas.width / 2 - appearance.rowWidth / 2 + i * appearance.rowWidth / 4 ) - xOffset;
            let noteY = getPosition(note.y, audio.currentTime, appearance.receptorPosition, metadata.offset, metadata.bpm, 4, (appearance.scrollSpeed * 15), audio.playbackRate, 4);
            ctx.drawImage(receptor_1, noteX, noteY - imgW, imgW, imgW);
        }   
    }

    ctx.fillStyle = "rgba(120, 20, 20, 0.66)";
    ctx.fillRect(canvas.width / 2 - appearance.rowWidth / 2 - xOffset, canvas.height - appearance.receptorPosition, appearance.rowWidth, 10);
}

//VSYNC (I think)
function renderLoop() {
    renderScene();
    requestAnimationFrame(renderLoop);
}

function VSync() {
    renderLoop();
}

function Unlimited() {
    setInterval(() => {
        renderScene();
    }, 0);
}

function Limited() {
    const target = 60
    setInterval(() => {
        renderScene();
    }, 1000 / 60);
}

// * RENDER TYPES
Unlimited(); //Unlimited(); Unlimited(); Unlimited(); Unlimited();// Renders scene at unlimited fps
//Limited(); // Renders scene at targeted (60) fps
//VSync(); // Matches refresh rate of monitor (I think)

// * UTILITY

document.addEventListener('dragover', function(event) {
    event.preventDefault();
    event.stopPropagation();

    currentMenu = "importing file(s)";
});

document.addEventListener('dragleave', function(event) {
    event.preventDefault();
    event.stopPropagation();

    currentMenu = "";
    selectedTextbox = "";
});

document.addEventListener('drop', function(event) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    const pscFile = Array.from(files).find(file => file.name.endsWith('.psc'));
    const imgFile = Array.from(files).find(file => file.name.endsWith('.png') || file.name.endsWith('.jpg'));
    const songFile = Array.from(files).find(file => file.name.endsWith('.mp3'));

    if (pscFile) {
        loadChart(pscFile)
    }

    if (imgFile) {
        loadBackground(imgFile);
    }

    if (songFile) {
        loadAudio(songFile);
    }

    currentMenu = "";
    selectedTextbox = "";
});

function loadChart(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const zip = new JSZip();
        zip.loadAsync(e.target.result).then(function(zip) {
            const mapDataFile = zip.file('mapData.json');
            const audioFile = zip.file('audio.mp3');
            const backgroundFile = zip.file('background.png');

            if (mapDataFile) {
                mapDataFile.async('text').then(function(mapDataContent) {
                    const mapData = JSON.parse(mapDataContent);
                    console.log(mapData)
                    metadata = mapData.metadata;
                    chart = mapData.difficulties;
                    metadata.difficulty = chart.difficulty_list[0];
                    // Add your custom logic to process the mapData.json content here
                }).catch(function(error) {
                    console.error('Error reading mapData.json:', error);
                });
            }

            if (audioFile) {
                audioFile.async('blob').then(function(audioContent) {
                    loadAudio(audioContent);  // Ensure that audioContent is a valid blob
                }).catch(function(error) {
                    console.error('Error reading audio.mp3:', error);
                });
            }

            if (backgroundFile) {
                backgroundFile.async('blob').then(function(backgroundContent) {
                    const backgroundUrl = URL.createObjectURL(backgroundContent);
                    const img = new Image();
                    img.src = backgroundUrl;
                    img.onload = function() {
                        // Use img for your background
                        background = img;
                        // You can also draw the image onto a canvas if needed
                    };
                }).catch(function(error) {
                    console.error('Error reading background.png:', error);
                });
            }
        }).catch(function(error) {
            console.error('Error loading zip content:', error);
        });
    };
    reader.readAsArrayBuffer(file);
}


function loadAudio(songFile) {
    adFile = songFile;
    audio = new Audio();

    audio.src = URL.createObjectURL(songFile);
    audio.volume = volume;

    maxRows = audio.duration * metadata.bpm + 1;
}

function loadBackground(backgroundFile) {
    bgFile = backgroundFile;

    background = new Image();
    background.src = URL.createObjectURL(backgroundFile);
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function exportMapData() {
    const exportData = {
        metadata: { ...metadata, difficulty: "" },
        difficulties: chart,
        backgroundImage: bgFile ? URL.createObjectURL(bgFile) : null,
        audio: adFile ? URL.createObjectURL(adFile) : null
    };

    const jsonData = JSON.stringify(exportData);

    const zip = new JSZip();
    zip.file("mapData.json", jsonData);

    const promises = [];

    if (background && background.src.startsWith('data:')) {
        zip.file("background.png", background.src.substr(background.src.indexOf(',') + 1), { base64: true });
    } else if (background && background.src.startsWith('blob:')) {
        promises.push(new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', background.src, true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                const reader = new FileReader();
                reader.onload = function() {
                    const base64Data = reader.result.split(',')[1]; // Remove data URL prefix
                    zip.file("background.png", base64Data, { base64: true });
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(e.target.response);
            };
            xhr.onerror = reject;
            xhr.send();
        }));
    }

    if (adFile) {
        promises.push(new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function() {
                const base64Data = reader.result.split(',')[1]; // Remove data URL prefix
                zip.file("audio.mp3", base64Data, { base64: true });
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(adFile);
        }));
    }

    Promise.all(promises)
        .then(() => zip.generateAsync({ type: "blob" }))
        .then((content) => {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(content);
            downloadLink.download = `${metadata.author} - ${metadata.name}.psc`;
            downloadLink.click();
        })
        .catch((error) => {
            console.error('Error exporting map data:', error);
        });
}

// Quaver
function exportMapDataToQuaver() {
    const zip = new JSZip();
    chart.difficulty_list.forEach((difficulty, i) => {
        console.log("Getting map data for difficulty:", difficulty);
        let mapData = `AudioFile: audio.mp3
BackgroundFile: background.png
MapId: ${1000000 + i}
MapSetId: 1000000
Mode: Keys4
Title: ${metadata.name}
Artist: ${metadata.author}
Source: ${metadata.source}
Tags: ${metadata.tags}
Creator: ${metadata.charter}
DifficultyName: ${difficulty}
Description: Created at ${Date.now()}
BPMDoesNotAffectScrollVelocity: true
InitialScrollVelocity: 1
EditorLayers: []
Bookmarks: []
TimingPoints:
- StartTime: ${metadata.offset}
    Bpm: ${parseFloat(metadata.bpm)}`;
        if (chart[difficulty].length > 0) {
            mapData +=`
HitObjects:`
            mapData +=`
CustomAudioSamples: []
SoundEffects: []`
            for (let j = 0; j < chart[difficulty].length; j++) {
                const notes = chart[difficulty][j];
                for (let n = 0; n < notes.length; n++) {
                    const note = notes[n];
                    mapData +=`
- StartTime: ${note.y * parseFloat(metadata.bpm) + parseFloat(metadata.offset)}
    Lane: ${j + 1}
    KeySounds: []`
                    
                }
            }

        }
    
        zip.file(`${1000000 + i}.qua`, mapData);
    });

    const promises = [];

    console.log("Getting map background data:", background.src);
    if (background && background.src.startsWith('data:')) {
        zip.file("background.png", background.src.substr(background.src.indexOf(',') + 1), { base64: true });
    } else if (background && background.src.startsWith('blob:')) {
        promises.push(new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', background.src, true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                const reader = new FileReader();
                reader.onload = function() {
                    const base64Data = reader.result.split(',')[1]; // Remove data URL prefix
                    zip.file("background.png", base64Data, { base64: true });
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(e.target.response);
            };
            xhr.onerror = reject;
            xhr.send();
        }));
    }

    console.log("Getting map audio data:", audio.src);
    if (adFile) {
        promises.push(new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function() {
                const base64Data = reader.result.split(',')[1]; // Remove data URL prefix
                zip.file("audio.mp3", base64Data, { base64: true });
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(adFile);
        }));
    }

    Promise.all(promises)
        .then(() => zip.generateAsync({ type: "blob" }))
        .then((content) => {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(content);
            downloadLink.download = `${metadata.author} - ${metadata.name} - ${1000000}.qp`;
            downloadLink.click();
        })
        .catch((error) => {
            console.error('Error exporting map data:', error);
        });
}
