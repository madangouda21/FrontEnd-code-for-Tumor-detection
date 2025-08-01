# FrontEnd-code-for-Tumor-detection

FrontEnd Code for Tumor Detection

This is the frontend for the Brain Tumor Detection system. It allows users to choose between two detection methods — Classical Machine Learning and Quantum Machine Learning (QML) — with a simple and interactive interface.


 How It Works
	•	When you open the app in your browser (via local server or deployment), you’ll see two options:
	•	🔹 Machine Learning: Sends the data to the ML backend for prediction.
	•	🔹 Quantum Machine Learning: Sends the data to the QML backend for prediction.

Make sure both backend servers (ML & QML) are running and connected correctly.

Technologies Used
	•	HTML – For structuring the web pages.
	•	CSS – For styling and layout.
	•	JavaScript – For interactivity, API calls, and logic.

 Backend Integration (Important)

This frontend is designed to connect with two separate backends:

Section	Backend Required
Machine Learning	REST API built with Python (e.g., FastAPI/Flask)
Quantum Machine Learning	REST API built for QML model

You must update the API endpoints in the JS file according to your backend URL/port.

How to Run Frontend
	1.	Clone the repository:

git clone https://github.com/your-username/FrontEnd-code-for-Tumor-detection.git
cd FrontEnd-code-for-Tumor-detection


📌 Note

This repo only contains the frontend. Backend codes for both ML and QML should be maintained separately and connected via API calls.
