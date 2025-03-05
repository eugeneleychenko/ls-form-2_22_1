# Form Prefiller Chrome Extension

A simple Chrome extension to prefill enrollment forms with test data or real submission data.

## Installation

1. Save all the files in a folder named `chrome_extension`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `chrome_extension` folder
5. The extension should now be installed and visible in your extensions list

## Usage

1. Navigate to the enrollment form page
2. Click on the extension icon in your Chrome toolbar
3. Choose your data source:
   - **Use Test Data**: Fills the form with predefined test values
   - **Use Real Submission**: Fills the form with data from a previous submission
4. Click the "Fill Form with Data" button
5. All form fields will be populated with the selected data

## Data Sources

### Test Data
The extension's built-in test data includes fictional information for all form fields.

### Real Submission Data
The extension can also use data from a previous form submission, mapped to the appropriate fields. This is useful for testing with real-world data.

## Form Field Mapping

The extension maps fields from the previous submission data to the form fields as follows:

| Form Field | Previous Submission Field |
|------------|---------------------------|
| firstname | firstName |
| lastname | lastName |
| address | Address Line 1 |
| address2 | Address Line 2 |
| city | City |
| state | State |
| zipcode | Zip |
| phone1_# | Cell Phone (split) |
| phone2_# | Work Phone (split) |
| email | email |
| ssn | SSN |
| dob fields | DOB (split) |
| gender | Gender |
| cc_number | Card Number |
| pay_ccexpmonth | Exp. Month |
| pay_ccexpyear | Exp. Year |
| pay_cccvv2 | CVV |
| pay_address | Billing Address Line 1 |
| pay_city | Billing City |
| pay_state | Billing State |
| pay_zipcode | Billing Zip |

## Features

- Automatically fills all form fields with realistic test data
- Can use real submission data from previous enrollments
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