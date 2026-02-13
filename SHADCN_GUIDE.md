# shadcn/ui Component Guide - Ulevha

This project uses **shadcn/ui** for building consistent, reusable UI components. All components are built with React, Tailwind CSS, and Radix UI primitives.

## Installed Components

### Core Components
- **Button** - Action buttons with variants
- **Card** - Card container for content sections
- **Input** - Text input field with validation support
- **Label** - Form labels
- **Form** - React Hook Form integration for complex forms

### Data Display
- **Table** - Responsive data table component
- **Badge** - Status badges and tags
- **Avatar** - User avatars with fallbacks

### Navigation
- **Tabs** - Tab navigation interface
- **Dropdown Menu** - Dropdown menu component
- **Select** - Dropdown select field

### Dialogs & Overlays
- **Dialog** - Modal dialog component
- **Alert Dialog** - Confirmation dialogs

### Form Controls
- **Checkbox** - Checkbox control

## Usage Examples

### Button
```jsx
import { Button } from "@/components/ui/button"

export function MyComponent() {
  return (
    <>
      <Button>Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="ghost">Ghost</Button>
      <Button disabled>Disabled</Button>
    </>
  )
}
```

### Card
```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your content here */}
      </CardContent>
    </Card>
  )
}
```

### Form with React Hook Form
```jsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UserForm() {
  const form = useForm()

  function onSubmit(values) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create User</Button>
      </form>
    </Form>
  )
}
```

### Table
```jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function UserTable({ users }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Dialog
```jsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function UserDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system
          </DialogDescription>
        </DialogHeader>
        {/* Form content here */}
      </DialogContent>
    </Dialog>
  )
}
```

### Badge
```jsx
import { Badge } from "@/components/ui/badge"

export function UserBadge() {
  return (
    <>
      <Badge>Admin</Badge>
      <Badge variant="secondary">Staff</Badge>
      <Badge variant="destructive">Inactive</Badge>
      <Badge variant="outline">Pending</Badge>
    </>
  )
}
```

### Tabs
```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminTabs() {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="logs">Audit Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        {/* Users content */}
      </TabsContent>
      <TabsContent value="settings">
        {/* Settings content */}
      </TabsContent>
      <TabsContent value="logs">
        {/* Audit logs content */}
      </TabsContent>
    </Tabs>
  )
}
```

### Alert Dialog
```jsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteUserDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete User</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialog>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialog>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

## Adding More Components

To add more shadcn components to the project:

```bash
npx shadcn@latest add [component-name]
```

Recommended components to add later:
- `scroll-area` - Scrollable content areas
- `pagination` - Pagination controls
- `search` - Search input
- `tooltip` - Tooltips
- `popover` - Popover menu
- `slider` - Slider control
- `chart` - Chart visualization
- `toast` - Toast notifications
- `command` - Command menu/palette

## File Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── form.jsx
│   │   ├── input.jsx
│   │   ├── table.jsx
│   │   └── ... (other UI components)
│   ├── layout/          # Layout components (create as needed)
│   └── features/        # Feature-specific components (create as needed)
├── lib/
│   └── utils.js         # Utility functions (includes cn() helper)
└── ...
```

## Styling Guidelines

### Using the `cn()` utility
shadcn provides a `cn()` utility function for merging Tailwind classes:

```jsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MyButton() {
  const isActive = true
  return (
    <Button className={cn("w-full", isActive && "bg-blue-600")}>
      Click me
    </Button>
  )
}
```

### Customizing Components
All shadcn components can be customized by editing the files in `src/components/ui/`:

```jsx
// Example: Customize button in src/components/ui/button.jsx
// Modify the defaultVariants or add new variants
```

## Best Practices

1. **Import from `@/components/ui`** - Use the path alias for cleaner imports
2. **Use composition** - Build complex components from simpler ones
3. **Keep components focused** - One responsibility per component
4. **Leverage Tailwind** - Extend styling with Tailwind classes
5. **Use semantic HTML** - Components use proper HTML elements
6. **Accessibility first** - shadcn components are WCAG compliant

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Last Updated**: February 13, 2026
