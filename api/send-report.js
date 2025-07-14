// This is our "Mail Carrier" serverless function - api/send-report.js
// It listens for a request, then uses Postmark to send the email report.

import { ServerClient } from 'postmark';

// Initialize Postmark with our secret API token from Vercel
const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN);

export default async function handler(request, response) {
    // We only accept POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { leadEmail, reportData } = request.body;
        
        // This is the verified email address from your Postmark account
        const fromAddress = 'mike@aiadvisorsgroup.co'; 

        if (!leadEmail || !reportData) {
            return response.status(400).json({ error: 'Missing required data for sending report.' });
        }

        // --- 1. Send the email to the LEAD (the user who wants the report) ---
        await postmark.sendEmail({
            "From": fromAddress,
            "To": leadEmail,
            "Subject": "Your Complaint Compass Analysis Report",
            "HtmlBody": `
                <h1>Your Analysis Report</h1>
                <p>Thank you for using Complaint Compass! Here is the report you requested:</p>
                <hr>
                <h3>Analysis Results</h3>
                <p><strong>Churn Meter:</strong> ${reportData.churnMeterText}</p>
                <h3>Suggested Reply</h3>
                <p><em>"${reportData.suggestedReply}"</em></p>
                <hr>
                <p>Analyzing one conversation is just the start. Imagine what you could learn from all of them.</p>
                <p>Discover the hidden patterns costing you revenue with <strong>AI Advisors Group</strong>.</p>
            `
        });

        // --- 2. Send a notification email to YOU (the business owner) ---
        await postmark.sendEmail({
            "From": fromAddress,
            "To": fromAddress, // Sending to yourself
            "Subject": "New Lead from Complaint Compass!",
            "HtmlBody": `
                <h1>New Lead Captured!</h1>
                <p>A new user has requested a report to be sent to the following email address:</p>
                <h2>${leadEmail}</h2>
                <p>You can follow up with them directly.</p>
            `
        });

        // --- 3. Send a success response back to the browser ---
        return response.status(200).json({ message: 'Report sent successfully!' });

    } catch (error) {
        console.error('Postmark API Error:', error);
        return response.status(500).json({ error: 'Failed to send report.' });
    }
}