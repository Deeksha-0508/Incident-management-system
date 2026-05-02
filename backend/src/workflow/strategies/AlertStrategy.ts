export interface IAlertStrategy {
  notify(componentId: string, message: string): void;
  priority(): string;
}

export class P0AlertStrategy implements IAlertStrategy {
  priority() { return 'P0'; }
  notify(componentId: string, message: string) {
    console.log(`🚨 [P0 CRITICAL] ${componentId}: ${message}`);
  }
}

export class P1AlertStrategy implements IAlertStrategy {
  priority() { return 'P1'; }
  notify(componentId: string, message: string) {
    console.log(`🔴 [P1 HIGH] ${componentId}: ${message}`);
  }
}

export class P2AlertStrategy implements IAlertStrategy {
  priority() { return 'P2'; }
  notify(componentId: string, message: string) {
    console.log(`🟡 [P2 MEDIUM] ${componentId}: ${message}`);
  }
}

export const getAlertStrategy = (componentId: string): IAlertStrategy => {
  if (componentId.includes('RDBMS') || componentId.includes('DB')) return new P0AlertStrategy();
  if (componentId.includes('API') || componentId.includes('MCP')) return new P1AlertStrategy();
  return new P2AlertStrategy();
};
