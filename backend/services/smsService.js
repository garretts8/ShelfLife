// Handles sending SMS notifications using Twilio
const twilio = require('twilio');

// Create Twilio client
const createTwilioClient = () => {
    return twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
};

// Format expiring items for SMS (character limit is 1600)
const formatExpiringItemsForSMS = (expiringItems) => {
    const itemsList = expiringItems.map(item => {
        const expDate = new Date(item.expirationDate).toLocaleDateString();
        return `• ${item.name}: ${item.quantity} ${item.unit} (expires ${expDate})`;
    }).join('\n');

    return `⚠️ ShelfLife Alert: ${expiringItems.length} item(s) expiring soon:\n\n${itemsList}\n\nLog in to manage your pantry: http://localhost:5173/dashboard`;
};

// Send expiration notification SMS
const sendExpirationSMS = async (phoneNumber, expiringItems) => {
    try {
        const client = createTwilioClient();
        const messageBody = formatExpiringItemsForSMS(expiringItems);

        // Truncate if too long (SMS limit is 1600 characters)
        const truncatedBody = messageBody.length > 1600
            ? messageBody.substring(0, 1597) + '...'
            : messageBody;

        const message = await client.messages.create({
            body: truncatedBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log(`SMS sent to ${phoneNumber}: ${message.sid}`);
        return true;

    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
};

// Send test SMS
const sendTestSMS = async (phoneNumber) => {
    try {
        const client = createTwilioClient();

        const message = await client.messages.create({
            body: '✅ ShelfLife SMS notifications have been successfully configured! You will now receive alerts when items in your pantry are about to expire.',
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log(`Test SMS sent to ${phoneNumber}: ${message.sid}`);
        return true;

    } catch (error) {
        require('fs').writeFileSync('last_sms_error.txt', error.stack || error.message);
        console.error('Error sending test SMS:', error);
        return false;
    }
};

module.exports = { sendExpirationSMS, sendTestSMS };
