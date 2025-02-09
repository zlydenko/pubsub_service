import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import { EnvironmentVariablesDto } from "./config.dto";
import { DEFAULT_CONFIG } from "./config.constants";

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariablesDto, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    Object.keys(DEFAULT_CONFIG).forEach((key) => {
        if (!(key in config)) {
            console.warn(`⚠️ Warning: ${key} is not set. Using default value: ${DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG]}`);
        }
    });

    if (errors.length > 0) {
        throw new Error(`❌ Invalid environment variables: ${errors}`);
    }

    return validatedConfig;
}