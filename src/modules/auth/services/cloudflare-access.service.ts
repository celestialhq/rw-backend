import { createPublicKey, type JsonWebKey } from 'node:crypto';
import { catchError, firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { AxiosError } from 'axios';

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { RawCacheService } from '@common/raw-cache';
import { fail, ok, TResult } from '@common/types';
import { TCloudflareAccessSettings } from '@libs/contracts/models';
import { ERRORS } from '@libs/contracts/constants';

interface ICloudflareAccessCert {
    kid: string;
    cert: string;
}

type TCloudflareAccessJwk = {
    kid: string;
} & JsonWebKey;

interface ICloudflareAccessCertsResponse {
    public_certs?: ICloudflareAccessCert[];
    public_cert?: ICloudflareAccessCert;
    keys?: TCloudflareAccessJwk[];
}

interface ICloudflareAccessPayload extends jwt.JwtPayload {
    email?: string;
}

@Injectable()
export class CloudflareAccessService {
    private readonly logger = new Logger(CloudflareAccessService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly rawCacheService: RawCacheService,
    ) {}

    public async validateAssertion(
        assertion: string | undefined,
        settings: TCloudflareAccessSettings,
    ): Promise<TResult<{ email: string }>> {
        try {
            if (!assertion) {
                return fail(ERRORS.FORBIDDEN);
            }

            if (!settings.enabled || !settings.teamDomain || !settings.audience) {
                return fail(ERRORS.FORBIDDEN);
            }

            const teamDomain = this.normalizeTeamDomain(settings.teamDomain);
            const decoded = jwt.decode(assertion, { complete: true });

            if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
                return fail(ERRORS.FORBIDDEN);
            }

            const cert = await this.getCertByKeyId(teamDomain, decoded.header.kid);

            if (!cert) {
                return fail(ERRORS.FORBIDDEN);
            }

            const payload = jwt.verify(assertion, cert, {
                algorithms: ['RS256'],
                audience: settings.audience,
                issuer: `https://${teamDomain}`,
            }) as ICloudflareAccessPayload;

            if (!payload.email) {
                return fail(ERRORS.FORBIDDEN);
            }

            if (!this.isEmailAllowed(payload.email, settings)) {
                return fail(ERRORS.FORBIDDEN);
            }

            return ok({ email: payload.email });
        } catch (error) {
            this.logger.warn(
                `Cloudflare Access assertion validation failed: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            );
            return fail(ERRORS.FORBIDDEN);
        }
    }

    private normalizeTeamDomain(teamDomain: string): string {
        return teamDomain
            .trim()
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '')
            .toLowerCase();
    }

    private async getCertByKeyId(teamDomain: string, keyId: string): Promise<string | null> {
        const cacheKey = `cloudflare-access:${teamDomain}:certs`;
        const cachedCerts = await this.rawCacheService.get<ICloudflareAccessCert[]>(cacheKey);
        const certs = cachedCerts ?? (await this.fetchCerts(teamDomain));

        if (!cachedCerts && certs.length > 0) {
            await this.rawCacheService.set(cacheKey, certs, 3600);
        }

        return certs.find((cert) => cert.kid === keyId)?.cert ?? null;
    }

    private async fetchCerts(teamDomain: string): Promise<ICloudflareAccessCert[]> {
        const { data } = await firstValueFrom(
            this.httpService
                .get<ICloudflareAccessCertsResponse>(`https://${teamDomain}/cdn-cgi/access/certs`, {
                    headers: {
                        'User-Agent': 'Remnawave',
                    },
                })
                .pipe(
                    catchError((error: AxiosError) => {
                        throw error.response?.data ?? error;
                    }),
                ),
        );

        if (Array.isArray(data.public_certs)) {
            return data.public_certs;
        }

        if (data.public_cert) {
            return [data.public_cert];
        }

        if (Array.isArray(data.keys)) {
            return data.keys.map((key) => ({
                kid: key.kid,
                cert: createPublicKey({ key, format: 'jwk' }).export({
                    format: 'pem',
                    type: 'spki',
                }) as string,
            }));
        }

        return [];
    }

    private isEmailAllowed(email: string, settings: TCloudflareAccessSettings): boolean {
        if (!settings.emailAllowlistEnabled) {
            return true;
        }

        const normalizedEmail = email.toLowerCase();
        const emailDomain = normalizedEmail.split('@')[1];

        if (!emailDomain) {
            return false;
        }

        const allowedEmails = settings.allowedEmails.map((allowedEmail) =>
            allowedEmail.toLowerCase(),
        );
        const allowedDomains = settings.allowedDomains.map((allowedDomain) =>
            allowedDomain.toLowerCase(),
        );

        return allowedEmails.includes(normalizedEmail) || allowedDomains.includes(emailDomain);
    }
}
