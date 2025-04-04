# Component Documentation

## Layout Components

### AppLayout
The main layout component that provides the application structure.

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}
```

Features:
- Responsive navigation bar
- User profile menu
- Theme toggle
- Mobile-friendly design

### ProtectedLayout
Wrapper component for authenticated routes.

```typescript
interface ProtectedLayoutProps {
  children: React.ReactNode;
}
```

Features:
- Authentication check
- Redirects to login if not authenticated
- Preserves intended destination

## Authentication Components

### LoginForm
Form component for user authentication.

```typescript
interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  isLoading?: boolean;
}
```

Features:
- Email and password validation
- Loading state
- Error handling
- Remember me option

### SignupForm
Form component for user registration.

```typescript
interface SignupFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  isLoading?: boolean;
}
```

Features:
- Email and password validation
- Terms acceptance checkbox
- Loading state
- Error handling

## Feature Components

### ChoreList
Displays a list of chores with filtering and sorting options.

```typescript
interface ChoreListProps {
  chores: Chore[];
  onStatusChange: (id: string, status: ChoreStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}
```

Features:
- Status filtering
- Due date sorting
- Responsive grid layout
- Empty state handling

### GroceryList
Manages grocery shopping lists.

```typescript
interface GroceryListProps {
  list: GroceryList;
  onItemToggle: (itemId: string) => void;
  onItemAdd: (item: GroceryItem) => void;
  onItemDelete: (itemId: string) => void;
}
```

Features:
- Item quantity management
- Purchase status tracking
- Category grouping
- Search functionality

### ExpenseTracker
Tracks and visualizes household expenses.

```typescript
interface ExpenseTrackerProps {
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, expense: Partial<Expense>) => void;
}
```

Features:
- Category-based filtering
- Date range selection
- Expense charts
- Export functionality

## UI Components

### Button
Reusable button component with variants.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}
```

### Input
Form input component with validation.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}
```

### Card
Container component for content sections.

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
```

Features:
- Consistent spacing
- Shadow effects
- Border radius options
- Header and footer slots

### Modal
Dialog component for overlays.

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

Features:
- Keyboard navigation
- Focus trapping
- Animation
- Backdrop click to close

## Utility Components

### LoadingSpinner
Indicates loading state.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### ErrorBoundary
Catches and handles React errors.

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

### Toast
Displays temporary notifications.

```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
```

## Best Practices

1. **Component Organization**
   - Group related components in feature directories
   - Keep components small and focused
   - Use composition over inheritance

2. **Props Design**
   - Use TypeScript interfaces
   - Provide sensible defaults
   - Document required props
   - Use prop spreading carefully

3. **State Management**
   - Lift state up when needed
   - Use local state for UI-only state
   - Consider context for global state
   - Implement proper loading states

4. **Performance**
   - Memoize expensive computations
   - Use React.memo for pure components
   - Implement proper key props
   - Lazy load heavy components

5. **Accessibility**
   - Use semantic HTML
   - Implement ARIA attributes
   - Ensure keyboard navigation
   - Test with screen readers 