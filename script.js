document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const complaintForm = document.getElementById('complaint-form');
    const analyzeButton = document.getElementById('analyze-button');
    const buttonText = document.querySelector('.button-text');
    const spinner = document.querySelector('.spinner');
    const complaintInput = document.getElementById('complaint-input');
    
    const resultsContainer = document.getElementById('results-container');
    const leadCaptureSection = document.getElementById('lead-capture-section');
    
    // Result-specific elements
    const churnMeterFill = document.getElementById('churn-meter-fill');
    const churnMeterText = document.getElementById('churn-meter-text');
    const replyOutput = document.getElementById('reply-output');

    const errorContainer = document.getElementById('error-container');
    const errorOutput = document.getElementById('error-output');

    // --- Event Listener for AI Analysis ---
    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const complaintText = complaintInput.value.trim();
        if (!complaintText) return;

        // --- Start Loading State ---
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

    // --- Helper Functions ---
    function setLoadingState(isLoading) {
        analyzeButton.disabled = isLoading;
        buttonText.textContent = isLoading ? 'Analyzing...' : 'Analyze Complaint';
        spinner.style.display = isLoading ? 'block' : 'none';
        
        // Hide previous results on new analysis
        if (isLoading) {
            resultsContainer.style.display = 'none';
            leadCaptureSection.style.display = 'none';
            errorContainer.style.display = 'none';
        }
    }

    function populateResults(data) {
        // Populate Churn Meter
        const score = data.churnMeter.score;
        const percentage = (score / 10) * 100;
        churnMeterFill.style.width = `${percentage}%`;

        churnMeterFill.className = 'churn-meter-fill'; // Reset classes
        if (score <= 4) churnMeterFill.classList.add('churn-low');
        else if (score <= 7) churnMeterFill.classList.add('churn-medium');
        else churnMeterFill.classList.add('churn-high');
        
        churnMeterText.textContent = `Score: ${score}/10 - ${data.churnMeter.reasoning}`;

        // Populate Suggested Reply
        replyOutput.textContent = data.suggestedReply;
        
        // Show the results
        resultsContainer.style.display = 'block';
        leadCaptureSection.style.display = 'block';
    }

    function handleError(message) {
        errorOutput.textContent = `An error occurred during analysis. Please try again later. Details: ${message}`;
        errorContainer.style.display = 'block';
    }

    // NOTE: Logic for the new email-report-form will be added in Phase 2.
});