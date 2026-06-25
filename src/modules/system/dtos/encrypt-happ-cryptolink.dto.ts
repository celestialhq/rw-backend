import { EncryptHappCryptoLinkCommand } from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class EncryptHappCryptoLinkRequestDto extends createZodDto(
    EncryptHappCryptoLinkCommand.RequestSchema,
) {}

export class EncryptHappCryptoLinkResponseDto extends createZodDto(
    EncryptHappCryptoLinkCommand.ResponseSchema,
) {}
