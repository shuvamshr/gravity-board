// This variable stores the MIDI access object obtained from the Web MIDI API.
let midiAccess;

// This code requests access to MIDI devices using the Web MIDI API and initializes MIDI handling.

navigator.requestMIDIAccess().then(function (access) {
  // Store the obtained MIDI access in the 'midiAccess' variable.
  midiAccess = access;

  // Call the 'initializeMIDI' function to set up MIDI event handling.
  initializeMIDI();
});

// This function initializes the MIDI input and sets up event handlers for MIDI messages.

function initializeMIDI() {
  // Get the first available MIDI input device from the MIDI access object.
  const input = midiAccess.inputs.values().next().value;

  // Dispatch an initial event to set the initial knob positions.
  dispatchInitialKnobPosition();

  if (input) {
    // If a MIDI input device is found, set the 'onmidimessage' event handler to handle MIDI messages.
    input.onmidimessage = handleMIDIMessage;
  } else {
    // If no MIDI input devices are found, log a message to the console.
    console.log("No MIDI input devices found.");
  }
}

// This function handles incoming MIDI messages, including key presses and control knob changes.

function handleMIDIMessage(event) {
  // Extract the MIDI status, note, and velocity from the MIDI event data and log them.
  const [status, note, velocity] = event.data;
  console.log(status, note, velocity);

  // Check if the MIDI message corresponds to a key press event.
  if (status === 144 && note >= 48 && note < 48 + 25) {
    // Calculate the key index and set a fixed key velocity.
    const keyIndex = note - 48;
    const keyVelocity = 127.0;

    // Create a custom MIDI key pressed event and dispatch it with key information.
    const midiEvent = new CustomEvent("midiKeyPressed", {
      detail: { keyIndex, keyVelocity },
    });
    document.dispatchEvent(midiEvent);
  } else if (status === 176) {
    // If the MIDI message corresponds to a control knob change, call the 'handleKnobChange' function.
    handleKnobChange(note, event.data[2]);
  } else if ((status == 144) & (note == 44)) {
    // If the MIDI message corresponds to a button press event (e.g., record button),
    // create a custom event and dispatch it to handle the recording process.
    const recIndex = true;
    const midiEvent = new CustomEvent("recordPressed", {
      detail: { recIndex },
    });
    document.dispatchEvent(midiEvent);
  } else if ((status == 144) & (note == 45)) {
    // If the MIDI message corresponds to a button press event (e.g., reset button),
    // create a custom event and dispatch it to handle the reset process.
    const resetIndex = true;
    const midiEvent = new CustomEvent("resetPressed", {
      detail: { resetIndex },
    });
    document.dispatchEvent(midiEvent);
  }
}

// This function handles changes in control knob values and dispatches corresponding events.

function handleKnobChange(note, knobValue) {
  // Use a switch statement to determine which control knob was changed (based on the 'note' parameter).
  switch (note) {
    case 1:
      // For control knob 1, dispatch 'g1' and 'g1' rotation events with the knob value.
      dispatchKnobEvent("g1", knobValue);
      dispatchRotationEvent("g1", knobValue);
      break;
    case 2:
      // For control knob 2, dispatch 'g2' and 'g2' rotation events with the knob value.
      dispatchKnobEvent("g2", knobValue);
      dispatchRotationEvent("g2", knobValue);
      break;
    case 3:
      // For control knob 3, dispatch 'g3' and 'g3' rotation events with the knob value.
      dispatchKnobEvent("g3", knobValue);
      dispatchRotationEvent("g3", knobValue);
      break;
    case 4:
      // For control knob 4, dispatch 'g4' and 'g4' rotation events with the knob value.
      dispatchKnobEvent("g4", knobValue);
      dispatchRotationEvent("g4", knobValue);
      break;
    case 5:
      // For control knob 5, dispatch 'a1' and 'a1' rotation events with the knob value.
      dispatchKnobEvent("a1", knobValue);
      dispatchRotationEvent("a1", knobValue);
      break;
    case 6:
      // For control knob 6, dispatch 'a2' and 'a2' rotation events with the knob value.
      dispatchKnobEvent("a2", knobValue);
      dispatchRotationEvent("a2", knobValue);
      break;
    case 7:
      // For control knob 7, dispatch 'a3' and 'a3' rotation events with the knob value.
      dispatchKnobEvent("a3", knobValue);
      dispatchRotationEvent("a3", knobValue);
      break;
    case 8:
      // For control knob 8, dispatch 'a4' and 'a4' rotation events with the knob value.
      dispatchKnobEvent("a4", knobValue);
      dispatchRotationEvent("a4", knobValue);
      break;
  }
}

// This function dispatches custom events for control knob changes.

function dispatchKnobEvent(eventName, knobValue) {
  // Create a custom event with the provided event name and knob value as event detail.
  const knobEvent = new CustomEvent(eventName, { detail: { knobValue } });

  // Dispatch the custom event to notify the application of the control knob change.
  document.dispatchEvent(knobEvent);
}

// This function sets the initial positions of control knobs for visual representation.

function dispatchInitialKnobPosition() {
  // Set the initial rotation of control knob elements to a specific angle (-150 degrees).
  document.getElementById("g1").style.transform = `rotate(${-150}deg)`;
  document.getElementById("g2").style.transform = `rotate(${-150}deg)`;
  document.getElementById("g3").style.transform = `rotate(${-150}deg)`;
  document.getElementById("g4").style.transform = `rotate(${-150}deg)`;
  document.getElementById("a1").style.transform = `rotate(${-150}deg)`;
  document.getElementById("a2").style.transform = `rotate(${-150}deg)`;
  document.getElementById("a3").style.transform = `rotate(${-150}deg)`;
  document.getElementById("a4").style.transform = `rotate(${-150}deg)`;
}

// This function dispatches custom events for updating the visual rotation of control knob elements.

function dispatchRotationEvent(elementId, knobValue) {
  // Calculate the rotation angle based on the knob value using the 'map' function.
  const rotationAngle = map(knobValue, 0, 127, -150, 150);

  // Update the visual rotation of the specified control knob element.
  document.getElementById(
    elementId
  ).style.transform = `rotate(${rotationAngle}deg)`;
}
