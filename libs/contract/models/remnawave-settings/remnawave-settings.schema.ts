import { z } from 'zod';

import { CloudflareAccessSettingsSchema } from './cloudflare-access-settings.schema';
import { PasswordAuthSettingsSchema } from './password-auth-settings.schema';
import { BrandingSettingsSchema } from './branding-settings.schema';
import { PasskeySettingsSchema } from './passkey-settings.schema';
import { Oauth2SettingsSchema } from './oauth2-settings.schema';

export const RemnawaveSettingsSchema = z.object({
    passkeySettings: z.nullable(PasskeySettingsSchema),
    oauth2Settings: z.nullable(Oauth2SettingsSchema),
    passwordSettings: z.nullable(PasswordAuthSettingsSchema),
    cloudflareAccessSettings: z.nullable(CloudflareAccessSettingsSchema),
    brandingSettings: z.nullable(BrandingSettingsSchema),
});

export type TRemnawaveSettings = z.infer<typeof RemnawaveSettingsSchema>;
