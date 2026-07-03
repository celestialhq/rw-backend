import { z } from 'zod';

import { HOSTS_ROUTES, REST_API } from '../../../api';
import { getEndpointDetails } from '../../../constants';
import { HostsSchema } from '../../../models';

export namespace BulkEnableHostsCommand {
    export const url = REST_API.HOSTS.BULK.ENABLE_HOSTS;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        HOSTS_ROUTES.BULK.ENABLE_HOSTS,
        'post',
        'Enable hosts by UUIDs',
        { scope: 'bulk-enable', kind: 'write' },
    );

    export const RequestBodySchema = z.object({
        uuids: z.array(z.string().uuid()),
    });

    export const ResponseSchema = z.object({
        response: z.array(HostsSchema),
    });

    export type RequestBody = z.infer<typeof RequestBodySchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}
