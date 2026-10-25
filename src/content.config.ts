import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const SPINES = ['blue', 'red', 'green', 'purple', 'teal', 'orange'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        order: z.number().int().min(1),
        title: z.string(),
        spine: z.enum(SPINES),
        tier: z.enum(['full', 'light']),
        genre: z.string(),
        engine: z.string(),
        platform: z.string(),
        role: z.string(),
        status: z.string(),
        dates: z.string().optional(),
        client: z.string().optional(),
        team: z.string().optional(),
        oneLine: z.string(),
        tagline: z.string().optional(),
        cover: image().optional(),
        videos: z.array(z.object({ youtubeId: z.string().regex(/^[\w-]{11}$/), title: z.string() })).default([]),
        links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
        facts: z.array(z.string()).default([]),
        features: z.array(z.string()).default([]),
        tools: z.array(z.string()).default([]),
        chips: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              problem: z.string(),
              approach: z.string(),
              result: z.string(),
              still: image().optional(),
            }),
          )
          .default([]),
        credits: z
          .object({
            mine: z.array(z.string()).default([]),
            team: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
          })
          .default({ mine: [], team: [] }),
      })
      .refine((p) => p.tier === 'light' || p.chips.length >= 4, { message: 'full-tier projects need at least 4 chips' }),
});

export const collections = { projects };
