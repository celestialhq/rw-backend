import { createZodDto } from 'nestjs-zod';

import { AddUsersToExternalSquadCommand } from '@libs/contracts/commands';

export class AddUsersToExternalSquadParamDto extends createZodDto(
    AddUsersToExternalSquadCommand.RequestParamSchema,
) {}

export class AddUsersToExternalSquadResponseDto extends createZodDto(
    AddUsersToExternalSquadCommand.ResponseSchema,
) {}
