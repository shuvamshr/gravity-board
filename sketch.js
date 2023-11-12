// Array to store circle objects for animation.
let circles = [];

// Size of the canvas used for determining circl's position around the screen.
let canvasSize = 600;

// Size of the circles.
let circleSize = 15;

// Control values for gravity and orbit behavior.
let gravitySpeedValue = 0;
let gravityRadiusValue = 0;
let orbitSizeValue = 0;
let orbitSpeedValue = 0;

// Control values for musical notes.
let noteSpeedValue = 1;
let noteSustainValue = 0;
let noteVolumeValue = 0;
let noteReleaseValue = 0;

// Constants used for scaling control knob values.
const ANGLE_KNOB_SCALE = 2000;
const RADIUS_KNOB_SCALE = 20;
const ROTATION_SPEED_KNOB_SCALE = 200;
const STUCK_THRESHOLD = 100;

// Maximum length of the circle's trail.
const trailLength = 5;

// Polyphonic synthesizer instance for playing notes.
let polySynth;

// Colors for the screen stroke when it's on and off.
let screenStrokeOn = "#636363";
let screenStrokeOff = "#636363";

// Flags to control recording and playback.
let isRecording = false;
let isPlayingBack = false;

// Array to store recorded events.
let recordedEvents = [];

// Mapping of MIDI key indices to musical note names.
const midiKeyToNote = [
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A5",
  "A#5",
  "B5",
  "C5",
  "C#5",
  "D5",
  "D#5",
  "E5",
  "F5",
  "F#5",
  "G5",
  "G#5",
  "A6",
  "A#6",
  "B6",
  "C6",
];

// Stores the current key index when a MIDI key is pressed.
let keyIndex;

// Alpha value for the glowing effect (initialized to 128).
let glowAlpha = 128;

// This setup function initializes the canvas, event listeners, and various settings.

function setup() {
  // Get a reference to the HTML element for the canvas container.
  let canvasContainer = document.getElementById("canvas_container");

  // Create a p5.js canvas with a size of 600x600 and attach it to the canvas container.
  let cnv = createCanvas(600, 600);
  cnv.parent(canvasContainer);

  // Set the canvas border radius to create a rounded appearance.
  canvas.style.borderRadius = "10px";

  // Create a polyphonic synthesizer instance for playing musical notes.
  polySynth = new p5.PolySynth();

  // Add event listeners for various control knobs and MIDI key presses.

  // Event listeners for gravity control knobs.
  document.addEventListener("g1", (event) => {
    gravitySpeedValue = event.detail.knobValue;
  });

  document.addEventListener("g2", (event) => {
    gravityRadiusValue = event.detail.knobValue;
  });

  document.addEventListener("g3", (event) => {
    orbitSizeValue = event.detail.knobValue;
  });

  document.addEventListener("g4", (event) => {
    orbitSpeedValue = event.detail.knobValue;
  });

  // Event listeners for musical note control knobs.
  document.addEventListener("a1", (event) => {
    noteSpeedValue = event.detail.knobValue;
  });

  document.addEventListener("a2", (event) => {
    noteVolumeValue = event.detail.knobValue;
  });

  document.addEventListener("a3", (event) => {
    noteSustainValue = event.detail.knobValue;
  });

  document.addEventListener("a4", (event) => {
    noteReleaseValue = event.detail.knobValue;
  });

  // Event listener for MIDI key presses.
  document.addEventListener("midiKeyPressed", (event) => {
    keyIndex = event.detail.keyIndex;
    const note = midiKeyToNote[keyIndex];

    // If recording is enabled, record the event.
    if (isRecording) {
      recordEvent();
    }

    // Play a musical note using a polyphonic synthesizer, with customizable parameters.
    polySynth.play(
      note,
      map(noteVolumeValue, 0, 127, 0.1, 1), // Volume mapping.
      map(noteSustainValue, 0, 127, 0.1, 1), // Sustain mapping.
      map(noteReleaseValue, 0, 127, 0.1, 1) // Release mapping.
    );

    // Create a circle with initial properties and push it into an array.
    circles.push({
      angle: map(keyIndex, 0, 25, 0, TWO_PI), // Map the angle based on key index.
      radius: canvasSize / 2.2, // Set initial radius.
      stuck: false, // circle is not stuck initially.
      keyIndex: keyIndex, // Store the key index.
      trail: [], // Initialize an empty trail.
      stuckTime: 0, // Initialize stuck time.
    });
  });

  // Event listener for the reset button press, reloading the page.
  document.addEventListener("resetPressed", (event) => {
    location.reload();
  });

  // Event listener for the record button press, toggling recording and playback modes.
  document.addEventListener("recordPressed", (event) => {
    if (isRecording) {
      screenStrokeOn = "#59D60C";
      screenStrokeOff = "#55EE89";
      isRecording = false;
      isPlayingBack = true;
      playbackRecordedEvent();
    } else {
      screenStroke = "#FF9737";
      screenStrokeOn = "#FF4A4A";
      screenStrokeOff = "#FFA216";
      isRecording = true;
      recordedEvents = [];
    }
  });
}

// This is the main draw function that continuously updates the canvas.

function draw() {
  generateScreen(); // Call the function to generate the visual appearance of the screen.
  circleGravityEvent(); // Call the function to handle the animation of circles with gravity and orbit behavior.
}

// This function generates the visual appearance of the screen.

function generateScreen() {
  // Calculate a glowing color that oscillates between two colors.
  const glowingColor = lerpColor(
    color(screenStrokeOn), // Starting color when "on".
    color(screenStrokeOff), // Ending color when "off".
    abs(sin(frameCount * 0.03)) // Use a sine wave to create a glowing effect.
  );

  stroke(glowingColor); // Set the stroke color to the calculated glowing color.
  strokeWeight(10); // Set the stroke weight (line thickness).

  fill("#292323"); // Set the fill color to match the background.
  rectMode(CORNER); // Set the rectangle drawing mode to CORNER.

  // Draw a rounded rectangle that covers the entire canvas, creating the screen.
  rect(0, 0, width, height, 15);

  noStroke(); // Disable the stroke for future drawing operations.
}

