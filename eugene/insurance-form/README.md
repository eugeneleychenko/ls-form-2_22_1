# LeoSource Insurance Form

A Next.js application for insurance form submission with Airtable integration.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/eugeneleychenko/leosource-form.git
cd leosource-form/eugene/insurance-form
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your Airtable credentials:
     ```
     NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key_here
     NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id_here
     NEXT_PUBLIC_AIRTABLE_TABLE_ID=your_airtable_table_id_here
     ```

4. Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Features

- Multi-step insurance form
- Airtable integration for data storage
- Form validation
- Responsive design
- Skip to submit functionality

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_AIRTABLE_API_KEY`: Your Airtable API key
- `NEXT_PUBLIC_AIRTABLE_BASE_ID`: Your Airtable base ID
- `NEXT_PUBLIC_AIRTABLE_TABLE_ID`: Your Airtable table ID

## Form Sections

1. Basic Information
   - Lead ID (required)
   - First Name (required)
   - Last Name (required)
   - Email
   - Date of Birth
   - Lead Source
   - Insurance State
   - Type of Insurance

2. Health Information
3. Insurance Details
4. Personal Details
5. Contact Numbers
6. Address Information
7. Dependents Information
8. Billing Information
9. Agent Information

## Development

- Built with Next.js
- Uses React Hook Form for form management
- Styled with Tailwind CSS
- UI components from shadcn/ui 