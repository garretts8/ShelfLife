// Handles sending email notifications using Brevo REST API (bypasses Render's SMTP block)
const { getExpirationAlertTemplate, getTestEmailTemplate } = require('./emailTemplates');

// Send email via Brevo API
const sendEmailViaBrevo = async (toEmail, toName, subject, htmlContent) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER;

    if (!apiKey || !senderEmail) {
        console.error('Missing Brevo configuration in environment variables');
        return false;
    }

    const payload = {
        sender: {
            name: 'ShelfLife',
            email: senderEmail
        },
        to: [{
            email: toEmail,
            name: toName || 'ShelfLife User'
        }],
        subject: subject,
        htmlContent: htmlContent
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Brevo API error:', result);
            return false;
        }

        console.log(`Email sent to ${toEmail} via Brevo: ${result.messageId}`);
        return true;

    } catch (error) {
        console.error('Brevo email error:', error);
        return false;
    }
};

// Send expiration notification email
const sendExpirationAlert = async (userEmail, userName, expiringItems) => {
    try {
        const itemsListHtml = buildItemsListHtml(expiringItems);
        const htmlContent = getExpirationAlertTemplate(userName, itemsListHtml);
        
        const success = await sendEmailViaBrevo(
            userEmail,
            userName,
            `⚠️ ${expiringItems.length} Item(s) Expiring Soon in Your Pantry`,
            htmlContent
        );
        
        return success;
    } catch (error) {
        console.error('Error sending expiration alert:', error);
        return false;
    }
};

// Send test email
const sendTestEmail = async (userEmail, userName) => {
    try {
        const htmlContent = getTestEmailTemplate(userName);
        
        const success = await sendEmailViaBrevo(
            userEmail,
            userName,
            'ShelfLife Email Notifications Enabled',
            htmlContent
        );
        
        return success;
    } catch (error) {
        console.error('Error sending test email:', error);
        return false;
    }
};

// Helper: Build HTML table rows for expiring items
const buildItemsListHtml = (expiringItems) => {
    return expiringItems.map(item => {
        const expDate = new Date(item.expirationDate).toLocaleDateString();
        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td class="expiry-date">${expDate}</td>
            </tr>
        `;
    }).join('');
};

module.exports = {
    sendExpirationAlert,
    sendTestEmail
};