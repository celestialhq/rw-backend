import { z } from 'zod';

import { IP_CONTROL_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';

export namespace FetchUsersIpsCommand {
    export const url = REST_API.IP_CONTROL.FETCH_USERS_IPS;
    export const TSQ_url = url(':nodeUuid');

    export const endpointDetails = getEndpointDetails(
        IP_CONTROL_ROUTES.FETCH_USERS_IPS(':nodeUuid'),
        'post',
        'Request Users IPs List for Node',
        { scope: 'fetch-users-ips', kind: 'read' },
    );

    export const RequestParamSchema = z.object({
        nodeUuid: z.string().uuid().describe('Node UUID'),
    });

    export const ResponseSchema = z.object({
        response: z.object({
            jobId: z.string(),
        }),
    });

    export type RequestParam = z.infer<typeof RequestParamSchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}
