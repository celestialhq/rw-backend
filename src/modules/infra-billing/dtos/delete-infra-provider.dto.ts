import { createZodDto } from 'nestjs-zod';

import { DeleteInfraProviderCommand } from '@libs/contracts/commands';

export class DeleteInfraProviderParamDto extends createZodDto(
    DeleteInfraProviderCommand.RequestParamSchema,
) {}

export class DeleteInfraProviderResponseDto extends createZodDto(
    DeleteInfraProviderCommand.ResponseSchema,
) {}
