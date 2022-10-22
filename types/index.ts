export enum Actions {
  GetSession = 'get-session',
  CreateSession = 'create-session',
  NewRound = 'new-round',
  FinishSetupSession = 'finish-setup-session',
  JoinSession = 'join-session',
  RevealSession = 'reveal-session',
  PickCard = 'pick-card',
}

export type Data = {
  id: string;
  name: string;
  creating: boolean;
  revealed: boolean;
  creator_id: string;
  cards: Card[];
  users: User[];
};

export type Card = {
  id: string;
  text: string;
  value: number;
};

export type User = {
  id: string;
  name: string;
  played_card?: Card;
};
