// frontend/app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Global DOM Element References ---
    const navLinks = document.querySelectorAll('nav ul li a');
    const pages = document.querySelectorAll('.page');
    const ctaButton = document.querySelector('.cta');
    const methodCards = document.querySelectorAll('.method-card');
    const userIcon = document.getElementById('userIcon');

    // ML Detection Elements
    const mlImageInput = document.getElementById('mlImageInput');
    const mlUploadArea = document.getElementById('mlUploadArea');
    const mlStartBtn = document.getElementById('mlStartBtn');
    const mlTerminateBtn = document.getElementById('mlTerminateBtn');
    const mlTimerDisplay = document.getElementById('mlTimer');
    const mlResultDiv = document.getElementById('mlResult');
    const mlAccuracySpan = document.getElementById('mlAccuracy');
    const mlTimingSpan = document.getElementById('mlTiming');
    const mlTumorTypeSpan = document.getElementById('mlTumorType');
    const mlReportBtn = document.getElementById('mlReportBtn');

    // Quantum ML Detection Elements
    const qmlImageInput = document.getElementById('qmlImageInput');
    const qmlUploadArea = document.getElementById('qmlUploadArea');
    const qmlStartBtn = document.getElementById('qmlStartBtn');
    const qmlTerminateBtn = document.getElementById('qmlTerminateBtn');
    const qmlTimerDisplay = document.getElementById('qmlTimer');
    const qmlResultDiv = document.getElementById('qmlResult');
    const qmlAccuracySpan = document.getElementById('qmlAccuracy');
    const qmlTimingSpan = document.getElementById('qmlTiming');
    const qmlTumorTypeSpan = document.getElementById('qmlTumorType');
    // FIX: Corrected typo from document('qmlReportBtn') to document.getElementById('qmlReportBtn')
    const qmlReportBtn = document.getElementById('qmlReportBtn');

    // Report elements (for generating general report)
    const reportUserName = document.getElementById('reportUserName');
    const reportUserEmail = document.getElementById('reportUserEmail');
    const reportUserUsername = document.getElementById('reportUserUsername');
    const reportTumorType = document.getElementById('reportTumorType');
    const reportAccuracy = document.getElementById('reportAccuracy');
    const printBtn = document.getElementById('printBtn');


    // --- Backend API Configuration ---
    const BACKEND_BASE_URL = 'http://127.0.0.1:5005'; // Your Flask app URL and port

    // --- Timers and Abort Controllers ---
    let currentMlProcessingInterval = null; // Initialize to null
    let mlStartTime = null; // Initialize to null
    let currentMlFetchController = null; // Initialize to null

    let currentQmlProcessingInterval = null; // Initialize to null
    let qmlStartTime = null; // Initialize to null
    let currentQmlFetchController = null; // Initialize to null

    // --- Helper Function for Page Navigation ---
    const showPage = (pageId) => {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        const activeNavLink = document.querySelector(`nav ul li a[data-page="${pageId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }

        // Update user info on report page if available (assuming localStorage is populated by forms.js/portal.js)
        if (pageId === 'report') {
            const username = localStorage.getItem('currentUsername') || 'Guest';
            const email = localStorage.getItem('currentUserEmail') || 'N/A';
            const fullName = localStorage.getItem('currentUserFullName') || 'N/A';

            if (reportUserName) reportUserName.textContent = fullName;
            if (reportUserEmail) reportUserEmail.textContent = email;
            if (reportUserUsername) reportUserUsername.textContent = username;

            const lastReport = JSON.parse(localStorage.getItem('lastReport'));
            if (lastReport) {
                if (reportTumorType) reportTumorType.textContent = lastReport.tumorType;
                if (reportAccuracy) reportAccuracy.textContent = lastReport.accuracy;
            }
        }
    };

    // --- Universal Event Listeners for Navigation ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // FIX: Prevent default link behavior to stop '#' in URL
            showPage(e.target.dataset.page);
        });
    });

    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault(); // FIX: Prevent default link behavior
            showPage(e.target.dataset.page);
        });
    }

    methodCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault(); // FIX: Prevent default link behavior
            showPage(card.dataset.page);
        });
    });

    if (userIcon) {
        userIcon.addEventListener('click', () => {
            // FIX: If userIcon is an anchor, also prevent default
            // If it's just an icon triggering JS, e.preventDefault() isn't needed here
            // but ensure the element type is suitable if it's not a button or div.
            showPage('auth-choice'); // Navigate to auth choice page
        });
    }

    // --- Generic File Input Change Handler ---
    const handleFileInputChange = (inputElement, uploadAreaElement, startButton) => {
        const file = inputElement.files[0];
        if (file) {
            // Display filename
            uploadAreaElement.innerHTML = `<span>${file.name}</span>`;
            // Or display image preview if you want (uncomment and adjust CSS)
            // const reader = new FileReader();
            // reader.onload = (e) => {
            //     uploadAreaElement.innerHTML = `<img src="${e.target.result}" alt="Uploaded MRI" class="uploaded-image">`;
            //     uploadAreaElement.style.border = 'none';
            //     uploadAreaElement.style.padding = '1rem';
            // };
            // reader.readAsDataURL(file);

            startButton.disabled = false; // Enable start button
        } else {
            // Reset upload area text
            uploadAreaElement.innerHTML = `<span>Upload MRI Image for ${inputElement.id.includes('ml') ? 'ML' : 'Quantum ML'} Detection</span>`;
            startButton.disabled = true; // Disable start button
        }
        // Reset results and timer when new file is selected
        // Ensure elements exist before trying to access properties
        const resultElement = document.getElementById(`${inputElement.id.includes('ml') ? 'ml' : 'qml'}Result`);
        const timerElement = document.getElementById(`${inputElement.id.includes('ml') ? 'ml' : 'qml'}Timer`);

        if (resultElement) resultElement.style.display = 'none';
        if (timerElement) timerElement.style.display = 'none';
    };


    // --- Generic Detection Function for ML and QML ---
    const startDetection = async (
        imageInput, startBtn, terminateBtn, timerDisplay, resultDiv,
        accuracySpan, timingSpan, tumorTypeSpan, endpoint, isQML = false
    ) => {
        const file = imageInput.files[0];
        if (!file) {
            alert(`Please select an MRI image to upload for ${isQML ? 'Quantum ML' : 'ML'} detection.`);
            return;
        }

        // --- UI State: Processing ---
        startBtn.style.display = 'none';
        terminateBtn.style.display = 'block';
        startBtn.disabled = true; // Keep disabled while processing

        resultDiv.style.display = 'none'; // Hide previous results
        timerDisplay.textContent = 'Processing...';
        timerDisplay.style.display = 'block';
        timerDisplay.style.color = 'inherit';

        let currentInterval;
        let startTime = Date.now();
        currentInterval = setInterval(() => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            timerDisplay.textContent = `Processing: ${elapsedTime.toFixed(1)}s`;
        }, 100);

        // Set the correct AbortController
        const controller = new AbortController();
        if (isQML) {
            currentQmlFetchController = controller;
            currentQmlProcessingInterval = currentInterval; // Store interval for termination
        } else {
            currentMlFetchController = controller;
            currentMlProcessingInterval = currentInterval; // Store interval for termination
        }
        const signal = controller.signal;

        const formData = new FormData();
        formData.append('image', file);

        try {
            // --- Fetch Request to Backend ---
            const response = await fetch(`${BACKEND_BASE_URL}/${endpoint}`, {
                method: 'POST',
                body: formData,
                signal: signal
            });

            clearInterval(currentInterval); // Stop timer immediately on response

            const data = await response.json();

            // --- UI State: Result ---
            timerDisplay.style.display = 'none'; // Hide timer
            terminateBtn.style.display = 'none'; // Hide terminate
            startBtn.style.display = 'inline-block'; // Show start button
            startBtn.disabled = false; // Enable start button

            if (response.ok) {
                tumorTypeSpan.textContent = data.predicted_label;
                timingSpan.textContent = `${data.timing}s`; // Total request timing from backend

                let confidence = 'N/A';
                if (typeof data.confidence === 'number') { // Backend already calculates and provides confidence
                     confidence = `${data.confidence.toFixed(2)}%`;
                } else if (isQML && typeof data.raw_qml_output === 'number') {
                    // Fallback for QML if 'confidence' field isn't explicitly sent
                    confidence = `${((data.raw_qml_output + 1) / 2 * 100).toFixed(2)}%`;
                }

                accuracySpan.textContent = confidence;

                resultDiv.style.display = 'block';

                // Store for report generation
                localStorage.setItem('lastReport', JSON.stringify({
                    tumorType: data.predicted_label,
                    accuracy: confidence, // Use the formatted accuracy
                    method: isQML ? 'Quantum ML Detection' : 'Machine Learning Detection'
                }));

            } else {
                alert(`${isQML ? 'Quantum ML' : 'ML'} Detection failed: ${data.error || 'Unknown error'}`);
                timerDisplay.textContent = 'Detection Failed';
                timerDisplay.style.color = 'red';
                timerDisplay.style.display = 'block'; // Show error message
                resultDiv.style.display = 'none';
            }
        } catch (error) {
            // --- UI State: Error/Aborted ---
            clearInterval(currentInterval); // Stop timer on error
            timerDisplay.style.display = 'block'; // Show timer/error message
            terminateBtn.style.display = 'none';
            startBtn.style.display = 'inline-block';
            startBtn.disabled = false;

            if (error.name === 'AbortError') {
                console.log(`${isQML ? 'Quantum ML' : 'ML'} Detection aborted by user.`);
                timerDisplay.textContent = 'Aborted.';
                timerDisplay.style.color = 'orange';
            } else {
                console.error(`Error during ${isQML ? 'Quantum ML' : 'ML'} detection:`, error);
                alert(`Failed to connect to ${isQML ? 'Quantum ML' : 'ML'} detection backend or a network error occurred. Please check server and console.`);
                timerDisplay.textContent = 'Failed!';
                timerDisplay.style.color = 'red';
            }
            resultDiv.style.display = 'none';
        } finally {
            // Ensure controller and interval are reset
            if (isQML) {
                currentQmlFetchController = null;
                currentQmlProcessingInterval = null;
            } else {
                currentMlFetchController = null;
                currentMlProcessingInterval = null;
            }
        }
    };

    // --- Generic Terminate Function ---
    const terminateDetection = (timerDisplay, startBtn, terminateBtn, isQML = false) => {
        let controllerToAbort;
        let intervalToClear;

        if (isQML) {
            controllerToAbort = currentQmlFetchController;
            intervalToClear = currentQmlProcessingInterval;
            // No need to clear currentQmlFetchController/Interval here, it's done in finally block of startDetection
            // or if a new detection starts. This function just *uses* the current ones.
        } else {
            controllerToAbort = currentMlFetchController;
            intervalToClear = currentMlProcessingInterval;
            // No need to clear currentMlFetchController/Interval here.
        }

        if (controllerToAbort) {
            controllerToAbort.abort(); // Abort the ongoing fetch
        }
        if (intervalToClear) {
            clearInterval(intervalToClear); // Stop the timer
        }

        timerDisplay.textContent = 'Detection Terminated';
        timerDisplay.style.color = 'orange';
        timerDisplay.style.display = 'block'; // Keep message visible

        startBtn.style.display = 'inline-block';
        terminateBtn.style.display = 'none';
        startBtn.disabled = false;

        // Ensure elements exist before trying to access properties
        const resultElement = document.getElementById(`${isQML ? 'qml' : 'ml'}Result`);
        if (resultElement) resultElement.style.display = 'none'; // Hide results on terminate
        
        console.log(`${isQML ? 'Quantum ML' : 'ML'} Detection process terminated.`);
    };

    // --- ML Detection Event Listeners ---
    if (mlImageInput && mlUploadArea && mlStartBtn && mlTerminateBtn) {
        mlImageInput.addEventListener('change', () => handleFileInputChange(mlImageInput, mlUploadArea, mlStartBtn));
        mlUploadArea.addEventListener('click', () => mlImageInput.click()); // Make upload area clickable
        mlStartBtn.addEventListener('click', () => startDetection(
            mlImageInput, mlStartBtn, mlTerminateBtn, mlTimerDisplay, mlResultDiv,
            mlAccuracySpan, mlTimingSpan, mlTumorTypeSpan, 'predict_classical', false // Not QML
        ));
        mlTerminateBtn.addEventListener('click', () => terminateDetection(mlTimerDisplay, mlStartBtn, mlTerminateBtn, false));
        mlStartBtn.disabled = true; // Disable initially
    }

    if (mlReportBtn) {
        mlReportBtn.addEventListener('click', () => {
            showPage('report');
            // Data for report is set in localStorage within startDetection
        });
    }

    // --- Quantum ML Detection Event Listeners ---
    if (qmlImageInput && qmlUploadArea && qmlStartBtn && qmlTerminateBtn) {
        qmlImageInput.addEventListener('change', () => handleFileInputChange(qmlImageInput, qmlUploadArea, qmlStartBtn));
        qmlUploadArea.addEventListener('click', () => qmlImageInput.click()); // Make upload area clickable
        qmlStartBtn.addEventListener('click', () => startDetection(
            qmlImageInput, qmlStartBtn, qmlTerminateBtn, qmlTimerDisplay, qmlResultDiv,
            qmlAccuracySpan, qmlTimingSpan, qmlTumorTypeSpan, 'predict_quantum', true // Is QML
        ));
        qmlTerminateBtn.addEventListener('click', () => terminateDetection(qmlTimerDisplay, qmlStartBtn, qmlTerminateBtn, true));
        qmlStartBtn.disabled = true; // Disable initially
    }

    if (qmlReportBtn) {
        qmlReportBtn.addEventListener('click', () => {
            showPage('report');
            // Data for report is set in localStorage within startDetection
        });
    }

    // --- Report Page Print Button ---
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // --- Initial Page Load ---
    showPage('home'); // Set initial page
});