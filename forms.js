document.addEventListener('DOMContentLoaded', () => {
    // --- Existing Contact Form Logic ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;

            console.log('Contact Form Submitted:');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Message:', message);

            alert('Thank you for your message! We will get back to you shortly.');
            contactForm.reset();
        });
    }

    // --- Existing Feedback Logic ---
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackTextarea = document.getElementById('feedbackText');

    if (feedbackBtn && feedbackTextarea) {
        feedbackBtn.addEventListener('click', () => {
            const feedback = feedbackTextarea.value.trim();

            if (feedback === '') {
                alert('Please enter your feedback before submitting.');
                return;
            }

            console.log('Developer Feedback Submitted:');
            console.log('Feedback:', feedback);

            alert('Thank you for your valuable feedback!');
            feedbackTextarea.value = '';
        });
    }

    // --- Existing Login Form Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const usernameEmail = loginForm.querySelector('#loginUsernameEmail').value;
            const password = loginForm.querySelector('#loginPassword').value;

            console.log('Login Attempt:');
            console.log('Username/Email:', usernameEmail);
            console.log('Password:', password);

            const storedUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            const user = storedUsers.find(u => (u.username === usernameEmail || u.email === usernameEmail) && u.password === password);

            if (user) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUsername', user.username);
                localStorage.setItem('currentUserEmail', user.email);
                localStorage.setItem('currentUserFullName', user.name);
                alert('Login Successful! Welcome, ' + user.name + '!');

                // Re-dispatch DOMContentLoaded to update UI based on login status in app.js
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);

                // Programmatically navigate to the home page after successful login
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    // Re-declare showPage or ensure it's accessible (best to define globally or pass)
                    // For simplicity, reusing the logic for now, assumes showPage is in app.js
                    // You might need to call app.js's showPage directly if app.js is loaded first.
                    document.querySelectorAll('.page').forEach(page => {
                        if (page.id === 'home') {
                            page.classList.add('active');
                        } else {
                            page.classList.remove('active');
                        }
                    });
                }
            } else {
                alert('Login Failed: Invalid username/email or password.');
            }
            loginForm.reset();
        });
    }

    // --- Existing Create Account Form Logic ---
    const createAccountForm = document.getElementById('createAccountForm');
    const captchaText = document.getElementById('captchaText');
    const captchaInput = document.getElementById('captchaInput');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');

    let currentCaptcha = '';

    const generateCaptcha = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        currentCaptcha = captcha;
        if (captchaText) captchaText.textContent = captcha; // Ensure captchaText exists
    };

    if (createAccountForm) {
        generateCaptcha(); // Generate captcha on load for create account form

        if (refreshCaptchaBtn) {
            refreshCaptchaBtn.addEventListener('click', generateCaptcha);
        }

        createAccountForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = createAccountForm.querySelector('#createEmail').value;
            const phoneNumber = createAccountForm.querySelector('#createPhoneNumber').value;
            const username = createAccountForm.querySelector('#createUsername').value;
            const name = createAccountForm.querySelector('#createName').value;
            const password = createAccountForm.querySelector('#createPassword').value;
            const confirmPassword = createAccountForm.querySelector('#confirmPassword').value;
            const enteredCaptcha = captchaInput.value;

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            if (enteredCaptcha !== currentCaptcha) {
                alert('Incorrect Captcha. Please try again.');
                generateCaptcha();
                captchaInput.value = '';
                return;
            }

            const storedUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            const userExists = storedUsers.some(u => u.username === username || u.email === email);

            if (userExists) {
                alert('Account with this username or email already exists.');
                return;
            }

            const newUser = { email, phoneNumber, username, name, password };
            storedUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUsername', username);
            localStorage.setItem('currentUserEmail', email);
            localStorage.setItem('currentUserFullName', name);

            alert('Account created successfully! Welcome, ' + name + '!');
            createAccountForm.reset();
            generateCaptcha();

            // Re-dispatch DOMContentLoaded to update UI based on login status in app.js
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);

            // Programmatically navigate to the home page after successful account creation
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                document.querySelectorAll('.page').forEach(page => {
                    if (page.id === 'home') {
                        page.classList.add('active');
                    } else {
                        page.classList.remove('active');
                    }
                });
            }
        });
    }

    // -------------------------------------------------------------
    // --- Machine Learning Detection Logic (Updated) ---
    // -------------------------------------------------------------
    const mlImageInput = document.getElementById('mlImageInput');
    const mlStartBtn = document.getElementById('mlStartBtn');
    // Ensure mlTerminateBtn is correctly referenced and initialized
    const mlTerminateBtn = document.getElementById('mlTerminateBtn');
    const mlTimerDisplay = document.getElementById('mlTimer');
    const mlResultDiv = document.getElementById('mlResult');
    const mlAccuracySpan = document.getElementById('mlAccuracy');
    const mlTimingSpan = document.getElementById('mlTiming');
    const mlTumorTypeSpan = document.getElementById('mlTumorType');

    let mlProcessingInterval;
    let mlStartTime;
    let currentMlFetchController;

    // Ensure all relevant ML Detection elements exist before attaching listeners
    if (mlImageInput && mlStartBtn && mlTerminateBtn && mlTimerDisplay && mlResultDiv && mlAccuracySpan && mlTimingSpan && mlTumorTypeSpan) {
        mlStartBtn.disabled = true; // Disable the start button initially

        mlImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                console.log('Selected ML image:', file.name);
                mlStartBtn.disabled = false; // Enable start button
                mlResultDiv.style.display = 'none'; // Clear previous results
                mlTimerDisplay.style.display = 'none'; // Hide timer
            } else {
                mlStartBtn.disabled = true;
            }
        });

        mlStartBtn.addEventListener('click', async (e) => { // Added 'e' parameter
            e.preventDefault(); // Crucial: Prevent default form submission if button is inside a form
            console.log("Start ML Detection button clicked! Initiating upload process."); // Debugging log

            const file = mlImageInput.files[0];
            if (!file) {
                alert('Please select an MRI image for ML detection.');
                return;
            }

            // UI Reset and Update for Processing State
            mlResultDiv.style.display = 'none';
            mlAccuracySpan.textContent = '0%';
            mlTimingSpan.textContent = '0s';
            mlTumorTypeSpan.textContent = 'None';

            mlTimerDisplay.textContent = 'Processing...';
            mlTimerDisplay.style.display = 'block';
            mlTimerDisplay.style.color = 'inherit';

            mlStartBtn.style.display = 'none';
            mlTerminateBtn.style.display = 'inline-block';
            mlStartBtn.disabled = true; // Keep disabled while processing

            mlStartTime = Date.now();
            mlProcessingInterval = setInterval(() => {
                const elapsedTime = (Date.now() - mlStartTime) / 1000;
                mlTimerDisplay.textContent = `Processing: ${elapsedTime.toFixed(1)}s`;
            }, 100);

            // Prepare the image for sending
            const formData = new FormData();
            formData.append('image', file);

            currentMlFetchController = new AbortController();
            const signal = currentMlFetchController.signal;

            // Send the image to the backend
            try {
                // IMPORTANT: Ensure this URL matches your Flask backend's running port
                const response = await fetch('http://127.0.0.1:5001/ml-detect', {
                    method: 'POST',
                    body: formData,
                    signal: signal
                });

                clearInterval(mlProcessingInterval); // Stop timer on response

                const result = await response.json();

                if (response.ok) {
                    mlAccuracySpan.textContent = `${result.accuracy}%`;
                    mlTimingSpan.textContent = `${result.timing}s`;
                    mlTumorTypeSpan.textContent = result.tumor_type;
                    mlResultDiv.style.display = 'block';
                    mlTimerDisplay.style.display = 'none';
                } else {
                    alert(`ML Detection Error: ${result.error || 'Something went wrong on the server.'}`);
                    mlTimerDisplay.textContent = 'Error!';
                    mlTimerDisplay.style.color = 'red';
                    mlResultDiv.style.display = 'none';
                }
            } catch (error) {
                clearInterval(mlProcessingInterval);
                if (error.name === 'AbortError') {
                    console.log('ML Detection aborted by user.');
                    mlTimerDisplay.textContent = 'Aborted.';
                    mlTimerDisplay.style.color = 'orange';
                } else {
                    console.error('ML Detection failed:', error);
                    alert('Failed to connect to ML detection backend or a network error occurred. Please check server and console.');
                    mlTimerDisplay.textContent = 'Failed!';
                    mlTimerDisplay.style.color = 'red';
                }
                mlResultDiv.style.display = 'none';
            } finally {
                // Always reset button states
                mlStartBtn.style.display = 'inline-block';
                mlTerminateBtn.style.display = 'none';
                mlStartBtn.disabled = false; // Re-enable for next attempt
                currentMlFetchController = null;
            }
        });

        mlTerminateBtn.addEventListener('click', () => {
            if (currentMlFetchController) {
                currentMlFetchController.abort();
            }
            clearInterval(mlProcessingInterval);
            mlTimerDisplay.textContent = 'Terminated.';
            mlTimerDisplay.style.color = 'orange';
            mlResultDiv.style.display = 'none';

            mlStartBtn.style.display = 'inline-block';
            mlTerminateBtn.style.display = 'none';
            mlStartBtn.disabled = false;

            console.log('ML Detection process terminated.');
        });
    }

    // -------------------------------------------------------------
    // --- Quantum ML Detection Logic (Initialize elements, but no backend logic yet) ---
    // -------------------------------------------------------------
    const qmlImageInput = document.getElementById('qmlImageInput');
    const qmlStartBtn = document.getElementById('qmlStartBtn');
    const qmlTerminateBtn = document.getElementById('qmlTerminateBtn');
    const qmlTimerDisplay = document.getElementById('qmlTimer');
    const qmlResultDiv = document.getElementById('qmlResult');
    const qmlAccuracySpan = document.getElementById('qmlAccuracy');
    const qmlTimingSpan = document.getElementById('qmlTiming');
    const qmlTumorTypeSpan = document.getElementById('qmlTumorType');

    let qmlProcessingInterval;
    let qmlStartTime;
    let currentQmlFetchController;

    if (qmlImageInput && qmlStartBtn && qmlTerminateBtn && qmlTimerDisplay && qmlResultDiv && qmlAccuracySpan && qmlTimingSpan && qmlTumorTypeSpan) {
        qmlStartBtn.disabled = true;

        qmlImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                console.log('Selected QML image:', file.name);
                qmlStartBtn.disabled = false;
                qmlResultDiv.style.display = 'none';
                qmlTimerDisplay.style.display = 'none';
            } else {
                qmlStartBtn.disabled = true;
            }
        });

        qmlStartBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("Start QML Detection button clicked! (Backend not yet implemented)");

            const file = qmlImageInput.files[0];
            if (!file) {
                alert('Please select an MRI image for Quantum ML detection.');
                return;
            }

            // Placeholder UI update for QML
            qmlResultDiv.style.display = 'none';
            qmlAccuracySpan.textContent = '0%';
            qmlTimingSpan.textContent = '0s';
            qmlTumorTypeSpan.textContent = 'None';

            qmlTimerDisplay.textContent = 'Processing (QML - Placeholder)...';
            qmlTimerDisplay.style.display = 'block';
            qmlTimerDisplay.style.color = 'inherit';

            qmlStartBtn.style.display = 'none';
            qmlTerminateBtn.style.display = 'inline-block';
            qmlStartBtn.disabled = true;

            qmlStartTime = Date.now();
            qmlProcessingInterval = setInterval(() => {
                const elapsedTime = (Date.now() - qmlStartTime) / 1000;
                qmlTimerDisplay.textContent = `Processing (QML): ${elapsedTime.toFixed(1)}s`;
            }, 100);

            // Simulate a delay for QML processing
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3 second processing

            clearInterval(qmlProcessingInterval);
            qmlTimerDisplay.textContent = 'QML Placeholder Result.';
            qmlTimerDisplay.style.color = 'green';
            qmlAccuracySpan.textContent = `N/A%`; // No real accuracy from placeholder
            qmlTimingSpan.textContent = `3.0s`;
            qmlTumorTypeSpan.textContent = `Simulated: No Tumor`; // Simulated result
            qmlResultDiv.style.display = 'block';


            // Reset button states
            qmlStartBtn.style.display = 'inline-block';
            qmlTerminateBtn.style.display = 'none';
            qmlStartBtn.disabled = false;
            currentQmlFetchController = null; // No actual fetch, but good practice
        });


        qmlTerminateBtn.addEventListener('click', () => {
            if (currentQmlFetchController) {
                // In a real QML setup, you'd abort the fetch here
                currentQmlFetchController.abort();
            }
            clearInterval(qmlProcessingInterval);
            qmlTimerDisplay.textContent = 'Terminated.';
            qmlTimerDisplay.style.color = 'orange';
            qmlResultDiv.style.display = 'none';

            qmlStartBtn.style.display = 'inline-block';
            qmlTerminateBtn.style.display = 'none';
            qmlStartBtn.disabled = false;

            console.log('QML Detection process terminated.');
        });
    }
});