import { RemnawaveSettings } from '@prisma/client';

import {
    TBrandingSettings,
    TCloudflareAccessSettings,
    TOauth2Settings,
    TPasswordAuthSettings,
    TRemnawavePasskeySettings,
} from '@libs/contracts/models';

export class RemnawaveSettingsEntity implements RemnawaveSettings {
    public id: number;
    public passkeySettings: TRemnawavePasskeySettings;
    public oauth2Settings: TOauth2Settings;
    public passwordSettings: TPasswordAuthSettings;
    public cloudflareAccessSettings: TCloudflareAccessSettings;
    public brandingSettings: TBrandingSettings;

    constructor(remnawaveSettings: Partial<RemnawaveSettings>) {
        Object.assign(this, remnawaveSettings);
        return this;
    }
}
