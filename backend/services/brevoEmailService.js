// Handles sending email notifications using Brevo API (port 443 - always open)
const { getExpirationAlertTemplate, getTestEmailTemplate } = require('./emailTemplates');

// Send email via Brevo API
const sendEmailViaBrevo = async (toEmail, toName, subject, htmlContent) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER;

    if (!apiKey) {
        console.error('Missing BREVO_API_KEY environment variable');
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

        console.log(`Email sent to ${toEmail} via Brevo API: ${result.messageId}`);
        return true;

    } catch (error) {
        console.error('Brevo API error:', error);
        return false;
    }
};

// Build HTML table rows for expiring items (supports both pantry and emergency kit items)
const buildItemsListHtml = (expiringItems) => {
    return expiringItems.map(item => {
        // Check if this is an emergency kit item (has replacementDate)
        const isEmergency = item.replacementDate !== undefined;
        const dateField = isEmergency ? item.replacementDate : item.expirationDate;
        
        // Fix invalid date handling
        let formattedDate = 'Date not set';
        if (dateField) {
            try {
                const d = new Date(dateField);
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString();
                }
            } catch (e) {
                // Keep default message if parsing fails
            }
        }
        
        // Add emoji indicator for emergency kit items
        const nameDisplay = isEmergency ? `${item.name} 🆘` : item.name;
        const dateColumn = isEmergency ? formattedDate : formattedDate;
        
        return `
            <tr>
                <td>${nameDisplay}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td class="expiry-date">${dateColumn}</td>
            </tr>
        `;
    }).join('');
};

// Determine the subject based on item types
const getSubject = (expiringItems) => {
    const hasEmergency = expiringItems.some(item => item.replacementDate !== undefined);
    const hasPantry = expiringItems.some(item => item.expirationDate !== undefined);
    
    if (hasEmergency && hasPantry) {
        return `⚠️ ${expiringItems.length} Item(s) Need Your Attention`;
    } else if (hasEmergency) {
        return `⚠️ ${expiringItems.length} Emergency Kit Item(s) Need Replacement`;
    } else {
        return `⚠️ ${expiringItems.length} Item(s) Expiring Soon in Your Pantry`;
    }
};

// Send expiration notification email
const sendExpirationAlert = async (userEmail, userName, expiringItems) => {
    try {
        const itemsListHtml = buildItemsListHtml(expiringItems);
        const htmlContent = getExpirationAlertTemplate(userName, itemsListHtml, expiringItems);
        const subject = getSubject(expiringItems);
        
        const success = await sendEmailViaBrevo(
            userEmail,
            userName,
            subject,
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

module.exports = {
    sendExpirationAlert,
    sendTestEmail
};