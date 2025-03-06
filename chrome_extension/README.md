# Form Prefiller Chrome Extension

This Chrome extension helps streamline form filling by automatically populating enrollment form fields with test or real submission data.

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome_extension` folder
5. The extension should now appear in your Chrome toolbar

## Usage

1. Navigate to the enrollment form page
2. Click on the Form Prefiller extension icon in your Chrome toolbar
3. Select your desired data source:
   - **Use Test Data**: Fills the form with pre-defined test data
   - **Use Real Submission**: Fills the form with data from a recent submission
   - **Search by Name**: Allows you to search for previous submissions by name
4. If using "Search by Name":
   - Type the first or last name in the search field
   - Select a person from the results
   - The selected person will be displayed
5. Click "Fill Form with Test Data" button
6. All form fields will be populated with the selected data

## Test Data

The extension provides the following test data for form filling:

### Member Information
- Name: John A Doe
- Address: 123 Main St, Apt 4B, Little Rock, AR 72201
- Phone: (555) 123-4567 / (555) 987-6543
- Email: test@example.com
- SSN: 123-45-6789
- DOB: 01/15/1980
- Gender: Male

### Beneficiary Information
- Relationship: Spouse
- Name: Jane Doe
- Address: 123 Main St, Little Rock, AR 72201
- Phone: (555) 123-4567
- DOB: 02/20/1982

### Payment Information
- Card Number: 4111111111111111 (Test Visa)
- Expiration: 01/2030
- CVV: 123
- Billing Address: 123 Main St, Little Rock, AR 72201

## Features

- Automatically fills all form fields with a single click
- Properly selects Credit Card payment option
- Handles form validation events
- Provides test data for easy form testing
- Allows filling with real submission data from Airtable
- Search for specific submissions by name

## Notes

- The extension will attempt to fill all available fields based on the selected data source
- For security reasons, the extension only works on the specific enrollment form page
- If an "Invalid Number" message appears for the credit card, it may be due to custom validation on the form

## Icon Replacement

The included icons are placeholders. For a complete extension, replace these with proper icons:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

## Fetching Real Submissions

The extension now supports fetching real submissions from Airtable. To load real submissions:

1. Click the "Refresh Submissions" button in the popup
2. The extension will attempt to connect to Airtable and fetch all submissions
3. If successful, you'll see the updated submission count and can search by name

If you're having trouble connecting to Airtable directly from the extension, you can run the standalone script:

```bash
cd /Users/eugeneleychenko/Downloads/ls-form-2_22_1
node submission.js
```

This will fetch all submissions from Airtable and log them to the console. The extension will try to use these fetched submissions when available. 