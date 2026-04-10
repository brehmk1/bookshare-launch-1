import { z } from "zod";

export const authSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["author", "reader"]),
});

export const loginSchema = authSchema.pick({
  email: true,
  password: true,
});

export const workSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(20).max(3000),
  genre: z.string().trim().min(2).max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  excerptText: z.string().trim().min(40).max(10000),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  visibility: z.enum(["public", "private"]),
  status: z.enum(["draft", "published"]),
  featuredFlag: z.boolean(),
});

export const requestSchema = z.object({
  workId: z.string().uuid(),
  message: z.string().trim().max(600).optional().or(z.literal("")),
});

export const requestResponseSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["approved", "denied"]),
  responseMessage: z.string().trim().max(600).optional().or(z.literal("")),
});
