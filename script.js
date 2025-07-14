// Complaint Compass - script.js (v3.0 - Final with Email Integration)

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const complaintForm = document.getElementById('complaint-form');
    const analyzeButton = document.getElementById('analyze-button');
    const buttonText = document.querySelector('.button-text');
    const spinner = document.querySelector('.spinner');
    const complaintInput = document.getElementById('complaint-input');
    
    const resultsContainer = document.getElementById('results-container');
    const leadCaptureSection = document.getElementById('lead-capture-section');
    
    const churnMeterText = document.getElementById('churn-meter-text');
    const churnMeterFill = document.getElementById('churn-meter-fill');
    const replyOutput = document.getElementById('reply-output');

    const errorContainer = document.getElementById('error-container');
    const errorOutput = document.getElementById('error-output');

    // New Email Form Elements
    const emailReportForm = document.getElementById('email-report-form');
    const leadEmailInput = document.getElementById('lead-email-input');
    const sendReportButton = document.getElementById('send-report-button');

    // --- Event Listener for AI Analysis ---
    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const complaintText = complaintInput.value.trim();
        if (!complaintText) return;

        setLoadingState(true);

        try {
            const response = await fetch('/api/deconstructor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaint: complaintText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            populateResults(data);

        } catch (error) {
            handleError(error.message);
        } finally {
            setLoadingState(false);
        }
    });

    // --- *** NEW: Event Listener for Email Form Submission *** ---
    emailReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const leadEmail = leadEmailInput.value.trim();
        if (!leadEmail) {
            alert('Please enter a valid email address.');
            return;
        }

        sendReportButton.disabled = true;
        sendReportButton.textContent = 'Sending...';

        try {
            // Gather the report data from the screen
            const reportData = {
                churnMeterText: churnMeterText.textContent,
                suggestedReply: replyOutput.textContent
            };

            const response = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadEmail, reportData })
            });

            if (!response.ok) {
                throw new Error('The mail server failed to send the report.');
            }

            // Success! Show a thank you message.
            leadCaptureSection.innerHTML = '<h3>🎉 Report on its way!</h3><p>Check your spam folder if you don’t see it in the next minute.</p>';

        } catch (error) {
            alert(`Error: ${error.message}`);
            sendReportButton.disabled = false;
            sendReportButton.textContent = 'Send My Free Report →';
        }
    });


    // --- Helper Functions ---
    function setLoadingState(isLoading) {
        analyzeButton.disabled = isLoading;
        buttonText.textContent = isLoading ? 'Analyzing...' : 'Analyze Complaint';
        spinner.style.display = isLoading ? 'block' : 'none';
        if (isLoading) {
            resultsContainer.style.display = 'none';
            leadCaptureSection.style.display = 'none';
            errorContainer.style.display = 'none';
        }
    }

    function populateResults(data) {
        const score = data.churnMeter.score;
        const percentage = (score / 10) * 100;
        churnMeterFill.style.width = `${percentage}%`;
        churnMeterFill.className = 'churn-meter-fill';
        if (score <= 4) churnMeterFill.classList.add('churn-low');
        else if (score <= 7) churnMeterFill.classList.add('churn-medium');
        else churnMeterFill.classList.add('churn-high');
        churnMeterText.textContent = `Score: ${score}/10 - ${data.churnMeter.reasoning}`;
        replyOutput.textContent = data.suggestedReply;
        resultsContainer.style.display = 'block';
        leadCaptureSection.style.display = 'block';
    }

    function handleError(message) {
        errorOutput.textContent = `An error occurred during analysis. Please try again later. Details: ${message}`;
        errorContainer.style.display = 'block';
    }
});