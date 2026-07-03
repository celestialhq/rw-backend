import { createZodDto } from 'nestjs-zod';

import { DeleteUsersFromExternalSquadCommand } from '@libs/contracts/commands';

export class RemoveUsersFromExternalSquadParamDto extends createZodDto(
    DeleteUsersFromExternalSquadCommand.RequestParamSchema,
) {}

export class RemoveUsersFromExternalSquadResponseDto extends createZodDto(
    DeleteUsersFromExternalSquadCommand.ResponseSchema,
) {}
