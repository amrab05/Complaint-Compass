// api/send-report.js (v1.3 - Final with Optional Name)
import { ServerClient } from 'postmark';

const postmark = new ServerClient(process.env.POSTMARK_API_TOKEN);

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }
    try {
        // Now expecting leadName (optional) and leadEmail (required)
        const { leadName, leadEmail, reportData } = request.body;
        const fromAddress = 'mike@aiadvisorsgroup.co'; 

        if (!leadEmail || !reportData) { return response.status(400).json({ error: 'Missing data.' }); }

        // --- Personalization Logic ---
        const greeting = leadName ? `Hi ${leadName},` : 'Hello,';
        const leadIdentifier = leadName ? `${leadName} (${leadEmail})` : leadEmail;

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4c3c7a; color: white; padding: 20px;">
                    <h2 style="margin: 0;">Your Complaint Compass Analysis</h2>
                </div>
                <div style="padding: 20px;">
                    <p>${greeting}</p>
                    <p>Thank you for using Complaint Compass! Here is the AI-powered de-escalation report you requested:</p>
                    <div style="background-color: #f4f7f9; border-left: 4px solid #38a169; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2d3748;">Analysis Results</h3>
                        <p><strong>Churn Meter:</strong> ${reportData.churnMeterText}</p>
                        <h3 style="margin-top: 20px; color: #2d3748;">Suggested Reply (L.E.A.P. Framework)</h3>
                        <p><em>"${reportData.suggestedReply}"</em></p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <h3 style="color: #4c3c7a;">What's the Next Step in the Anti-Churn Doctrine?</h3>
                    <p>You've seen how to handle one complaint. But how much is that customer relationship actually worth? The next step is to understand the financial impact.</p>
                    <p><strong>Coming Soon: The CLV Calculator.</strong> Be the first to know when our next free tool launches to help you quantify your Customer Lifetime Value.</p>
                    <p>For a full analysis of all your customer conversations, explore our core platform at <a href="https://convogauge.aiadvisorsgroup.co/" style="color: #4c3c7a;">ConvoGauge</a>.</p>
                    <p>Best regards,<br>The Team at AI Advisors Group</p>
                </div>
            </div>
        `;

        await postmark.sendEmail({ "From": fromAddress, "To": leadEmail, "Subject": "Your Complaint Compass Analysis Report", "HtmlBody": htmlBody });
        await postmark.sendEmail({ "From": fromAddress, "To": fromAddress, "Subject": "New Lead from Complaint Compass!", "HtmlBody": `New lead captured: <strong>${leadIdentifier}</strong>` });

        return response.status(200).json({ message: 'Report sent successfully!' });

    } catch (error) {
        console.error('Postmark API Error:', error);
        return response.status(500).json({ error: 'Failed to send report.' });
    }
}