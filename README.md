# MyHomeManager - Family Task Management Application

MyHomeManager is a modern web application designed to help families organize and manage their daily tasks, groceries, expenses, and reminders. Built with React, TypeScript, and Supabase, it provides a seamless experience for family collaboration.

## Features

### 🏠 Dashboard
- Overview of all family activities
- Quick access to important tasks and reminders

### 👥 Family Management
- Create and manage family groups
- Invite family members
- Assign roles (admin/member)
- View pending invitations
- Manage member permissions

### ✅ Chores
- Create and assign chores
- Set due dates and priorities
- Track completion status
- Sort by due date and priority

### 🛒 Groceries
- Maintain shared shopping lists
- Add items with quantities
- Categorize items
- Mark items as purchased

### 💰 Expenses
- Track family expenses
- Categorize spending
- Share bills and receipts
- Monitor budget

### ⏰ Reminders
- Set family-wide reminders
- Receive notifications
- Never miss important dates

### 👤 Profile Management
- Customize display name
- Manage account settings
- View and update personal information

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **State Management**: React Query
- **Routing**: React Router
- **Form Handling**: React Hook Form
- **Notifications**: Web Push Notifications

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myhomemanager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── components/         # Reusable UI components
├── lib/               # Utilities and services
│   ├── auth/         # Authentication logic
│   ├── hooks/        # Custom React hooks
│   └── services/     # API services
├── pages/            # Application pages
├── styles/           # Global styles
└── types/            # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
