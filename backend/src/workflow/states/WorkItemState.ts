export type Status = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface IWorkItemState {
  next(): Status;
  label(): Status;
}

export class OpenState implements IWorkItemState {
  next(): Status { return 'INVESTIGATING'; }
  label(): Status { return 'OPEN'; }
}

export class InvestigatingState implements IWorkItemState {
  next(): Status { return 'RESOLVED'; }
  label(): Status { return 'INVESTIGATING'; }
}

export class ResolvedState implements IWorkItemState {
  next(): Status { return 'CLOSED'; }
  label(): Status { return 'RESOLVED'; }
}

export class ClosedState implements IWorkItemState {
  next(): Status { return 'CLOSED'; }
  label(): Status { return 'CLOSED'; }
}

export const getState = (status: Status): IWorkItemState => {
  switch (status) {
    case 'OPEN': return new OpenState();
    case 'INVESTIGATING': return new InvestigatingState();
    case 'RESOLVED': return new ResolvedState();
    case 'CLOSED': return new ClosedState();
  }
};
