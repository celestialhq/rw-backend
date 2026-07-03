import { createZodDto } from 'nestjs-zod';

import { DeleteInternalSquadCommand } from '@libs/contracts/commands';

export class DeleteInternalSquadParamDto extends createZodDto(
    DeleteInternalSquadCommand.RequestParamSchema,
) {}

export class DeleteInternalSquadResponseDto extends createZodDto(
    DeleteInternalSquadCommand.ResponseSchema,
) {}
