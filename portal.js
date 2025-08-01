document.addEventListener('DOMContentLoaded', () => {
    const initializeDetectionPage = (prefix) => {
        const uploadArea = document.getElementById(`${prefix}UploadArea`);
        const imageInput = document.getElementById(`${prefix}ImageInput`);
        const startBtn = document.getElementById(`${prefix}StartBtn`);
        const terminateBtn = document.getElementById(`${prefix}TerminateBtn`);
        const timerDisplay = document.getElementById(`${prefix}Timer`);
        const resultSection = document.getElementById(`${prefix}Result`);
        const accuracySpan = document.getElementById(`${prefix}Accuracy`);
        const timingSpan = document.getElementById(`${prefix}Timing`);
        const tumorTypeSpan = document.getElementById(`${prefix}TumorType`);
        const reportBtn = document.getElementById(`${prefix}ReportBtn`);

        let detectionInterval;
        let detectionTime = 0;
        let uploadedImage = null;

        // Backend URL for QML (***IMPORTANT: Adjust this to your actual QML backend endpoint***)
        const QML_BACKEND_URL = 'http://127.0.0.1:5005/predict_quantum'; // Updated to match backend route

        if (!uploadArea || !imageInput || !startBtn || !terminateBtn || !timerDisplay || !resultSection || !accuracySpan || !timingSpan || !tumorTypeSpan || !reportBtn) {
            return;
        }

        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                uploadedImage = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadArea.innerHTML = `<img src="${e.target.result}" alt="Uploaded MRI" class="uploaded-image">`;
                    uploadArea.style.border = 'none';
                    uploadArea.style.padding = '1rem';
                };
                reader.readAsDataURL(file);
                startBtn.style.display = 'inline-block';
                terminateBtn.style.display = 'none';
                resultSection.style.display = 'none';
                timerDisplay.textContent = '';
                detectionTime = 0;
            } else {
                uploadedImage = null;
                uploadArea.innerHTML = `<span>Upload MRI Image</span>`;
                uploadArea.style.border = '3px dashed var(--border-color)';
                uploadArea.style.padding = '3rem';
                startBtn.style.display = 'none';
                terminateBtn.style.display = 'none';
            }
        });

        startBtn.addEventListener('click', async () => { // Made async for fetch
            if (!uploadedImage) {
                alert('Please upload an MRI image first.');
                return;
            }

            startBtn.style.display = 'none';
            terminateBtn.style.display = 'inline-block';
            resultSection.style.display = 'none';
            timerDisplay.textContent = 'Detecting... 0s';
            detectionTime = 0;

            // Clear any previous timer if it exists (important for robustness)
            if (detectionInterval) {
                clearInterval(detectionInterval);
            }

            detectionInterval = setInterval(() => {
                detectionTime++;
                timerDisplay.textContent = `Detecting... ${detectionTime}s`;
            }, 1000);

            // --- QML Backend Integration Starts Here ---
            if (prefix === 'qml') { // Only for Quantum ML Detection
                const formData = new FormData();
                formData.append('image', uploadedImage);

                try {
                    const response = await fetch(QML_BACKEND_URL, {
                        method: 'POST',
                        body: formData,
                    });

                    clearInterval(detectionInterval); // Stop timer on response
                    timerDisplay.textContent = ''; // Clear timer text

                    const data = await response.json();

                    if (response.ok) {
                        accuracySpan.textContent = `${data.accuracy.toFixed(2)}%`; // Assuming backend sends a float
                        timingSpan.textContent = data.timing; // Assuming backend sends formatted string like "0.12s"
                        tumorTypeSpan.textContent = data.tumorType; // Assuming backend sends "Tumor Detected" or "No Tumor"
                        resultSection.style.display = 'block';

                        localStorage.setItem('lastTumorType', data.tumorType);
                        localStorage.setItem('lastAccuracy', `${data.accuracy.toFixed(2)}%`);
                        localStorage.setItem('lastDetectionMethod', 'Quantum ML'); // Store the method
                    } else {
                        alert(`Quantum ML Detection failed: ${data.error || 'Unknown error'}`);
                        timerDisplay.textContent = 'Detection Failed';
                    }
                } catch (error) {
                    console.error('Error during Quantum ML detection:', error);
                    clearInterval(detectionInterval);
                    timerDisplay.textContent = 'Network Error';
                    alert('An error occurred during Quantum ML detection. Please ensure the backend is running and reachable.');
                } finally {
                    startBtn.style.display = 'inline-block';
                    terminateBtn.style.display = 'none';
                }
            }
            // --- ML Backend Simulation (or actual ML backend call if you connect it) ---
            else if (prefix === 'ml') { // For ML Detection, keep the simulation or integrate your ML backend
                // This remains your existing simulated ML logic
                setTimeout(() => {
                    clearInterval(detectionInterval);
                    timerDisplay.textContent = '';

                    const accuracy = (Math.random() * (99.9 - 90) + 90).toFixed(2);
                    const timing = detectionTime;
                    const tumorTypes = ['Glioma Tumor', 'Meningioma Tumor', 'Pituitary Tumor', 'No Tumor Detected'];
                    const tumorType = tumorTypes[Math.floor(Math.random() * tumorTypes.length)];

                    accuracySpan.textContent = `${accuracy}%`;
                    timingSpan.textContent = `${timing}s`;
                    tumorTypeSpan.textContent = tumorType;
                    resultSection.style.display = 'block';

                    startBtn.style.display = 'inline-block';
                    terminateBtn.style.display = 'none';

                    localStorage.setItem('lastTumorType', tumorType);
                    localStorage.setItem('lastAccuracy', `${accuracy}%`);
                    localStorage.setItem('lastDetectionMethod', 'Machine Learning'); // Store the method

                }, 5000); // Simulate 5-second detection
            }
            // --- End of Detection Logic ---
        });

        terminateBtn.addEventListener('click', () => {
            clearInterval(detectionInterval);
            timerDisplay.textContent = 'Detection Terminated.';
            startBtn.style.display = 'inline-block';
            terminateBtn.style.display = 'none';
            resultSection.style.display = 'none'; // Hide results if terminated
            alert('Detection process terminated.');
        });

        reportBtn.addEventListener('click', () => {
            const reportPage = document.getElementById('report');
            const reportUserName = document.getElementById('reportUserName');
            const reportUserEmail = document.getElementById('reportUserEmail');
            const reportUserUsername = document.getElementById('reportUserUsername');
            const reportTumorType = document.getElementById('reportTumorType');
            const reportAccuracy = document.getElementById('reportAccuracy');

            reportUserName.textContent = localStorage.getItem('currentUserFullName') || 'Guest';
            reportUserEmail.textContent = localStorage.getItem('currentUserEmail') || 'N/A';
            reportUserUsername.textContent = localStorage.getItem('currentUsername') || 'N/A';
            reportTumorType.textContent = localStorage.getItem('lastTumorType') || 'None';
            reportAccuracy.textContent = localStorage.getItem('lastAccuracy') || '0%';

            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            reportPage.classList.add('active');

            document.querySelectorAll('nav ul li a').forEach(link => {
                link.classList.remove('active');
            });
        });
    };

    // Initialize both ML and QML detection pages
    initializeDetectionPage('ml'); // Initialize ML detection with its current behavior
    initializeDetectionPage('qml'); // Initialize QML detection with the new backend call

    // Print button logic
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
});