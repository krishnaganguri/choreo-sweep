# API Documentation

## Authentication

### Sign Up
```typescript
POST /auth/signup
```
Request body:
```typescript
{
  email: string;
  password: string;
}
```
Response:
```typescript
{
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}
```

### Sign In
```typescript
POST /auth/signin
```
Request body:
```typescript
{
  email: string;
  password: string;
}
```
Response:
```typescript
{
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}
```

### Sign Out
```typescript
POST /auth/signout
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```

## Chores

### Get All Chores
```typescript
GET /chores
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Response:
```typescript
{
  chores: Array<{
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: 'pending' | 'completed' | 'overdue';
    assigned_to: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  }>;
}
```

### Create Chore
```typescript
POST /chores
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Request body:
```typescript
{
  title: string;
  description: string;
  due_date: string;
  assigned_to: string;
}
```

### Update Chore
```typescript
PATCH /chores/:id
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Request body:
```typescript
{
  title?: string;
  description?: string;
  due_date?: string;
  status?: 'pending' | 'completed' | 'overdue';
  assigned_to?: string;
}
```

### Delete Chore
```typescript
DELETE /chores/:id
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```

## Grocery Lists

### Get All Lists
```typescript
GET /grocery-lists
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Response:
```typescript
{
  lists: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      purchased: boolean;
    }>;
    created_by: string;
    created_at: string;
    updated_at: string;
  }>;
}
```

### Create List
```typescript
POST /grocery-lists
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Request body:
```typescript
{
  name: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}
```

### Update List
```typescript
PATCH /grocery-lists/:id
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Request body:
```typescript
{
  name?: string;
  items?: Array<{
    id?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    purchased?: boolean;
  }>;
}
```

## Expenses

### Get All Expenses
```typescript
GET /expenses
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Response:
```typescript
{
  expenses: Array<{
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  }>;
}
```

### Create Expense
```typescript
POST /expenses
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Request body:
```typescript
{
  amount: number;
  description: string;
  category: string;
  date: string;
}
```

### Update Expense
```typescript
PATCH /expenses/:id
```
Headers:
```typescript
{
  Authorization: `Bearer ${access_token}`
}
```
Request body:
```typescript
{
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}
```

## Error Responses

All API endpoints may return the following error responses:

```typescript
{
  error: {
    code: string;
    message: string;
    status: number;
  }
}
```

Common error codes:
- `401`: Unauthorized - Invalid or missing authentication token
- `403`: Forbidden - User does not have permission to access the resource
- `404`: Not Found - Resource does not exist
- `422`: Unprocessable Entity - Invalid request data
- `500`: Internal Server Error - Server-side error 