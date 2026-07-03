import { createZodDto } from 'nestjs-zod';

import { DeleteUsersFromInternalSquadCommand } from '@libs/contracts/commands';

export class RemoveUsersFromInternalSquadParamDto extends createZodDto(
    DeleteUsersFromInternalSquadCommand.RequestParamSchema,
) {}

export class RemoveUsersFromInternalSquadResponseDto extends createZodDto(
    DeleteUsersFromInternalSquadCommand.ResponseSchema,
) {}
