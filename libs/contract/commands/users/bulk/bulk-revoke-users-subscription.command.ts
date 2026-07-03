import { z } from 'zod';

import { REST_API, USERS_ROUTES } from '../../../api';
import { getEndpointDetails } from '../../../constants';

export namespace BulkRevokeUsersSubscriptionCommand {
    export const url = REST_API.USERS.BULK.REVOKE_SUBSCRIPTION;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        USERS_ROUTES.BULK.REVOKE_SUBSCRIPTION,
        'post',
        'Revoke users subscription by User UUIDs',
        { scope: 'bulk-revoke-subscription', kind: 'write' },
    );

    export const RequestBodySchema = z.object({
        uuids: z
            .array(z.string().uuid())
            .min(1, 'Must be at least 1 user UUID')
            .max(500, 'Maximum 500 user UUIDs'),
    });

    export type RequestBody = z.infer<typeof RequestBodySchema>;
}
