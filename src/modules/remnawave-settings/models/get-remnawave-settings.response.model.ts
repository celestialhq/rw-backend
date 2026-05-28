import {
    TBrandingSettings,
    TCloudflareAccessSettings,
    TOauth2Settings,
    TPasswordAuthSettings,
    TRemnawavePasskeySettings,
} from '@libs/contracts/models';

import { RemnawaveSettingsEntity } from '../entities';

export class RemnawaveSettingsResponseModel {
    public passkeySettings: TRemnawavePasskeySettings;
    public oauth2Settings: TOauth2Settings;
    public passwordSettings: TPasswordAuthSettings;
    public cloudflareAccessSettings: TCloudflareAccessSettings;
    public brandingSettings: TBrandingSettings;

    constructor(entity: RemnawaveSettingsEntity) {
        this.passkeySettings = entity.passkeySettings;
        this.oauth2Settings = entity.oauth2Settings;
        this.passwordSettings = entity.passwordSettings;
        this.cloudflareAccessSettings = entity.cloudflareAccessSettings;
        this.brandingSettings = entity.brandingSettings;
    }
}