// This function handles the animation of circle with gravity and orbit behavior.

function circleGravityEvent() {
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i]; // Get the current circle from the array.

    // Calculate the position of the circle based on its angle and radius.
    const circleX = canvasSize / 2 + cos(circle.angle) * circle.radius;
    const circleY = canvasSize / 2 + sin(circle.angle) * circle.radius;

    // Map the color value based on the circle's keyIndex.
    const colorValue = map(circle.keyIndex, 0, 25, 150, 50);

    // Iterate over the circle's trail points.
    for (let j = 0; j < circle.trail.length; j++) {
      const trailX = circle.trail[j].x;
      const trailY = circle.trail[j].y;
      const trailAlpha = map(j, 0, circle.trail.length, 0, 100);

      // Draw the trail points with varying transparency.
      fill(249, 166, colorValue, trailAlpha);
      ellipse(trailX, trailY, circleSize, circleSize);
    }

    // Determine the alpha (transparency) of the main circle.
    const circleAlpha = circle.stuck
      ? map(millis() - circle.stuckTime, 0, 3000, 255, 0)
      : 255;

    // Draw the main circle with varying transparency.
    fill(249, 166, colorValue, circleAlpha);
    ellipse(circleX, circleY, circleSize, circleSize);

    // Add the current position to the circle's trail.
    circle.trail.push({ x: circleX, y: circleY });

    // Remove the oldest trail point if the trail length exceeds a certain limit.
    if (circle.trail.length > trailLength) {
      circle.trail.shift();
    }

    // Handle the circle's behavior based on whether it's stuck or not.
    if (!circle.stuck) {
      // Update the circle's angle and radius based on control values.
      circle.angle += map(
        gravitySpeedValue,
        0,
        127,
        0,
        gravitySpeedValue / ANGLE_KNOB_SCALE
      );
      circle.radius -= map(
        gravityRadiusValue,
        0,
        127,
        0,
        gravityRadiusValue / RADIUS_KNOB_SCALE
      );

      // If the radius becomes smaller than a threshold, mark the circle as stuck.
      if (circle.radius < orbitSizeValue) {
        circle.stuck = true;
        circle.stuckTime = millis();
      }
    } else {
      // If the circle is stuck, orbit it at a fixed radius and control its rotation.
      circle.angle += map(
        orbitSpeedValue,
        0,
        127,
        0,
        orbitSpeedValue / ROTATION_SPEED_KNOB_SCALE
      );
      circle.radius = orbitSizeValue;

      // If the circle has been stuck for a specified time (curr: 10 secs), remove it from the array.
      if (millis() - circle.stuckTime >= 10000) {
        circles.splice(i, 1);
        i--; // Adjust the loop counter to account for the removed circle.
      }
    }
  }
}

// This function records an event if a key index is defined.

function recordEvent() {
  if (keyIndex !== undefined) {
    const timestamp = millis(); // Get the current timestamp in milliseconds.

    // Create an event object with the current key index and timestamp, then add it to the recorded events array.
    recordedEvents.push({ keyIndex, timestamp });
  }
}

// This function plays back recorded events, creating circles and triggering notes based on the recorded data.

function playbackRecordedEvent() {
  let currentIndex = 0; // Initialize the current index for iterating through recorded events.

  // This nested function plays the next recorded event.
  function playNextEvent() {
    // Check if there are more recorded events to play and if playback is enabled.
    if (currentIndex < recordedEvents.length && isPlayingBack) {
      const event = recordedEvents[currentIndex]; // Get the current recorded event.
      const { keyIndex, timestamp } = event; // Extract key index and timestamp from the event.
      const note = midiKeyToNote[keyIndex]; // Convert the key index to a musical note.

      // Calculate the time offset relative to the first recorded event.
      const timeOffset = timestamp - recordedEvents[0].timestamp;

      // Play a musical note using a polyphonic synthesizer, with customizable parameters.
      polySynth.play(
        note,
        map(noteVolumeValue, 0, 127, 0.1, 1), // Volume mapping.
        map(noteSustainValue, 0, 127, 0.1, 1), // Sustain mapping.
        map(noteReleaseValue, 0, 127, 0.1, 1) // Release mapping.
      );

      // Create a circle with initial properties and push it into an array.
      circles.push({
        angle: map(keyIndex, 0, 25, 0, TWO_PI), // Map the angle based on key index.
        radius: canvasSize / 2.2, // Set initial radius.
        stuck: false, // Circle is not stuck initially.
        keyIndex: keyIndex, // Store the key index.
        trail: [], // Initialize an empty trail.
        stuckTime: 0, // Initialize stuck time.
        playbackTimestamp: timeOffset, // Store the playback timestamp.
      });

      currentIndex++; // Move to the next recorded event.

      if (currentIndex === recordedEvents.length) {
        currentIndex = 0; // Loop back to the first event if playback reaches the end.
      }

      if (isPlayingBack) {
        // Calculate the delay until the next recorded event and schedule it.
        const nextTimestamp = recordedEvents[currentIndex].timestamp;
        const delay = nextTimestamp - timestamp;
        setTimeout(
          playNextEvent,
          delay * map(noteSpeedValue, 0, 127, 1.5, 0.5) // Adjust delay based on note speed value.
        );
      }
    }
  }

  // Start playback by calling playNextEvent with an initial delay of 0 milliseconds.
  setTimeout(playNextEvent, 0);
}
