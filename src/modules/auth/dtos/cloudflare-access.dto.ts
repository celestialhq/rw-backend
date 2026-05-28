import { createZodDto } from 'nestjs-zod';

import { CloudflareAccessCommand } from '@libs/contracts/commands';

export class CloudflareAccessResponseDto extends createZodDto(
    CloudflareAccessCommand.ResponseSchema,
) {}
