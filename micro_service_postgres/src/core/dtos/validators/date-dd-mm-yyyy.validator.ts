import { registerDecorator, ValidationOptions } from "class-validator";

const DD_MM_YYYY = /^(\d{2})-(\d{2})-(\d{4})$/;

/**
 * "15-08-2005" -> Date (UTC midnight). Returns null when the text is not in
 * DD-MM-YYYY format or is not a real calendar date (e.g. "31-02-2005").
 */
export function parseDdMmYyyy(value: unknown): Date | null {
  if (typeof value !== "string") return null;

  const match = DD_MM_YYYY.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  // JavaScript silently rolls 31-02 over to 03-03, so read the parts back.
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return isRealDate ? date : null;
}

/** Validates a DD-MM-YYYY date string that is a real date and not in the future. */
export function IsPastDateDdMmYyyy(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isPastDateDdMmYyyy",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          const date = parseDdMmYyyy(value);
          return date !== null && date.getTime() <= Date.now();
        },
        defaultMessage(args) {
          return parseDdMmYyyy(args.value)
            ? `${args.property} cannot be in the future`
            : `${args.property} must be a valid date in DD-MM-YYYY format (e.g. 15-08-2005)`;
        },
      },
    });
  };
}
