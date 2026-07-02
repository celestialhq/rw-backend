import { Request } from 'express';

export interface HwidHeaders {
    hwid: string;
    platform?: string;
    osVersion?: string;
    deviceModel?: string;
    userAgent?: string;
}

export function extractHwidHeaders(request: Request): HwidHeaders | null {
    const rawHwid = request.headers['x-hwid'];
    const hwid = (Array.isArray(rawHwid) ? rawHwid[0] : rawHwid)?.trim();

    if (!hwid || hwid.length < 6) {
        return null;
    }

    return {
        hwid,
        platform: request.headers['x-device-os'] as string | undefined,
        osVersion: request.headers['x-ver-os'] as string | undefined,
        deviceModel: request.headers['x-device-model'] as string | undefined,
        userAgent: request.headers['user-agent'] as string | undefined,
    };
}
