export default class GameClock {
    targetTime;
    intervalId;
    currentTime;
    // time
    // CurrentTime
    constructor(targetTime) {
        this.targetTime = targetTime;
        this.intervalId = null;
        this.currentTime = 0;
    }
    startClock() {
        if (this.intervalId) {
            return;
        }
        this.intervalId = setInterval(() => {
            this.currentTime += 1;
            this.updateTimeDisplay();
            if (this.currentTime == this.targetTime) {
                this.stopClock();
            }
        }, 1000);
    }
    stopClock() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    resetClock() {
        this.stopClock();
        this.currentTime = 0;
        this.updateTimeDisplay();
    }
    getCurrentTime() {
        return this.currentTime;
    }
    updateTimeDisplay() {
        const clock = document.getElementById("clock");
        if (clock) {
            let minutes = "00";
            let seconds = "00";
            if (this.currentTime >= 0) {
                if (this.currentTime < 60) {
                    minutes = "00";
                    seconds = Math.floor(this.currentTime).toString().padStart(2, '0');
                }
                else {
                    minutes = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
                    seconds = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
                }
            }
            if (this.currentTime < 0) {
                minutes = "00";
                seconds = "00";
            }
            clock.innerHTML = `<span id="time">${minutes}:${seconds}</span>`;
        }
    }
}
