# Insurance Form Application

A comprehensive, multi-section insurance form built with Next.js, TypeScript, React Hook Form, and Tailwind CSS. The application allows for collection of client insurance information with submission to Airtable.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Application Structure](#application-structure)
4. [Components](#components)
5. [Types](#types)
6. [Utils and Libraries](#utils-and-libraries)
7. [Making Adjustments](#making-adjustments)
8. [Environment Variables](#environment-variables)
9. [Adding Airtable Fields](#adding-airtable-fields)

## Overview

This application provides a comprehensive insurance form with multiple sections for collecting client information:

- Basic Information
- Health Information
- Insurance Details
- Personal Details
- Contact Numbers
- Address Information
- Dependents Information
- Billing Information
- Agent Information

The form data is validated and submitted to an Airtable database.

## Getting Started

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in the required Airtable credentials:
     ```
     NEXT_PUBLIC_AIRTABLE_API_KEY=your_api_key
     NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id
     NEXT_PUBLIC_AIRTABLE_TABLE_ID=your_table_id
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Structure

The application follows a standard Next.js project structure:

- `/app`: Next.js 14 app directory with page routes
- `/components`: React components, including form sections
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and API integrations
- `/public`: Static assets
- `/styles`: CSS and styling files
- `/types`: TypeScript type definitions

## Components

### Form Components

The main component is `insurance-form.tsx`, which orchestrates the entire form flow:

- **insurance-form.tsx**: The main form container that manages state and form submission.

#### Form Section Components

Located in `/components/form-sections/`, each section handles a specific part of the insurance form:

- **basic-information.tsx**: Basic client details like name, email, etc.
- **health-information.tsx**: Client health history and status
- **insurance-details.tsx**: Insurance plan selection and details
- **personal-details.tsx**: Personal information like SSN, gender, etc.
- **contact-numbers.tsx**: Phone and contact details
- **address-information.tsx**: Client address information
- **dependents-information.tsx**: Information about dependents
- **billing-information.tsx**: Payment and billing details
- **agent-information.tsx**: Agent and administrative information

### UI Components

The `/components/ui/` directory contains reusable UI components based on the Radix UI library and styled with Tailwind CSS:

- Buttons, form controls, dialogs, etc.
- Debug panel for development

## Types

The `/types` directory contains TypeScript interfaces and types for form data:

### form.ts

The main `FormData` interface in `form.ts` defines the structure of the entire form, with nested interfaces for each section. This interface is crucial as it defines the schema for:

- Form validation
- Submission to Airtable
- Type checking throughout the application

When making changes to form fields, you'll need to update the corresponding interfaces in this file.

## Utils and Libraries

### /lib Directory

The `/lib` directory contains utility functions and API integrations:

- **airtable.ts**: Handles communication with Airtable, including data transformation, validation, and submission
- **utils.ts**: General utility functions for formatting and data handling

### Hooks

Custom React hooks are located in the `/hooks` directory:

- **DebugContext.tsx**: Provides a debug mode context for testing and development
- **use-mobile.tsx**: Handles responsive layout detection
- **use-toast.tsx**: Toast notification functionality

## Making Adjustments

### Adding or Modifying Form Fields

1. **Update the type definition**:
   - Edit the appropriate interface in `/types/form.ts`
   - Add the new field with the correct type

2. **Update the form section component**:
   - Locate the relevant section in `/components/form-sections/`
   - Add or modify the form field component
   - Add validation rules if needed

3. **Update Airtable integration**:
   - If the field needs to be submitted to Airtable, update the mapping in `/lib/airtable.ts`

### Adding a New Form Section

1. **Create a new section component**:
   - Create a new file in `/components/form-sections/`
   - Follow the pattern of existing section components

2. **Update the type definition**:
   - Add a new interface to `/types/form.ts`
   - Add the new section to the main `FormData` interface

3. **Integrate into the main form**:
   - Update `insurance-form.tsx` to include the new section
   - Add navigation for the new section

### Styling Changes

The application uses Tailwind CSS for styling:

- Modify the Tailwind config in `tailwind.config.js` for global changes
- Use Tailwind classes directly in components for component-specific styling

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_AIRTABLE_API_KEY`: Airtable API key
- `NEXT_PUBLIC_AIRTABLE_BASE_ID`: Airtable base ID
- `NEXT_PUBLIC_AIRTABLE_TABLE_ID`: Airtable table ID

Copy `.env.example` to `.env` and fill in the values.

## Adding Airtable Fields

If you need to add new fields from Airtable to the form, follow these steps:

### 1. Update Type Definitions

First, add the new field to the appropriate interface in `/types/form.ts`:

```typescript
// Example: Adding a new field to insuranceDetails
export interface FormData {
  // ...
  insuranceDetails?: {
    // ... existing fields
    newAirtableField?: string; // Add the new field here
  };
  // ...
}
```

### 2. Add Form Field Component

Add the field to the appropriate form section component in `/components/form-sections/`:

```tsx
// Example for insuranceDetails.tsx
<FormField
  control={control}
  name="insuranceDetails.newAirtableField"
  render={({ field }) => (
    <FormItem>
      <FormLabel>New Field <sub>[Airtable: New Field]</sub></FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3. Update Airtable Integration

Modify the Airtable submission logic in `/lib/airtable.ts` to include the new field:

1. Find the section that maps form data to Airtable fields
2. Add the mapping for your new field:

```typescript
// Example addition to airtable.ts
// In the transformFormDataToAirtableRecord function:
fields["New Field"] = data.insuranceDetails?.newAirtableField;
```

### 4. Debug Panel (Optional)

If the field should be visible in debug mode, update the debug panel in `/components/ui/debug-panel.tsx`:

```tsx
// Add the field to the appropriate section or to the raw values display
<div>newAirtableField: {JSON.stringify(insuranceDetails?.newAirtableField)}</div>
```

### 5. Testing

After adding the new field:
- Test the form to ensure the field properly accepts input
- Verify the field data is properly submitted to Airtable
- Check that the field appears correctly in the debug panel if applicable 