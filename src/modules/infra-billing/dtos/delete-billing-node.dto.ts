import { createZodDto } from 'nestjs-zod';

import { DeleteInfraBillingNodeCommand } from '@libs/contracts/commands';

export class DeleteInfraBillingNodeParamDto extends createZodDto(
    DeleteInfraBillingNodeCommand.RequestParamSchema,
) {}

export class DeleteInfraBillingNodeResponseDto extends createZodDto(
    DeleteInfraBillingNodeCommand.ResponseSchema,
) {}
