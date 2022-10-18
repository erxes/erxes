class SimpleTimer {
    /**
     * Creates an instance of Timer.
     *
     * @constructor
     * @author: Zaim Ramlan
     * @param {number} duration The duration (in seconds) that the timer should countdown to.
     * @param {string} timerContainer The class name of the timer's container.
     * @param {string} originalText The original text to be put back into the timer's container,
     * once the timer completes.
     */
    constructor(duration, timerContainer, originalText) {
        this.functionsToExecuteAtTimerEnd = function() {};
        this._everySecond = 1000;
        this._duration = duration;
        this._timeLeft = duration;
        this._timerContainer = timerContainer;
        this._originalText = originalText;
    }

    /**
     * Starts the timer.
     */
    startTimer() {
        this._timerFunction = setInterval(this._updateTimerDisplay.bind(this), this._everySecond);
    }

    /**
     * Force ends the timer and resets its container to their original state.
     */
    endTimer() {
        clearInterval(this._timerFunction);
        this._timeLeft = this._duration;
        this._changeContainerText(this._timerContainer, this._originalText);
        this.functionsToExecuteAtTimerEnd();
    }

    /**
     * Updates the timer display to the timer countdown, or the original text.
     */
    _updateTimerDisplay() {
        this._changeContainerText(this._timerContainer, this._formatTimer(--this._timeLeft));

        var isTimerCompleted = this._timeLeft == 0;
        if (isTimerCompleted) {
            this.endTimer();
        }
    }

    /**
     * Updates the container text with the timer countdown.
     *
     * @param {string} container The class name of the container.
     * @param {string} text The text to replace the one inside the container.
     */
    _changeContainerText(container, text) {
        var container = document.getElementsByClassName(container)[0];
        container.innerHTML = text;
    }

    /**
     * Formats time in MM:SS format, given the time in seconds
     *
     * @param {number} secondsInput The number of seconds remaining.
     * @return {string} The text formatted to represent timer countdown.
     */
    _formatTimer(secondsInput) {
        var minutes = Math.floor(secondsInput / 60);
        var seconds = secondsInput % 60;
        var formattedTimer = (minutes < 10 ? "0" : "" ) + minutes + ":" + (seconds < 10 ? "0" : "" ) + seconds;
        return formattedTimer;
    }
}
