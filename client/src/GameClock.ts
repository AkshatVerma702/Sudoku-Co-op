export default class GameClock{
    targetTime: number;
    private intervalId: ReturnType<typeof setInterval> | null;
    currentTime: number;

    // time
    // CurrentTime
    constructor(targetTime: number){
        this.targetTime = targetTime;
        this.intervalId = null;
        this.currentTime = 0;
    }

    startClock(): void{
        if(this.intervalId){
            return;
        }

        this.intervalId = setInterval(() => {
            this.currentTime += 1;
            this.updateTimeDisplay();

            if(this.currentTime ==  this.targetTime){
                this.stopClock();
            }

        }, 1000);
    }

    stopClock(): void{
        if(this.intervalId){
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resetClock(): void{
        this.stopClock();
        this.currentTime = 0;
        this.updateTimeDisplay();
    }

    getCurrentTime(): number{
        return this.currentTime;
    }

    private updateTimeDisplay(): void {
        const clock = document.getElementById("clock");

        if (clock) {
            let minutes = "00";
            let seconds = "00";

            if (this.currentTime >= 0) {
                if (this.currentTime < 60) {
                    minutes = "00";
                    seconds = Math.floor(this.currentTime).toString().padStart(2, '0');
                } else {
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