//Email templates
/*Contains templates for expiration alerts and test emails. */
const emailStyles = require('./emailStyles');

// Helper to check if any item is an emergency kit item
const hasEmergencyItems = (items) => {
    return items && items.some(item => item.replacementDate !== undefined);
};

// Helper to get the correct link based on item types
const getItemLink = (items) => {
    const hasEmergency = hasEmergencyItems(items);
    const hasPantry = items && items.some(item => item.expirationDate !== undefined);
    
    if (hasEmergency && hasPantry) {
        // If both types are present, link to dashboard (user can choose tab)
        return `${process.env.FRONTEND_URL || 'https://shelflife-frontend.onrender.com'}/dashboard`;
    } else if (hasEmergency) {
        return `${process.env.FRONTEND_URL || 'https://shelflife-frontend.onrender.com'}/dashboard?tab=emergency`;
    } else {
        return `${process.env.FRONTEND_URL || 'https://shelflife-frontend.onrender.com'}/dashboard?tab=pantry`;
    }
};

// Helper to get the correct title based on item types
const getAlertTitle = (items) => {
    const hasEmergency = hasEmergencyItems(items);
    const hasPantry = items && items.some(item => item.expirationDate !== undefined);
    
    if (hasEmergency && hasPantry) {
        return 'The following items in your pantry and emergency kit need your attention within the next <strong>7 days</strong>:';
    } else if (hasEmergency) {
        return 'The following items in your emergency kit need replacement within the next <strong>7 days</strong>:';
    } else {
        return 'The following items in your pantry are expiring within the next <strong>7 days</strong>:';
    }
};

// Helper to get the correct button text
const getButtonText = (items) => {
    const hasEmergency = hasEmergencyItems(items);
    const hasPantry = items && items.some(item => item.expirationDate !== undefined);
    
    if (hasEmergency && hasPantry) {
        return 'View Your Dashboard';
    } else if (hasEmergency) {
        return 'View Your Emergency Kit';
    } else {
        return 'View Your Pantry';
    }
};

// Helper to get the correct footer text
const getFooterText = (items) => {
    const hasEmergency = hasEmergencyItems(items);
    const hasPantry = items && items.some(item => item.expirationDate !== undefined);
    
    if (hasEmergency && hasPantry) {
        return 'You received this email because you have items expiring soon in your ShelfLife pantry and emergency kit.';
    } else if (hasEmergency) {
        return 'You received this email because you have items in your emergency kit that need replacement.';
    } else {
        return 'You received this email because you have items expiring soon in your ShelfLife pantry.';
    }
};

// Helper to get the correct column header
const getDateColumnHeader = (items) => {
    const hasEmergency = hasEmergencyItems(items);
    return hasEmergency ? 'Replacement Date' : 'Expires';
};

// Expiration alert email template
const getExpirationAlertTemplate = (userName, itemsListHtml, items) => `
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
                <p style="font-size: 16px;">${getAlertTitle(items)}</p>
                
                <table class="expiry-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>${getDateColumnHeader(items)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsListHtml}
                    </tbody>
                </table>
                
                <a href="${getItemLink(items)}" class="btn">
                    ${getButtonText(items)}
                </a>
                
                <div class="footer">
                    ${getFooterText(items)}
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
                <p>You will now receive alerts when items in your pantry are about to expire or when your emergency kit items need replacement.</p>
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