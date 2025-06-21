import { DiagnosticInfo } from "./diagnostic";

export interface Output {
  deleteFile(diagnostic: DiagnosticInfo): void;
  done(): void;
}
