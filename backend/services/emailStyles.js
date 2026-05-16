//Email CSS styles to be used in the email templates.
const emailStyles = `
    <style>
         .email-container{
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
        }
        .email-header{
            background: linear-gradient(135deg, #e667eea 0%, #764ba2 100%);
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .email-header h1{
            color: white;
            margin: 0;
        }
        .email-body{
            background: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
        }
        .email-body h2{
           color: #333;
           margin-top: 0;
        }
        .expiry-table{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px 0;
        }
        .expiry-table th {
            background: #667eea;
            color: white;
            padding: 10px;
            text-align: left;
        }
        .expiry-table td{
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .expiry-date {
            color: #ed8936;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #888;
            text-align: center;
        }
    </style>

`;

module.exports = emailStyles;

