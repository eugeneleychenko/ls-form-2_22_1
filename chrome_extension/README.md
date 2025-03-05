# Form Prefiller Chrome Extension

A simple Chrome extension to prefill enrollment forms with test data.

## Installation

1. Save all the files in a folder named `chrome_extension`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `chrome_extension` folder
5. The extension should now be installed and visible in your extensions list

## Usage

1. Navigate to the enrollment form page
2. Click on the extension icon in your Chrome toolbar
3. Click the "Fill Form with Test Data" button
4. All form fields will be populated with test data

## Test Data

The extension fills the form with the following test data:

### Member Information
- First Name: John
- Middle Name: A
- Last Name: Doe

### Address
- Address: 123 Main St
- Address 2: Apt 4B
- City: Little Rock
- State: AR (Arkansas)
- ZIP Code: 72201

### Contact Information
- Phone: 555-123-4567
- Alternate Phone: 555-987-6543
- Email: test@example.com

### Attributes
- SSN: 123-45-6789
- Date of Birth: 01/15/1980
- Gender: Male

### Payment Information
- Payment Type: Credit Card
- Credit Card Number: 4111111111111111 (test Visa number)
- Expiration Date: 01/2030
- CVV: 123
- Billing Name: John Doe
- Billing Address: 123 Main St
- City: Little Rock
- State: AR
- ZIP Code: 72201

### Beneficiary Information
- Relationship: Spouse
- Name: Jane Doe
- Address: 123 Main St
- City: Little Rock
- State: AR
- ZIP Code: 72201
- Phone: 555-123-4567
- Date of Birth: 02/20/1982

## Features

- Automatically fills all form fields with realistic test data
- Properly selects Credit Card payment option
- Handles AJAX validation to ensure credit card fields remain filled
- Uses advanced techniques to prevent fields from being cleared
- Triggers appropriate events to ensure form validation works correctly
- Creates a complete test enrollment form submission

## Notes About Credit Card Handling

The extension uses special techniques to handle credit card fields which may be cleared by AJAX validation:

1. **Sequential Field Population**: Fields are filled in a strategic sequence to minimize AJAX interference
2. **AJAX Interception**: The extension temporarily blocks validation AJAX calls that might clear fields
3. **Mutation Observation**: A mutation observer is used to detect and prevent field clearing
4. **Value Property Monitoring**: DOM property setters are monitored to prevent unwanted value changes
5. **Delayed Verification**: The extension performs a final check after all operations to ensure values remain set

If you notice credit card fields still being cleared, you can try adjusting the timing values in the code or using a different test credit card number.

## Icon Replacement

Replace the placeholder icon files in the `images` directory with your own icons in the following sizes:
- icon16.png (16x16 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels) 