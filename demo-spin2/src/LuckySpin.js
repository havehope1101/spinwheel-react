import React, { useState, useEffect } from 'react';
import * as winwheel from '@evshiron/winwheel.js';


import './main.css'; // Import your CSS file
import spinOffImage from './spin_off.png';
import spinOnImage from './spin_on.png';

const LuckySpin = () => {
    const [timeRemainingVisible, setTimeRemainingVisible] = useState(true);
    const [wheel, setWheel] = useState(null);
    const [wheelPower, setWheelPower] = useState(0);
    const [wheelSpinning, setWheelSpinning] = useState(false);
    const [lastSpinTime, setLastSpinTime] = useState(null);

    const theWheel = new winwheel.Winwheel({
        'numSegments': 8,
        'outerRadius': 212,
        'textFontSize': 28,
        'segments': [
            { 'fillStyle': '#eae56f', 'text': 'Prize 1' },
            { 'fillStyle': '#89f26e', 'text': 'Prize 2' },
            { 'fillStyle': '#7de6ef', 'text': 'Prize 3' },
            { 'fillStyle': '#e7706f', 'text': 'Prize 4' },
            { 'fillStyle': '#eae56f', 'text': 'Prize 5' },
            { 'fillStyle': '#89f26e', 'text': 'Prize 6' },
            { 'fillStyle': '#7de6ef', 'text': 'Prize 7' },
            { 'fillStyle': '#e7706f', 'text': 'Prize 8' }
        ],
        'animation': {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 8,
            'callbackFinished': alertPrize
        }
    });

    useEffect(() => {
        setWheel(theWheel);
        updateRemainingTime(); // Initial update

        return () => {
            // Cleanup or remove event listeners if needed
        };
    }, []);


    const canSpinToday = () => {
        var lastSpinTime = localStorage.getItem('lastSpinTime');
        if (!lastSpinTime) return true; // No last spin time, allow spin
        var oneDayInMillis =  10 * 1000;
        var currentTime = new Date().getTime();
        var lastSpinDate = new Date(parseInt(lastSpinTime));
        var timeSinceLastSpin = currentTime - lastSpinDate.getTime();

        if (timeSinceLastSpin >= oneDayInMillis) {
            localStorage.removeItem('lastSpinTime');
            return true; // Allow spin
        }

        return false;

    };

    const updateRemainingTime = () => {
        var lastSpinTime = localStorage.getItem('lastSpinTime');
        var timeRemainingElement = document.getElementById('time_remaining');

        if (!lastSpinTime || canSpinToday()) {
            timeRemainingElement.style.display = "none";
            return;
        }

        var oneDayInMillis =  10 * 1000;
        var currentTime = new Date().getTime();
        var lastSpinDate = new Date(parseInt(lastSpinTime));
        var timeSinceLastSpin = currentTime - lastSpinDate.getTime();

        var remainingTime = oneDayInMillis - timeSinceLastSpin;

        if (remainingTime > 0) {
            var remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
            var remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
            var remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

            timeRemainingElement.innerHTML = "Next spin in: " + remainingHours + "h " + remainingMinutes + "m " + remainingSeconds + "s";
            timeRemainingElement.style.display = "block";
        } else {
            timeRemainingElement.style.display = "none";
        }
    };

    const trySpin = () => {
        if (canSpinToday()) {
            startSpin();
            localStorage.setItem('lastSpinTime', new Date().getTime());
            updateRemainingTime();
        } else {
            alert("You can spin only once per day!");
        }
    };

    const calculatePrize = () => {
        const angleRanges = [
            { start: 0, end: 90, ratio: 0.95 },
            { start: 90, end: 180, ratio: 0.03 },
            { start: 180, end: 270, ratio: 0.02 },
            { start: 270, end: 360, ratio: 0 }
        ];

        let randomValue = Math.random();
        let stopAt;

        for (const range of angleRanges) {
            if (randomValue < range.ratio) {
                stopAt = Math.random() * (range.end - range.start) + range.start;
                break;
            } else {
                randomValue -= range.ratio;
            }
        }

        theWheel.animation.stopAngle = stopAt;
        theWheel.startAnimation();
    };

    const powerSelected = (powerLevel) => {
        if (wheelSpinning == false) {
            document.getElementById('pw1').className = "";
            document.getElementById('pw2').className = "";
            document.getElementById('pw3').className = "";

            if (powerLevel >= 1) {
                document.getElementById('pw1').className = "pw1";
            }

            if (powerLevel >= 2) {
                document.getElementById('pw2').className = "pw2";
            }

            if (powerLevel >= 3) {
                document.getElementById('pw3').className = "pw3";
            }
            setWheelPower(powerLevel)

            document.getElementById('spin_button').src = "spin_on.png";
            document.getElementById('spin_button').className = "clickable";
        }
    };

    const startSpin = () => {
        if (wheelSpinning == false) {
            if (wheelPower == 1) {
                theWheel.animation.spins = 3;
            }
            else if (wheelPower == 2) {
                theWheel.animation.spins = 8;
            }
            else if (wheelPower == 3) {
                theWheel.animation.spins = 15;
            }

            document.getElementById('spin_button').src       = "spin_off.png";
            document.getElementById('spin_button').className = "";

            calculatePrize();
            theWheel.startAnimation();
            setWheelSpinning(true)
        }
    };

    const resetWheel = () => {
        theWheel.stopAnimation(false);
        theWheel.rotationAngle = 0;
        theWheel.draw();
        setWheelSpinning(false)    };

    function alertPrize(indicatedSegment) {
        alert("Bạn kiếm được " + indicatedSegment.text);
        resetWheel();
    }

    return (
        <div align="center">
            <h1 style={{ color: '#ef6f6f' }}>Vòng quay may mắn</h1>
            <p>Mỗi ngày bạn sẽ có một lượt quay để kiếm về điểm thưởng.</p>

            <table cellPadding="0" cellSpacing="0" border="0">
                <tbody>
                <tr>
                    <td>
                        <div className="power_controls">
                            <img
                                id="spin_button"
                                src={spinOffImage}
                                alt="Spin"
                                onClick={trySpin}
                            />
                            <br />
                            <br />
                            <div
                                id="time_remaining"
                                style={{ display: timeRemainingVisible ? setTimeRemainingVisible('block') : setTimeRemainingVisible('none') }}
                            ></div>
                        </div>
                    </td>
                    <td
                        width="438"
                        height="582"
                        className="the_wheel"
                        align="center"
                        valign="center"
                    >
                        <canvas id="canvas" width="434" height="434">
                            <p style={{ color: 'white' }} align="center">
                                Sorry, your browser doesn't support canvas. Please try another.
                            </p>
                        </canvas>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default LuckySpin;
