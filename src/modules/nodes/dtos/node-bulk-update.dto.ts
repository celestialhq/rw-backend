import { BulkNodesUpdateCommand } from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class BulkNodesUpdateBodyDto extends createZodDto(
    BulkNodesUpdateCommand.RequestBodySchema,
) {}
export class BulkNodesUpdateResponseDto extends createZodDto(
    BulkNodesUpdateCommand.ResponseSchema,
) {}
