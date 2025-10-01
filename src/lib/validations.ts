import { z } from "zod";

// Authentication validation schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Inventory validation schema
export const inventoryItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(100, "Name too long"),
  sku: z.string().trim().min(1, "SKU is required").max(50, "SKU too long"),
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
  category: z.string().min(1, "Category is required"),
  minStock: z.number().int().min(0, "Min stock must be 0 or greater").optional(),
});

// Expense validation schema
export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(500, "Description too long").optional(),
  date: z.date(),
});

// Supplier validation schema
export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number too long").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

// Password strength calculator
export const calculatePasswordStrength = (password: string): { 
  strength: number; 
  label: string; 
  color: string;
} => {
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = ["hsl(var(--destructive))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--success))"];
  
  return {
    strength: (strength / 6) * 100,
    label: labels[Math.max(0, strength - 1)] || "Very Weak",
    color: colors[Math.max(0, strength - 1)] || colors[0],
  };
};
