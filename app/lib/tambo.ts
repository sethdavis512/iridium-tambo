import { defineTool, type TamboComponent } from '@tambo-ai/react';
import { z } from 'zod';
import { DataTable } from '~/components/DataTable';
import { InfoCard } from '~/components/InfoCard';
import { NotesGallery } from '~/components/NotesGallery';
import { ProsCons } from '~/components/ProsCons';
import { StepList } from '~/components/StepList';

export const createNoteTool = defineTool({
    name: 'create_note',
    description:
        'Create a new note for the user. Use when the user asks to save, remember, or jot down something.',
    inputSchema: z.object({
        title: z.string().describe('A short title for the note'),
        content: z.string().describe('The body content of the note'),
    }),
    tool: async ({ title, content }) => {
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, content }),
        });
        if (!res.ok) throw new Error('Failed to create note');
        return res.json() as Promise<Record<string, unknown>>;
    },
});

export const listNotesTool = defineTool({
    name: 'list_notes',
    description:
        'List all notes for the current user. Use when the user wants to see their notes.',
    inputSchema: z.object({}),
    tool: async () => {
        const res = await fetch('/api/notes', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to list notes');
        return res.json() as Promise<Record<string, unknown>>;
    },
});

export const searchNotesTool = defineTool({
    name: 'search_notes',
    description:
        "Search the user's notes by keyword. Use when the user wants to find a specific note.",
    inputSchema: z.object({
        query: z
            .string()
            .describe('Search term to match against note titles and content'),
    }),
    tool: async ({ query }) => {
        const res = await fetch(`/api/notes?q=${encodeURIComponent(query)}`, {
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to search notes');
        return res.json() as Promise<Record<string, unknown>>;
    },
});

export const components: TamboComponent[] = [
    {
        name: 'InfoCard',
        component: InfoCard,
        description:
            'A highlighted callout card. Use for important notices, tips, warnings, or success messages. Supports variants: info, success, warning, error, tip.',
        propsSchema: z.object({
            title: z.string().optional().describe('Short heading for the card'),
            body: z
                .string()
                .optional()
                .describe('Main content, supports markdown'),
            variant: z
                .enum(['info', 'success', 'warning', 'error', 'tip'])
                .optional()
                .describe('Visual style of the card'),
        }),
    },
    {
        name: 'StepList',
        component: StepList,
        description:
            'An ordered list of steps or tasks. Use for instructions, how-to guides, or process flows. Each step can optionally be marked as complete.',
        propsSchema: z.object({
            title: z
                .string()
                .optional()
                .describe('Heading above the step list'),
            steps: z
                .array(
                    z.object({
                        label: z
                            .string()
                            .optional()
                            .describe('Short step name'),
                        detail: z
                            .string()
                            .optional()
                            .describe('Additional explanation for the step'),
                        done: z
                            .boolean()
                            .optional()
                            .describe('Whether the step is complete'),
                    }),
                )
                .optional()
                .describe('Array of steps to display'),
        }),
    },
    {
        name: 'ProsCons',
        component: ProsCons,
        description:
            'A two-column pros and cons comparison. Use when weighing trade-offs, comparing options, or presenting balanced analysis.',
        propsSchema: z.object({
            title: z.string().optional().describe('Heading for the comparison'),
            pros: z
                .array(z.string())
                .optional()
                .describe('List of positive points'),
            cons: z
                .array(z.string())
                .optional()
                .describe('List of negative points'),
        }),
    },
    {
        name: 'NotesGallery',
        component: NotesGallery,
        description:
            "A grid of the user's notes. Use after listing or searching notes to display them in a visual layout.",
        propsSchema: z.object({
            title: z.string().optional().describe('Heading above the gallery'),
            notes: z
                .array(
                    z.object({
                        title: z.string().optional().describe('Note title'),
                        content: z
                            .string()
                            .optional()
                            .describe('Note body text (truncated if long)'),
                    }),
                )
                .optional()
                .describe('Array of note objects to display'),
        }),
    },
    {
        name: 'DataTable',
        component: DataTable,
        description:
            'A label/value table for structured data. Use for facts, statistics, settings, comparisons with multiple attributes, or any key-value information.',
        propsSchema: z.object({
            title: z.string().optional().describe('Heading above the table'),
            rows: z
                .array(
                    z.object({
                        label: z
                            .string()
                            .optional()
                            .describe('Row label / key'),
                        value: z.string().optional().describe('Row value'),
                    }),
                )
                .optional()
                .describe('Array of label/value rows'),
        }),
    },
];

export const tools = [createNoteTool, listNotesTool, searchNotesTool];
