import { z } from 'zod';

import { getEndpointDetails } from '../../constants';
import { AUTH_ROUTES, REST_API } from '../../api';

export namespace CloudflareAccessCommand {
    export const url = REST_API.AUTH.CLOUDFLARE_ACCESS;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        AUTH_ROUTES.CLOUDFLARE_ACCESS,
        'post',
        'Login with Cloudflare Access',
        { scope: 'cloudflare-access', kind: 'write' },
    );

    export const RequestSchema = z.object({});

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            accessToken: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
