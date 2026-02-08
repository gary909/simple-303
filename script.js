const ctx = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let currentStep = 0;
const totalSteps = 16;
const tempo = 120; // BPM

// Create UI Steps
const stepContainer = document.getElementById('steps');
const stepDivs = [];
for (let i = 0; i < totalSteps; i++) {
    const div = document.createElement('div');
    div.className = 'step';
    stepContainer.appendChild(div);
    stepDivs.push(div);
}

function playAcidStep(time, freq) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();

    // 1. Setup Oscillator (The TB-303 Sawtooth)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // 2. Setup Filter (The Squelch)
    const userCutoff = document.getElementById('cutoff').value;
    filter.type = 'lowpass';
    filter.Q.value = 15; // High resonance
    filter.frequency.setValueAtTime(userCutoff, time);
    // Envelope: The filter "snaps" shut
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.1);

    // 3. Setup Amp (The Pluck)
    amp.gain.setValueAtTime(0.5, time);
    amp.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    // 4. Connect and Start
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
}

// Simple Step Sequencer Clock
function sequence() {
    if (!isPlaying) return;

    const secondsPerBeat = 60.0 / tempo;
    const stepTime = secondsPerBeat / 4; // 16th notes

    // Musical Pattern (C1, C1, C2, C1...)
    const pattern = [65.4, 65.4, 130.8, 65.4, 0, 98.0, 65.4, 0];
    const freq = pattern[currentStep % pattern.length];

    if (freq > 0) {
        playAcidStep(ctx.currentTime, freq);
    }

    // Update UI
    stepDivs.forEach(d => d.classList.remove('active'));
    stepDivs[currentStep].classList.add('active');

    currentStep = (currentStep + 1) % totalSteps;
    setTimeout(sequence, stepTime * 1000);
}

document.getElementById('power').addEventListener('click', () => {
    if (ctx.state === 'suspended') ctx.resume();
    isPlaying = !isPlaying;
    if (isPlaying) sequence();
});