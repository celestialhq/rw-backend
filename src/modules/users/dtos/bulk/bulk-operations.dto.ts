import { createZodDto } from 'nestjs-zod';

import {
    BulkAllExtendExpirationDateCommand,
    BulkAllResetTrafficUsersCommand,
    BulkAllUpdateUsersCommand,
    BulkDeleteUsersCommand,
    BulkExtendExpirationDateCommand,
    BulkResetTrafficUsersCommand,
    BulkRevokeUsersSubscriptionCommand,
    BulkUpdateUsersCommand,
    BulkUpdateUsersSquadsCommand,
} from '@libs/contracts/commands';

export class BulkResetTrafficUsersBodyDto extends createZodDto(
    BulkResetTrafficUsersCommand.RequestBodySchema,
) {}
export class BulkResetTrafficUsersResponseDto extends createZodDto(
    BulkResetTrafficUsersCommand.ResponseSchema,
) {}

export class BulkRevokeUsersSubscriptionBodyDto extends createZodDto(
    BulkRevokeUsersSubscriptionCommand.RequestBodySchema,
) {}
export class BulkRevokeUsersSubscriptionResponseDto extends createZodDto(
    BulkRevokeUsersSubscriptionCommand.ResponseSchema,
) {}

export class BulkDeleteUsersBodyDto extends createZodDto(
    BulkDeleteUsersCommand.RequestBodySchema,
) {}
export class BulkDeleteUsersResponseDto extends createZodDto(
    BulkDeleteUsersCommand.ResponseSchema,
) {}

export class BulkUpdateUsersBodyDto extends createZodDto(
    BulkUpdateUsersCommand.RequestBodySchema,
) {}
export class BulkUpdateUsersResponseDto extends createZodDto(
    BulkUpdateUsersCommand.ResponseSchema,
) {}

export class BulkUpdateUsersSquadsBodyDto extends createZodDto(
    BulkUpdateUsersSquadsCommand.RequestBodySchema,
) {}
export class BulkUpdateUsersSquadsResponseDto extends createZodDto(
    BulkUpdateUsersSquadsCommand.ResponseSchema,
) {}

export class BulkAllUpdateUsersBodyDto extends createZodDto(
    BulkAllUpdateUsersCommand.RequestBodySchema,
) {}
export class BulkAllUpdateUsersResponseDto extends createZodDto(
    BulkAllUpdateUsersCommand.ResponseSchema,
) {}

export class BulkAllResetTrafficUsersResponseDto extends createZodDto(
    BulkAllResetTrafficUsersCommand.ResponseSchema,
) {}

export class BulkAllExtendExpirationDateBodyDto extends createZodDto(
    BulkAllExtendExpirationDateCommand.RequestBodySchema,
) {}
export class BulkAllExtendExpirationDateResponseDto extends createZodDto(
    BulkAllExtendExpirationDateCommand.ResponseSchema,
) {}

export class BulkExtendExpirationDateBodyDto extends createZodDto(
    BulkExtendExpirationDateCommand.RequestBodySchema,
) {}
export class BulkExtendExpirationDateResponseDto extends createZodDto(
    BulkExtendExpirationDateCommand.ResponseSchema,
) {}
