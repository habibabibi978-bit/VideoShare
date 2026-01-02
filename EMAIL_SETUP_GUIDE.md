# Email Verification Setup Guide

## Step 1: Enable 2-Step Verification on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification (if not already enabled)

## Step 2: Generate App Password

1. Go back to **Security** settings
2. Under "Signing in to Google", find **App passwords**
3. You may need to sign in again
4. Click **Select app** → Choose **Mail**
5. Click **Select device** → Choose **Other (Custom name)**
6. Enter a name like "Tech App Email Service"
7. Click **Generate**
8. **Copy the 16-character password** (you'll need this for EMAIL_PASS)

## Step 3: Update .env File

Update these values in `backend/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

**Important:**
- `EMAIL_USER`: Your full Gmail address (e.g., `yourname@gmail.com`)
- `EMAIL_PASS`: The 16-character App Password (no spaces)
- `EMAIL_FROM`: Can be the same as EMAIL_USER or a custom name like `Tech App <your-email@gmail.com>`

## Step 4: Restart Backend Server

After updating the .env file, restart the backend server:

```powershell
cd C:\Users\M\Desktop\frontend\backend
npm run start:dev
```

## Step 5: Test Email Verification

1. Register a new user account
2. Check the email inbox (and spam folder)
3. Click the verification link in the email
4. Email should be verified successfully

## Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the App Password was copied correctly (no spaces)

### Email not received
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASS are correct in .env
- Check backend console for error messages
- Make sure backend server was restarted after .env changes

### "Less secure app access" error
- Gmail no longer supports "less secure apps"
- You **must** use App Passwords (as described above)

## Alternative Email Providers

If you don't want to use Gmail, you can use other SMTP providers:

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### SendGrid (Recommended for production)
- Sign up at https://sendgrid.com/
- Get API key from dashboard
- Use SMTP settings provided by SendGrid

### Mailgun
- Sign up at https://www.mailgun.com/
- Use SMTP settings from Mailgun dashboard

