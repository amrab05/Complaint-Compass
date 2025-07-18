// Complaint Compass - script.js (v3.1 - Final with Optional Name)
document.addEventListener('DOMContentLoaded', () => {
    const complaintForm = document.getElementById('complaint-form');
    const analyzeButton = document.getElementById('analyze-button');
    const buttonText = document.querySelector('.button-text');
    const spinner = document.querySelector('.spinner');
    const complaintInput = document.getElementById('complaint-input');
    const resultsContainer = document.getElementById('results-container');
    const leadCaptureSection = document.getElementById('lead-capture-section');
    const churnMeterFill = document.getElementById('churn-meter-fill');
    const churnMeterText = document.getElementById('churn-meter-text');
    const replyOutput = document.getElementById('reply-output');
    const errorContainer = document.getElementById('error-container');
    const errorOutput = document.getElementById('error-output');
    const emailReportForm = document.getElementById('email-report-form');
    const leadNameInput = document.getElementById('lead-name-input');
    const leadEmailInput = document.getElementById('lead-email-input');
    const sendReportButton = document.getElementById('send-report-button');

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

    emailReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const leadName = leadNameInput.value.trim();
        const leadEmail = leadEmailInput.value.trim();
        if (!leadEmail) {
            alert('Please enter a valid email address.');
            return;
        }
        sendReportButton.disabled = true;
        sendReportButton.textContent = 'Sending...';
        try {
            const reportData = {
                churnMeterText: churnMeterText.textContent,
                suggestedReply: replyOutput.textContent
            };
            const response = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadName, leadEmail, reportData })
            });
            if (!response.ok) {
                throw new Error('The mail server failed to send the report.');
            }
            leadCaptureSection.innerHTML = '<h3>🎉 Report on its way!</h3><p>Check your spam folder if you don’t see it in the next minute.</p>';
        } catch (error) {
            alert(`Error: ${error.message}`);
            sendReportButton.disabled = false;
            sendReportButton.textContent = 'Send My Free Report →';
        }
    });

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