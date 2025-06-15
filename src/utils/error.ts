export class CliError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "CliError";
  }
}

export class CliResultError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "CliResultError";
  }
}
