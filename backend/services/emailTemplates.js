//Email templates
/*Contains templates for expiration alerts and test emails. */
const emailStyles = require('./emailStyles');

// Expiration alert email template
const getExpirationAlertTemplate = (userName, itemsListHtml) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        ${emailStyles}
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>🍽️ ShelfLife</h1>
            </div>
            <div class="email-body">
                <h2>Hello ${userName || 'there'}!</h2>
                <p style="font-size: 16px;">The following items in your pantry are expiring within the next <strong>7 days</strong>:</p>
                
                <table class="expiry-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Expires</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsListHtml}
                    </tbody>
                </table>
                
                <a href="${process.env.FRONTEND_URL}/dashboard?tab=pantry" class="btn">
                    View Your Pantry
                </a>
                
                <div class="footer">
                    You received this email because you have items expiring soon in your ShelfLife pantry.
                </div>
            </div>
        </div>
    </body>
    </html>
`;

// Test email template
const getTestEmailTemplate = (userName) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        ${emailStyles}
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>🍽️ ShelfLife</h1>
            </div>
            <div class="email-body">
                <h2>Hello ${userName || 'there'}!</h2>
                <p>Your ShelfLife email notifications have been successfully configured!</p>
                <p>You will now receive alerts when items in your pantry are about to expire.</p>
                <p>Thank you for using ShelfLife!</p>
                <div class="footer">
                    This is a test email to verify your notification settings.
                </div>
            </div>
        </div>
    </body>
    </html>
`;

module.exports = {
    getExpirationAlertTemplate,
    getTestEmailTemplate
};