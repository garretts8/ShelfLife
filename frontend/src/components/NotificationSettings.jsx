import React, { useState, useEffect } from 'react';
import api from '../api';

const NotificationSettings = () => {
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: false,
        phoneNumber: '',
        reminderDays: 7
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);


    //Load preferences on mount
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {

        try {
            const response = await api.get('/preferences');
            setPreferences(response.data);
        } catch (error) {
            console.error('Failed to load preferences', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/preferences', preferences);
            setMessage('Preferences saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to save preferences');
            console.error('Failed to save preferences', error);
        }
    };

    const testSMS = async () => {
        try {
            await api.post('/preferences/test-sms');
            setMessage('Test SMS sent! Check your phone for a test message.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send test SMS. Please check your phone number and try again.';
            setMessage(errorMessage);
            console.error(error);
        }
    };

    if (loading) return <div>Loading preferences...</div>;

    return (
        <div className="dashboard-card">
            <h2>📱 Notification Settings</h2>
            {message && <div className="success-message">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                emailNotifications: e.target.checked
                            })}
                        />
                        Email Notifications
                    </label>
                </div>

                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={preferences.smsNotifications}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                smsNotifications: e.target.checked
                            })}
                        />
                        SMS Notifications
                    </label>
                </div>

                {preferences.smsNotifications && (
                    <div className="form-group">
                        <label>Phone Number (with country code):</label>
                        <input
                            type="tel"
                            placeholder="+1234567890"
                            value={preferences.phoneNumber}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                phoneNumber: e.target.value
                            })}
                        />
                        <button type="button" onClick={testSMS} className="btn-small">
                            Test SMS
                        </button>
                    </div>
                )}

                <div className="form-group">
                    <label>Reminder Days (days before expiration):</label>
                    <select
                        value={preferences.reminderDays}
                        onChange={(e) => setPreferences({
                            ...preferences,
                            reminderDays: parseInt(e.target.value)
                        })}
                    >
                        <option value="3">3 days</option>
                        <option value="5">5 days</option>
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                    </select>
                </div>

                <button type="submit" className="btn-submit">
                    Save Preferences
                </button>
            </form>
        </div>
    );
};

export default NotificationSettings;