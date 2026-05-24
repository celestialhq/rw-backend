import z from 'zod';

export const CloudflareAccessSettingsSchema = z.object({
    enabled: z.boolean(),
    teamDomain: z.nullable(z.string()),
    audience: z.nullable(z.string()),
    emailAllowlistEnabled: z.boolean(),
    allowedEmails: z.array(z.string()),
    allowedDomains: z.array(z.string()),
});

export type TCloudflareAccessSettings = z.infer<typeof CloudflareAccessSettingsSchema>;
