import { createZodDto } from 'nestjs-zod';

import { RevokeUserSubscriptionCommand } from '@libs/contracts/commands';

export class RevokeUserSubscriptionParamDto extends createZodDto(
    RevokeUserSubscriptionCommand.RequestParamSchema,
) {}
export class RevokeUserSubscriptionResponseDto extends createZodDto(
    RevokeUserSubscriptionCommand.ResponseSchema,
) {}

export class RevokeUserSubscriptionBodyDto extends createZodDto(
    RevokeUserSubscriptionCommand.RequestBodySchema,
) {}
