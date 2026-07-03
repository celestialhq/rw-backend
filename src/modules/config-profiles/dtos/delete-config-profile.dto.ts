import { createZodDto } from 'nestjs-zod';

import { DeleteConfigProfileCommand } from '@libs/contracts/commands';

export class DeleteConfigProfileParamDto extends createZodDto(
    DeleteConfigProfileCommand.RequestParamSchema,
) {}
export class DeleteConfigProfileResponseDto extends createZodDto(
    DeleteConfigProfileCommand.ResponseSchema,
) {}
