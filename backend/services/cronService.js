// Scheduled job to check for expiring items and send notifications
const cron = require('node-cron');
const PantryItem = require('../models/PantryItem');
const UserPreference = require('../models/UserPreference');
const { sendExpirationAlert } = require('./brevoEmailService');
const { sendExpirationSMS } = require('./smsService');

// Function to check expiring items and send emails
const checkAndNotifyExpiringItems = async () => {
    console.log('Running expiration check cron job...', new Date().toLocaleString());

    try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // Set time boundaries
        today.setUTCHours(0, 0, 0, 0);
        nextWeek.setUTCHours(23, 59, 59, 999);

        // Find all expiring items that have NOT been notified yet
        const expiringItems = await PantryItem.find({
            expirationDate: {
                $gte: today,
                $lte: nextWeek
            },
            notifiedForExpiration: false  // Only get items not yet notified
        }).populate('user');

        if (expiringItems.length === 0) {
            console.log('No new expiring items found.');
            return;
        }

        console.log(`Found ${expiringItems.length} new expiring item(s)`);

        // Group expiring items by user
        const itemsByUser = {};
        for (const item of expiringItems) {
            const userId = item.user._id.toString();
            if (!itemsByUser[userId]) {
                itemsByUser[userId] = {
                    user: item.user,
                    items: []
                };
            }
            itemsByUser[userId].items.push(item);
        }

        // Send notifications and track which items succeeded
        const successfullyNotifiedItemIds = [];

        for (const userId of Object.keys(itemsByUser)) {
            const { user, items } = itemsByUser[userId];
            const preferences = await UserPreference.findOne({ user: userId });

            let emailSent = false;
            let smsSent = false;

            // Send email if enabled
            if (!preferences || preferences.emailNotifications !== false) {
                if (user.email) {
                    console.log(`Sending email to ${user.email} (${items.length} items expiring)`);
                    emailSent = await sendExpirationAlert(user.email, user.name, items);
                }
            }

            // Send SMS if enabled and phone number exists
            if (preferences && preferences.smsNotifications && preferences.phoneNumber) {
                console.log(`Sending SMS to ${preferences.phoneNumber} (${items.length} items expiring)`);
                smsSent = await sendSMS(preferences.phoneNumber, `⚠️ ShelfLife Alert: ${items.length} item(s) expiring soon in your pantry. Log in to manage.`);
            }

            // If at least one notification method succeeded, mark items as notified
            if (emailSent || smsSent) {
                for (const item of items) {
                    successfullyNotifiedItemIds.push(item._id);
                }
            }
        }

        // Mark only successfully notified items as notified
        if (successfullyNotifiedItemIds.length > 0) {
            await PantryItem.updateMany(
                { _id: { $in: successfullyNotifiedItemIds } },
                { 
                    $set: { 
                        notifiedForExpiration: true,
                        lastNotifiedAt: new Date()
                    }
                }
            );
            console.log(`Marked ${successfullyNotifiedItemIds.length} items as notified`);
        }

        console.log('Expiration check completed successfully.');

    } catch (error) {
        console.error('Error in expiration check cron job:', error);
    }
};

// Initialize cron jobs
const initCronJobs = () => {
    // Run every day at 9:00 AM
    const job = cron.schedule('0 9 * * *', () => {
        console.log('--- Running scheduled expiration check ---');
        checkAndNotifyExpiringItems();
    });

    console.log('Cron job scheduled: Daily expiration check at 9:00 AM');

    // Run once on startup (wait 5 seconds for server to fully start)
    console.log('Running initial expiration check on startup...');
    setTimeout(() => {
        checkAndNotifyExpiringItems();
    }, 5000);

    return job;
};

module.exports = {
    checkAndNotifyExpiringItems,
    initCronJobs
};